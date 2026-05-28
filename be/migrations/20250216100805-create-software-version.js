"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("SoftwareVersions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      software_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Software",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      version: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      os: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      download_link: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("SoftwareVersions");
  },
};
