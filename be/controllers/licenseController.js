const { License, Software, SoftwareVersion, OrderLicense, db } = require("../models");
const { Op } = require("sequelize");

const getAllLicenses = async (req, res) => {
  try {
    const licenses = await License.findAll({
      include: [
        { model: Software, attributes: ["name"] },
        { model: SoftwareVersion, attributes: ["version", "os"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json(licenses);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const getLicenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const license = await License.findByPk(id, {
      include: [
        { model: Software, attributes: ["name"] },
        { model: SoftwareVersion, attributes: ["version", "os"] },
      ],
    });

    if (!license) {
      return res.status(404).json({ message: "Lisensi tidak ditemukan" });
    }

    return res.status(200).json(license);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const createLicense = async (req, res) => {
  try {
    const { software_id, license_key, software_version_id } = req.body;

    const software = await Software.findByPk(software_id);
    if (!software) {
      return res.status(400).json({ message: "Software ID tidak valid" });
    }

    const newLicense = await License.create({
      software_id,
      software_version_id: software_version_id || null,
      license_key,
      is_active: false,
      used_at: null,
    });

    return res.status(201).json({ message: "Lisensi berhasil ditambahkan", license: newLicense });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const createMultipleLicenses = async (req, res) => {
  let transaction;

  try {
    transaction = await db.sequelize.transaction({
      isolationLevel: db.Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    });

    const { software_id, license_keys, software_version_id } = req.body;

    const software = await Software.findByPk(software_id);
    if (!software) {
      return res.status(400).json({ message: "Software ID tidak valid" });
    }

    if (software.search_by_version) {
      const softwareVersion = await SoftwareVersion.findByPk(software_version_id);
      if (!softwareVersion) {
        return res.status(400).json({ message: "Software Version ID tidak valid" });
      }
    }

    if (!software.requires_license) {
      return res.status(400).json({ message: "Software ini tidak memerlukan lisensi" });
    }

    if (!Array.isArray(license_keys) || license_keys.length === 0) {
      return res.status(400).json({ message: "License keys harus berupa array dan tidak boleh kosong" });
    }

    const existingLicenses = await License.findAll({
      where: {
        software_id,
        license_key: license_keys,
        ...(software.search_by_version && { software_version_id }),
      },
      transaction,
      lock: transaction.LOCK.IN_SHARE_MODE,
    });

    const existingKeys = new Set(existingLicenses.map((l) => l.license_key));

    const newLicensesData = license_keys
      .filter((key) => !existingKeys.has(key))
      .map((key) => ({
        software_id,
        software_version_id: software.search_by_version ? software_version_id : null,
        license_key: key,
        is_active: false,
        used_at: null,
      }));

    if (newLicensesData.length > 0) {
      await License.bulkCreate(newLicensesData, { transaction });
    }

    await transaction.commit();
    return res.status(201).json({
      message: `${newLicensesData.length} lisensi berhasil ditambahkan`,
      licenses: newLicensesData,
    });
  } catch (error) {
    console.error(error);
    if (transaction) await transaction.rollback();
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const updateLicense = async (req, res) => {
  try {
    const { id } = req.params;
    const { software_id, license_key, is_active, used_at } = req.body;

    const license = await License.findByPk(id);
    if (!license) {
      return res.status(404).json({ message: "Lisensi tidak ditemukan" });
    }

    if (software_id) {
      const software = await Software.findByPk(software_id);
      if (!software) {
        return res.status(400).json({ message: "Software ID tidak valid" });
      }
    }

    await license.update({ software_id, license_key, is_active, used_at });

    return res.status(200).json({ message: "Lisensi berhasil diperbarui", license });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const updateLicenseMultiply = async (req, res) => {
  try {
    const { software_id, license_keys, software_version_id } = req.body;

    const software = await Software.findByPk(software_id);
    if (!software) {
      return res.status(400).json({ message: "Software ID tidak valid" });
    }

    let softwareVersion = null;
    if (software_version_id) {
      softwareVersion = await SoftwareVersion.findByPk(software_version_id);
      if (!softwareVersion) {
        return res.status(400).json({ message: "Software Version ID tidak valid" });
      }
    }

    if (!Array.isArray(license_keys) || license_keys.length === 0) {
      return res.status(400).json({ message: "License keys harus berupa array dan tidak boleh kosong" });
    }

    const validLicenseKeys = [...new Set(license_keys.map((key) => key.trim()).filter((key) => key.length > 0))];

    if (validLicenseKeys.length === 0) {
      return res.status(400).json({ message: "Tidak ada license key yang valid" });
    }

    const existingLicenses = await License.findAll({
      where: { software_id, license_key: validLicenseKeys },
    });

    const existingKeys = new Set(existingLicenses.map((license) => license.license_key));

    const updatePromises = existingLicenses.map(async (license) => {
      if (softwareVersion) license.software_version_id = software_version_id;
      return license.save();
    });

    const newLicenses = validLicenseKeys
      .filter((key) => !existingKeys.has(key))
      .map((key) => ({
        software_id,
        license_key: key,
        software_version_id: software_version_id || null,
        is_active: false,
        used_at: null,
      }));

    if (newLicenses.length > 0) {
      await License.bulkCreate(newLicenses);
    }

    await Promise.all(updatePromises);

    return res.status(200).json({ message: "Lisensi berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const deleteLicense = async (req, res) => {
  try {
    const { id } = req.params;

    const license = await License.findByPk(id);
    if (!license) {
      return res.status(404).json({ message: "Lisensi tidak ditemukan" });
    }

    await license.destroy();

    return res.status(200).json({ message: "Lisensi berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const deleteMultipleLicenses = async (req, res) => {
  try {
    const { licenses } = req.body;

    if (!Array.isArray(licenses) || licenses.length === 0) {
      return res.status(400).json({ message: "No licenses provided for deletion" });
    }

    await License.destroy({ where: { license_key: licenses } });

    return res.status(200).json({ message: "Selected licenses deleted successfully" });
  } catch (error) {
    console.error("Error deleting licenses:", error);
    return res.status(500).json({ message: "Failed to delete licenses", error });
  }
};

const getAllAvailableLicenses = async (req, res) => {
  try {
    const licenses = await License.findAll({
      where: { is_active: false },
      include: [
        { model: Software, attributes: ["name"] },
        { model: SoftwareVersion, attributes: ["version", "os"] },
      ],
    });
    return res.status(200).json(licenses);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const getAvailableLicenses = async (req, res) => {
  try {
    const { software_id, quantity = 1 } = req.query;

    const software = await Software.findByPk(software_id);
    if (!software) {
      return res.status(400).json({ message: "Software ID tidak valid" });
    }

    const licenses = await License.findAll({
      where: { software_id, is_active: false },
      limit: parseInt(quantity, 10),
    });

    if (licenses.length === 0) {
      return res.status(404).json({ message: "Tidak ada lisensi yang tersedia" });
    }

    return res.status(200).json(licenses);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const activateLicense = async (req, res) => {
  try {
    const { id } = req.params;

    const license = await License.findByPk(id);
    if (!license) {
      return res.status(404).json({ message: "Lisensi tidak ditemukan" });
    }

    if (license.is_active) {
      return res.status(400).json({ message: "Lisensi sudah digunakan" });
    }

    await license.update({ is_active: true, used_at: new Date() });

    return res.status(200).json({ message: "Lisensi berhasil diaktifkan", license });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const getLicenseCount = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const today = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(today.getDate() - 30);

    const finalStartDate = startDate ? new Date(`${startDate}T00:00:00.000Z`) : defaultStartDate;
    const finalEndDate = endDate ? new Date(`${endDate}T23:59:59.999Z`) : today;

    const totalLicenses = await License.count({
      where: {
        createdAt: { [db.Sequelize.Op.between]: [finalStartDate, finalEndDate] },
      },
    });

    res.json({ totalLicenses });
  } catch (error) {
    console.error("Error fetching license count:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAvailableLicensesCount = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const today = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(today.getDate() - 30);

    const finalStartDate = startDate ? new Date(`${startDate}T00:00:00.000Z`) : defaultStartDate;
    const finalEndDate = endDate ? new Date(`${endDate}T23:59:59.999Z`) : today;

    const availableLicenses = await License.count({
      where: {
        is_active: false,
        createdAt: { [Op.between]: [finalStartDate, finalEndDate] },
      },
    });

    res.json({ availableLicenses });
  } catch (error) {
    console.error("Error fetching available licenses:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllLicenses,
  getLicenseById,
  getAllAvailableLicenses,
  getAvailableLicenses,
  createLicense,
  updateLicense,
  deleteLicense,
  deleteMultipleLicenses,
  activateLicense,
  createMultipleLicenses,
  updateLicenseMultiply,
  getLicenseCount,
  getAvailableLicensesCount,
};
