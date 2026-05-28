const { SoftwareVersion, Software } = require("../models");
const { Op } = require("sequelize");

const getAllSoftwareVersions = async (req, res) => {
  try {
    const versions = await SoftwareVersion.findAll({
      include: [{ model: Software, attributes: ["name"] }],
    });
    return res.status(200).json(versions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const getSoftwareVersionById = async (req, res) => {
  try {
    const { id } = req.params;
    const version = await SoftwareVersion.findByPk(id, {
      include: [{ model: Software, attributes: ["name"] }],
    });

    if (!version) {
      return res.status(404).json({ message: "Software version tidak ditemukan" });
    }

    return res.status(200).json(version);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const getSoftwareVersionBySoftwareId = async (req, res) => {
  try {
    const versions = await SoftwareVersion.findAll({
      where: { software_id: req.params.software_id },
    });
    res.json(versions);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil versi software" });
  }
};

const createSoftwareVersion = async (req, res) => {
  try {
    const { software_id, version, os, download_link } = req.body;

    const software = await Software.findByPk(software_id);
    if (!software) {
      return res.status(400).json({ message: "Software ID tidak valid" });
    }

    const newVersion = await SoftwareVersion.create({ software_id, version, os, download_link });

    return res.status(201).json({ message: "Software version berhasil ditambahkan", version: newVersion });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const updateSoftwareVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const { software_id, version, os, download_link } = req.body;

    const softwareVersion = await SoftwareVersion.findByPk(id);
    if (!softwareVersion) {
      return res.status(404).json({ message: "Software version tidak ditemukan" });
    }

    if (software_id) {
      const software = await Software.findByPk(software_id);
      if (!software) {
        return res.status(400).json({ message: "Software ID tidak valid" });
      }
    }

    await softwareVersion.update({ software_id, version, os, download_link });

    return res.status(200).json({ message: "Software version berhasil diperbarui", version: softwareVersion });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const deleteSoftwareVersion = async (req, res) => {
  try {
    const { id } = req.params;

    const softwareVersion = await SoftwareVersion.findByPk(id);
    if (!softwareVersion) {
      return res.status(404).json({ message: "Software version tidak ditemukan" });
    }

    await softwareVersion.destroy();

    return res.status(200).json({ message: "Software version berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const getSoftwareVersionCount = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const today = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(today.getDate() - 30);

    const finalStartDate = startDate ? new Date(`${startDate}T00:00:00.000Z`) : defaultStartDate;
    const finalEndDate = endDate ? new Date(`${endDate}T23:59:59.999Z`) : today;

    const totalVersions = await SoftwareVersion.count({
      where: {
        createdAt: { [Op.between]: [finalStartDate, finalEndDate] },
      },
    });

    res.json({ totalSoftwareVersions: totalVersions });
  } catch (error) {
    console.error("Error fetching software versions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllSoftwareVersions,
  getSoftwareVersionById,
  getSoftwareVersionBySoftwareId,
  createSoftwareVersion,
  updateSoftwareVersion,
  deleteSoftwareVersion,
  getSoftwareVersionCount,
};
