const express = require("express");
const { getAllSoftware, getSoftwareById, getSoftwareCount, createSoftware, updateSoftware, deleteSoftware } = require("../controllers/softwareController");
const authenticateToken = require("../middlewares/auth");
const router = express.Router();

router.get("/software", authenticateToken, getAllSoftware);
router.get("/software/:id", authenticateToken, getSoftwareById);
router.post("/software", authenticateToken, createSoftware);
router.post("/software/count", authenticateToken, getSoftwareCount);
router.put("/software/:id", authenticateToken, updateSoftware);
router.delete("/software/:id", authenticateToken, deleteSoftware);

module.exports = router;
