const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username dan password harus diisi" });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: "Password harus minimal 8 karakter dan mengandung huruf serta angka" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });

    res.status(201).json({ message: "User registered", user });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(400).json({ error: error.message || "Terjadi kesalahan" });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username dan password harus diisi" });
    }

    const user = await User.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Username atau password salah" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "3d" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });

    res.json({ token, refreshToken });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Terjadi kesalahan, coba lagi nanti" });
  }
};

const refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(401).json({ error: "Refresh Token diperlukan!" });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(403).json({ error: "Refresh Token tidak valid!" });
    }

    const newAccessToken = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "3d" });

    res.json({ token: newAccessToken });
  } catch (error) {
    console.error("Refresh Token error:", error);
    res.status(403).json({ error: "Refresh Token tidak valid!" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Password lama salah" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Terjadi kesalahan, coba lagi nanti" });
  }
};

const verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Password lama salah" });
    }

    res.json({ message: "Password lama benar" });
  } catch (error) {
    console.error("Error verifying password:", error);
    res.status(500).json({ error: "Terjadi kesalahan, coba lagi nanti" });
  }
};

module.exports = { register, login, refreshToken, updateUser, verifyPassword };
