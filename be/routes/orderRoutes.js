const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/auth");
const { createOrder, deleteOrder, getOrderCount, getOrderById, getOrderUsage, getOrders, updateOrder, processOrder, findOrder } = require("../controllers/orderController");

router.get("/orders", authenticateToken, getOrders);
router.get("/orders/:id", authenticateToken, getOrderById);
router.post("/orders/usage", authenticateToken, getOrderUsage);
router.post("/orders/count", authenticateToken, getOrderCount);
router.post("/orders", authenticateToken, createOrder);
router.put("/orders/:id", authenticateToken, updateOrder);
router.delete("/orders/:id", authenticateToken, deleteOrder);
router.post("/orders/process", authenticateToken, processOrder);
router.post("/orders/find", authenticateToken, findOrder);

module.exports = router;
