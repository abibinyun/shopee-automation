const express = require("express");
const authenticateToken = require("../middlewares/auth");
const { getAllSoftwareVersions, getSoftwareVersionById, getSoftwareVersionCount, getSoftwareVersionBySoftwareId, createSoftwareVersion, updateSoftwareVersion, deleteSoftwareVersion } = require("../controllers/softwareVersionController");

const router = express.Router();

router.get("/software-versions", authenticateToken, getAllSoftwareVersions);
router.get("/software-versions/:id", authenticateToken, getSoftwareVersionById);
router.get("/software-versions/:software_id/versions", authenticateToken, getSoftwareVersionBySoftwareId);
router.post("/software-versions", authenticateToken, createSoftwareVersion);
router.post("/software-versions/count", authenticateToken, getSoftwareVersionCount);
router.put("/software-versions/:id", authenticateToken, updateSoftwareVersion);
router.delete("/software-versions/:id", authenticateToken, deleteSoftwareVersion);

module.exports = router;
