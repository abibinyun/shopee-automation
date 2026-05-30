"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM Software"
    );
    if (existing[0].count > 0) return;

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString().slice(0, 19).replace("T", " ");

    // 1. Software
    await queryInterface.sequelize.query(`
      INSERT INTO Software (name, requires_license, search_by_version, createdAt, updatedAt) VALUES
      ('Windows 11 Pro', 1, 1, '${now}', '${now}'),
      ('Microsoft Office 2024', 1, 1, '${now}', '${now}'),
      ('Adobe Photoshop CC', 1, 0, '${now}', '${now}')
    `);

    // 2. SoftwareVersions
    await queryInterface.sequelize.query(`
      INSERT INTO SoftwareVersions (software_id, version, os, download_link, createdAt, updatedAt) VALUES
      (1, '22H2', 'Windows', 'https://example.com/download/win11-22h2', '${now}', '${now}'),
      (1, '23H2', 'Windows', 'https://example.com/download/win11-23h2', '${now}', '${now}'),
      (2, 'Home', 'Windows', 'https://example.com/download/office-home', '${now}', '${now}'),
      (2, 'Pro', 'Windows', 'https://example.com/download/office-pro', '${now}', '${now}'),
      (3, '25.0', 'Windows/Mac', 'https://example.com/download/photoshop-25', '${now}', '${now}')
    `);

    // 3. Licenses (30 total)
    await queryInterface.sequelize.query(`
      INSERT INTO Licenses (software_id, software_version_id, license_key, is_active, used_at, createdAt, updatedAt) VALUES
      (1, 1, 'WIN11-A000001-XXXX-YYYY', 1, '${daysAgo(3)}', '${now}', '${now}'),
      (1, 1, 'WIN11-B000002-XXXX-YYYY', 1, '${daysAgo(2)}', '${now}', '${now}'),
      (1, 1, 'WIN11-C000003-XXXX-YYYY', 1, '${daysAgo(1)}', '${now}', '${now}'),
      (1, 1, 'WIN11-D000004-XXXX-YYYY', 0, NULL, '${now}', '${now}'),
      (1, 1, 'WIN11-E000005-XXXX-YYYY', 0, NULL, '${now}', '${now}'),
      (1, 2, 'WIN11-F000006-XXXX-YYYY', 0, NULL, '${now}', '${now}'),
      (1, 2, 'WIN11-G000007-XXXX-YYYY', 0, NULL, '${now}', '${now}'),
      (1, 2, 'WIN11-H000008-XXXX-YYYY', 0, NULL, '${now}', '${now}'),
      (1, 2, 'WIN11-I000009-XXXX-YYYY', 0, NULL, '${now}', '${now}'),
      (1, 2, 'WIN11-J000010-XXXX-YYYY', 0, NULL, '${now}', '${now}'),
      (2, 3, 'OFF24-K000011-ABCD-EFGH', 1, '${daysAgo(4)}', '${now}', '${now}'),
      (2, 3, 'OFF24-L000012-ABCD-EFGH', 1, '${daysAgo(3)}', '${now}', '${now}'),
      (2, 3, 'OFF24-M000013-ABCD-EFGH', 1, '${daysAgo(2)}', '${now}', '${now}'),
      (2, 3, 'OFF24-N000014-ABCD-EFGH', 1, '${daysAgo(1)}', '${now}', '${now}'),
      (2, 3, 'OFF24-O000015-ABCD-EFGH', 0, NULL, '${now}', '${now}'),
      (2, 4, 'OFF24-P000016-ABCD-EFGH', 0, NULL, '${now}', '${now}'),
      (2, 4, 'OFF24-Q000017-ABCD-EFGH', 0, NULL, '${now}', '${now}'),
      (2, 4, 'OFF24-R000018-ABCD-EFGH', 0, NULL, '${now}', '${now}'),
      (2, 4, 'OFF24-S000019-ABCD-EFGH', 0, NULL, '${now}', '${now}'),
      (2, 4, 'OFF24-T000020-ABCD-EFGH', 0, NULL, '${now}', '${now}'),
      (3, 5, 'PS-CC-U000021-IJKL-MNOP', 1, '${daysAgo(2)}', '${now}', '${now}'),
      (3, 5, 'PS-CC-V000022-IJKL-MNOP', 1, '${daysAgo(1)}', '${now}', '${now}'),
      (3, 5, 'PS-CC-W000023-IJKL-MNOP', 0, NULL, '${now}', '${now}'),
      (3, 5, 'PS-CC-X000024-IJKL-MNOP', 0, NULL, '${now}', '${now}'),
      (3, 5, 'PS-CC-Y000025-IJKL-MNOP', 0, NULL, '${now}', '${now}'),
      (3, 5, 'PS-CC-Z000026-IJKL-MNOP', 0, NULL, '${now}', '${now}'),
      (3, 5, 'PS-CC-A000027-IJKL-MNOP', 0, NULL, '${now}', '${now}'),
      (3, 5, 'PS-CC-B000028-IJKL-MNOP', 0, NULL, '${now}', '${now}'),
      (3, 5, 'PS-CC-C000029-IJKL-MNOP', 0, NULL, '${now}', '${now}'),
      (3, 5, 'PS-CC-D000030-IJKL-MNOP', 0, NULL, '${now}', '${now}')
    `);

    // 4. Orders (8 across last 30 days)
    await queryInterface.sequelize.query(`
      INSERT INTO Orders (order_id, item_name, os, version, license_count, status, software_id, createdAt, updatedAt) VALUES
      ('SHP-20250501-001', 'Windows 11 Pro', 'Windows', '22H2', 1, 'processed', 1, '${daysAgo(29)}', '${daysAgo(29)}'),
      ('SHP-20250505-002', 'Microsoft Office 2024', 'Windows', 'Pro', 1, 'processed', 2, '${daysAgo(25)}', '${daysAgo(25)}'),
      ('SHP-20250510-003', 'Windows 11 Pro', 'Windows', '23H2', 1, 'processed', 1, '${daysAgo(20)}', '${daysAgo(20)}'),
      ('SHP-20250515-004', 'Adobe Photoshop CC', 'Windows', '25.0', 1, 'processed', 3, '${daysAgo(15)}', '${daysAgo(15)}'),
      ('SHP-20250520-005', 'Microsoft Office 2024', 'Windows', 'Home', 2, 'processed', 2, '${daysAgo(10)}', '${daysAgo(10)}'),
      ('SHP-20250525-006', 'Windows 11 Pro', 'Windows', '22H2', 1, 'processed', 1, '${daysAgo(5)}', '${daysAgo(5)}'),
      ('SHP-20250528-007', 'Adobe Photoshop CC', 'Windows', '25.0', 1, 'processed', 3, '${daysAgo(2)}', '${daysAgo(2)}'),
      ('SHP-20250530-008', 'Microsoft Office 2024', 'Windows', 'Pro', 1, 'processed', 2, '${now}', '${now}')
    `);

    // 5. OrderLicenses junction
    await queryInterface.sequelize.query(`
      INSERT INTO OrderLicenses (order_id, license_id, createdAt, updatedAt) VALUES
      (1, 1, '${now}', '${now}'),
      (2, 11, '${now}', '${now}'),
      (3, 6, '${now}', '${now}'),
      (4, 22, '${now}', '${now}'),
      (5, 12, '${now}', '${now}'),
      (5, 13, '${now}', '${now}'),
      (6, 2, '${now}', '${now}'),
      (7, 23, '${now}', '${now}'),
      (8, 14, '${now}', '${now}')
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query("DELETE FROM OrderLicenses");
    await queryInterface.sequelize.query("DELETE FROM Orders");
    await queryInterface.sequelize.query("DELETE FROM Licenses");
    await queryInterface.sequelize.query("DELETE FROM SoftwareVersions");
    await queryInterface.sequelize.query("DELETE FROM Software");
  },
};
