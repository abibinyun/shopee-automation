const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const { Sequelize } = require("sequelize");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

const Software = sequelize.define(
  "Software",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    requires_license: { type: DataTypes.BOOLEAN, defaultValue: false },
    search_by_version: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { timestamps: true }
);

const SoftwareVersion = sequelize.define(
  "SoftwareVersion",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    software_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Software, key: "id" } },
    version: { type: DataTypes.STRING(50), allowNull: false },
    os: { type: DataTypes.STRING(50), allowNull: false },
    download_link: { type: DataTypes.TEXT, allowNull: false },
  },
  { timestamps: true }
);

const License = sequelize.define(
  "License",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    software_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Software, key: "id" },
    },
    software_version_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: SoftwareVersion, key: "id" },
    },
    license_key: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: false },
    used_at: { type: DataTypes.DATE, allowNull: true },
  },
  { timestamps: true }
);

const Order = sequelize.define(
  "Order",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    item_name: { type: DataTypes.STRING(255), allowNull: false },
    os: { type: DataTypes.STRING(50), allowNull: true },
    version: { type: DataTypes.STRING(50), allowNull: true },
    license_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    status: { type: DataTypes.ENUM("pending", "processed"), defaultValue: "pending" },
  },
  { timestamps: true }
);

const OrderLicense = sequelize.define(
  "OrderLicense",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Order, key: "id" } },
    license_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: License, key: "id" } },
  },
  { timestamps: true }
);

const db = {
  sequelize,
  Sequelize,
  User,
  Software,
  SoftwareVersion,
  License,
  Order,
  OrderLicense,
};

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

Software.hasMany(SoftwareVersion, { foreignKey: "software_id" });
SoftwareVersion.belongsTo(Software, { foreignKey: "software_id" });

Software.hasMany(License, { foreignKey: "software_id" });
License.belongsTo(Software, { foreignKey: "software_id" });

Software.hasMany(Order, { foreignKey: "software_id" });
Order.belongsTo(Software, { foreignKey: "software_id" });

SoftwareVersion.hasMany(License, { foreignKey: "software_version_id" });
License.belongsTo(SoftwareVersion, { foreignKey: "software_version_id" });

Order.belongsToMany(License, { through: OrderLicense, foreignKey: "order_id" });
License.belongsToMany(Order, { through: OrderLicense, foreignKey: "license_id" });

module.exports = { User, Software, SoftwareVersion, License, Order, OrderLicense, db };
