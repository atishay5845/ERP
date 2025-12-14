// BACKEND/routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Public contact
router.post("/contact", messageController.sendContactForm);

// Protected messaging
router.post("/send", authMiddleware, messageController.sendMessage);
router.get("/received", authMiddleware, messageController.getReceivedMessages);
router.get("/sent", authMiddleware, messageController.getSentMessages);

// New: search users for dropdown
// GET /api/messages/users?role=Admin&search=foo&limit=20
router.get("/users", authMiddleware, messageController.getUsersByRole);

// New: broadcast (admins only)
router.post("/send-broadcast", authMiddleware, messageController.sendBroadcastMessage);

// Unread count quick endpoint
router.get("/unread-count", authMiddleware, messageController.getUnreadCount);

// Mark read and delete
router.put("/:messageId/read", authMiddleware, messageController.markMessageAsRead);
router.delete("/:messageId", authMiddleware, messageController.deleteMessage);

// Notices
router.post("/notice/create", authMiddleware, messageController.createNotice);
router.get("/notice", authMiddleware, messageController.getAllNotices);
router.put("/notice/:noticeId", authMiddleware, messageController.updateNotice);
router.delete("/notice/:noticeId", authMiddleware, messageController.deleteNotice);

module.exports = router;