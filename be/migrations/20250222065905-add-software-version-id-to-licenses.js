"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Licenses", "software_version_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "softwareversions", // Pastikan cocok dengan database
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Licenses", "software_version_id");
  },
};
