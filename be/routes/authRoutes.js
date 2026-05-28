const express = require("express");
const { register, login, updateUser, verifyPassword, refreshToken } = require("../controllers/authController");
const authenticateUser = require("../middlewares/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/user", authenticateUser, updateUser);
router.post("/user/password", authenticateUser, verifyPassword);
router.post("/user/refresh", refreshToken);

module.exports = router;
