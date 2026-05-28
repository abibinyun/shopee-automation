const express = require("express");
const authenticateToken = require("../middlewares/auth");

const {
  getAllLicenses,
  getLicenseById,
  getLicenseCount,
  getAvailableLicensesCount,
  createLicense,
  updateLicense,
  deleteLicense,
  deleteMultipleLicenses,
  getAllAvailableLicenses,
  getAvailableLicenses,
  activateLicense,
  createMultipleLicenses,
  updateLicenseMultiply,
} = require("../controllers/licenseController");

const router = express.Router();

router.get("/licenses", authenticateToken, getAllLicenses);
router.get("/licenses/:id", authenticateToken, getLicenseById);
router.get("/licenses/available", authenticateToken, getAvailableLicenses);
router.get("/licenses/available/all", authenticateToken, getAllAvailableLicenses);
router.post("/licenses", authenticateToken, createLicense);
router.post("/licenses/count", authenticateToken, getLicenseCount);
router.post("/licenses/available/all/count", authenticateToken, getAvailableLicensesCount);
router.post("/licenses-bulk", authenticateToken, createMultipleLicenses);
router.put("/licenses/:id", authenticateToken, updateLicense);
router.put("/licenses-bulk", authenticateToken, updateLicenseMultiply);
router.delete("/licenses/:id", authenticateToken, deleteLicense);
router.post("/licenses/delete-multiple", authenticateToken, deleteMultipleLicenses);
router.patch("/licenses/:id/activate", authenticateToken, activateLicense);

module.exports = router;
