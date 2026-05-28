"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfoSoftwareVersions = await queryInterface.describeTable("SoftwareVersions");
    const tableInfoSoftware = await queryInterface.describeTable("Software");
    const tableInfoLicenses = await queryInterface.describeTable("Licenses");
    const tableInfoOrders = await queryInterface.describeTable("Orders");

    if (!tableInfoSoftwareVersions.createdAt) {
      await queryInterface.addColumn("SoftwareVersions", "createdAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      });
    }

    if (!tableInfoSoftwareVersions.updatedAt) {
      await queryInterface.addColumn("SoftwareVersions", "updatedAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      });
    }

    if (!tableInfoSoftware.createdAt) {
      await queryInterface.addColumn("Software", "createdAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      });
    }

    if (!tableInfoSoftware.updatedAt) {
      await queryInterface.addColumn("Software", "updatedAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      });
    }

    if (!tableInfoLicenses.createdAt) {
      await queryInterface.addColumn("Licenses", "createdAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      });
    }

    if (!tableInfoLicenses.updatedAt) {
      await queryInterface.addColumn("Licenses", "updatedAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      });
    }

    if (!tableInfoOrders.createdAt) {
      await queryInterface.addColumn("Orders", "createdAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      });
    }

    if (!tableInfoOrders.updatedAt) {
      await queryInterface.addColumn("Orders", "updatedAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("SoftwareVersions", "createdAt");
    await queryInterface.removeColumn("SoftwareVersions", "updatedAt");

    await queryInterface.removeColumn("Software", "createdAt");
    await queryInterface.removeColumn("Software", "updatedAt");

    await queryInterface.removeColumn("Licenses", "createdAt");
    await queryInterface.removeColumn("Licenses", "updatedAt");

    await queryInterface.removeColumn("Orders", "createdAt");
    await queryInterface.removeColumn("Orders", "updatedAt");
  },
};
