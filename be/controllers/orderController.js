const { Order, License, Software, SoftwareVersion, OrderLicense, db } = require("../models");
const { Op } = require("sequelize");

const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: License,
          through: { attributes: [] },
          attributes: ["id", "license_key", "is_active", "used_at"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", error });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", error });
  }
};

const createOrder = async (req, res) => {
  try {
    const { order_id, item_name, os, version, license_count, status } = req.body;
    const newOrder = await Order.create({ order_id, item_name, os, version, license_count, status });
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Gagal menambahkan pesanan", error });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { order_id, item_name, os, version, license_count, status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Pesanan tidak ditemukan" });

    await order.update({ order_id, item_name, os, version, license_count, status });
    res.json({ message: "Pesanan berhasil diperbarui", order });
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui pesanan", error });
  }
};

const deleteOrder = async (req, res) => {
  let transaction;

  try {
    transaction = await db.sequelize.transaction();

    const order = await Order.findByPk(req.params.id, {
      include: [{ model: License, through: { attributes: [] } }],
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    const licenseIds = order.Licenses.map((license) => license.id);

    if (licenseIds.length > 0) {
      await License.update({ is_active: false }, { where: { id: licenseIds }, transaction });
      await OrderLicense.destroy({ where: { order_id: order.id }, transaction });
    }

    await order.destroy({ transaction });
    await transaction.commit();

    res.json({ message: "Pesanan berhasil dihapus dan lisensi dikembalikan" });
  } catch (error) {
    console.error("Gagal menghapus pesanan:", error);
    if (transaction) await transaction.rollback();
    res.status(500).json({ message: "Gagal menghapus pesanan", error });
  }
};

const findOrder = async (req, res) => {
  const { order_id, item_name, os, version, item_amount } = req.body;
  let transaction;

  try {
    transaction = await db.sequelize.transaction({
      isolationLevel: db.Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    });

    const software = await Software.findOne({
      where: db.sequelize.where(db.sequelize.fn("LOWER", db.sequelize.col("name")), {
        [db.Sequelize.Op.regexp]: item_name.toLowerCase(),
      }),
    });

    if (!software) {
      await transaction.rollback();
      return res.status(404).json({ message: "Software tidak ditemukan" });
    }

    const softwareVersion = await SoftwareVersion.findOne({
      where: { software_id: software.id, os, version },
      transaction,
    });

    if (!software.requires_license) {
      await transaction.commit();
      return res.json({
        message: "Pesanan ditemukan dan diproses",
        item: software.name,
        order_id: null,
        download_link: softwareVersion?.download_link || null,
        licenses: [],
      });
    }

    if (software.search_by_version && !softwareVersion) {
      await transaction.commit();
      return res.json({
        message: "Versi software tidak ditemukan",
        item: software.name,
        order_id: null,
        download_link: null,
        licenses: [],
      });
    }

    const licenseQuery = {
      software_id: software.id,
      is_active: false,
      ...(software.search_by_version && { software_version_id: softwareVersion?.id }),
    };

    const licenses = await License.findAll({
      where: licenseQuery,
      limit: item_amount,
      lock: true,
      transaction,
    });

    if (licenses.length < item_amount && software.search_by_version && softwareVersion?.download_link) {
      await transaction.commit();
      return res.json({
        message: "Lisensi tidak tersedia, tetapi download link diberikan",
        item: software.name,
        order_id: null,
        download_link: softwareVersion.download_link,
        licenses: [],
      });
    }

    if (licenses.length < item_amount) {
      await transaction.rollback();
      return res.status(400).json({ message: "Stok lisensi tidak cukup" });
    }

    await Promise.all(
      licenses.map((license) =>
        license.update({ is_active: true, used_at: new Date() }, { transaction })
      )
    );

    const licenseInfo = licenses.map((l) => l.license_key);

    const order = await Order.create(
      {
        order_id,
        item_name,
        os,
        version,
        license_count: item_amount,
        status: "processed",
        software_id: software.id,
      },
      { transaction }
    );

    await Promise.all(
      licenses.map((license) =>
        OrderLicense.create({ order_id: order.id, license_id: license.id }, { transaction })
      )
    );

    await transaction.commit();

    return res.json({
      message: "Pesanan ditemukan dan diproses",
      item: software.name,
      order_id: order.order_id,
      download_link: softwareVersion?.download_link || null,
      licenses: licenseInfo,
    });
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    if (transaction && !transaction.finished) await transaction.rollback();
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const getOrderUsage = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const today = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(today.getDate() - 30);

    const finalStartDate = startDate ? new Date(`${startDate}T00:00:00.000Z`) : defaultStartDate;
    const finalEndDate = endDate ? new Date(`${endDate}T23:59:59.999Z`) : today;

    const orders = await Order.findAll({
      attributes: ["software_id", [db.Sequelize.fn("COUNT", db.Sequelize.col("software_id")), "count"]],
      include: [{ model: Software, attributes: ["name"] }],
      where: {
        createdAt: { [Op.between]: [finalStartDate, finalEndDate] },
      },
      group: ["software_id", "Software.id"],
      raw: true,
    });

    if (orders.length === 0) return res.json([]);

    const result = orders.map((order) => ({
      name: order["Software.name"],
      count: order.count,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching order usage:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getOrderCount = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const today = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(today.getDate() - 30);

    const finalStartDate = startDate ? new Date(`${startDate}T00:00:00.000Z`) : defaultStartDate;
    const finalEndDate = endDate ? new Date(`${endDate}T23:59:59.999Z`) : today;

    const totalOrders = await Order.count({
      where: {
        createdAt: { [db.Sequelize.Op.between]: [finalStartDate, finalEndDate] },
      },
    });

    res.json({ totalOrders });
  } catch (error) {
    console.error("Error fetching order count:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  findOrder,
  getOrderUsage,
  getOrderCount,
};
