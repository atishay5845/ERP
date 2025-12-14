// BACKEND/controllers/messageController.js
const mongoose = require("mongoose");
const Message = require("../models/Message");
const Notice = require("../models/Notice");
const nodemailer = require("nodemailer");

// Try to require user models (best-effort); adjust paths if your model filenames differ.
let Admin, Teacher, Student;
try {
  Admin = require("../models/Admin");
  Teacher = require("../models/Teacher");
  Student = require("../models/Student");
} catch (e) {
  // ignore if not present
}

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const resolveDisplayName = async (modelName, id) => {
  if (!modelName || !id) return undefined;
  try {
    let model;
    if (modelName === "Admin") model = Admin;
    if (modelName === "Teacher") model = Teacher;
    if (modelName === "Student") model = Student;
    if (!model) return undefined;

    const doc = await model.findById(id).select("personalDetails firstName lastName email employeeId admissionNumber");
    if (!doc) return undefined;

    if (doc.personalDetails && (doc.personalDetails.firstName || doc.personalDetails.lastName)) {
      const pd = doc.personalDetails;
      return `${pd.firstName || ""} ${pd.lastName || ""}`.trim();
    }
    if (doc.firstName || doc.lastName) return `${doc.firstName || ""} ${doc.lastName || ""}`.trim();
    if (doc.email) return doc.email;
    if (doc.employeeId) return doc.employeeId;
    if (doc.admissionNumber) return doc.admissionNumber;
    return undefined;
  } catch (err) {
    return undefined;
  }
};

// Helper to normalize role -> enum value used in schema
const normalizeRoleToModel = (roleRaw) => {
  if (!roleRaw) return "Admin";
  let r = String(roleRaw).toLowerCase();
  if (r === "superadmin") r = "admin";
  if (r === "teacher") r = "teacher";
  if (r === "student") r = "student";
  // Capitalize
  r = r.charAt(0).toUpperCase() + r.slice(1);
  if (!["Admin", "Teacher", "Student"].includes(r)) return "Admin";
  return r;
};

/* -----------------------
   USER SEARCH (for dropdown)
   GET /api/messages/users?role=Admin&search=foo&limit=10
   ----------------------- */
// Robust user search for recipient dropdown
const getUsersByRole = async (req, res) => {
  try {
    const roleRaw = req.query.role || "";
    const role = String(roleRaw).trim();
    const search = (req.query.search || "").trim();
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    if (!role) {
      return res.status(400).json({ success: false, message: "role query is required (Admin/Teacher/Student)" });
    }

    // normalize role param (allow admin, Admin, admin, superadmin mapping handled later)
    const roleNorm = role.toLowerCase();

    // map to model variable
    let model = null;
    if (roleNorm === "admin" || roleNorm === "superadmin" || roleNorm === "subadmin") model = Admin;
    if (roleNorm === "teacher") model = Teacher;
    if (roleNorm === "student") model = Student;

    // If model isn't defined (maybe file missing) return helpful message
    if (!model) {
      console.warn(`[messages] getUsersByRole: model not found for role='${role}'. Falling back to searching across all user models.`);
    }

    // Build query: do a friendly text search across likely fields
    const q = {};
    if (search) {
      q.$or = [
        { "personalDetails.firstName": new RegExp(search, "i") },
        { "personalDetails.lastName": new RegExp(search, "i") },
        { firstName: new RegExp(search, "i") },
        { lastName: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { employeeId: new RegExp(search, "i") },
        { admissionNumber: new RegExp(search, "i") },
        { adminId: new RegExp(search, "i") }
      ];
    }

    // If the mapped model exists, query it; otherwise query all available models and concat results
    let users = [];
    if (model) {
      users = await model.find(q).select("personalDetails firstName lastName email employeeId admissionNumber adminId").limit(limit);
    } else {
      // fallback: attempt all three models that exist
      const queries = [];
      if (Admin) queries.push(Admin.find(q).select("firstName lastName personalDetails email employeeId admissionNumber adminId").limit(limit));
      if (Teacher) queries.push(Teacher.find(q).select("personalDetails firstName lastName email employeeId admissionNumber").limit(limit));
      if (Student) queries.push(Student.find(q).select("personalDetails firstName lastName email admissionNumber").limit(limit));
      const results = await Promise.allSettled(queries);
      for (const r of results) {
        if (r.status === "fulfilled" && Array.isArray(r.value)) users = users.concat(r.value);
      }
      // limit total
      users = users.slice(0, limit);
    }

    // Map to a uniform small object the frontend expects
    const results = users.map(u => {
      let name = "";
      if (u.personalDetails) name = `${u.personalDetails.firstName || ""} ${u.personalDetails.lastName || ""}`.trim();
      if (!name && (u.firstName || u.lastName)) name = `${u.firstName || ""} ${u.lastName || ""}`.trim();
      if (!name && u.email) name = u.email;
      if (!name && u.adminId) name = u.adminId;
      if (!name && u.employeeId) name = u.employeeId;
      if (!name && u.admissionNumber) name = u.admissionNumber;
      if (!name) name = String(u._id);
      return { _id: u._id, name, email: u.email, adminId: u.adminId, employeeId: u.employeeId, admissionNumber: u.admissionNumber };
    });

    // If no users and search empty, also return up to `limit` all items for that role to help selection.
    if (results.length === 0 && !search && model) {
      // fetch up to limit users without filter
      const fallback = await model.find({}).select("personalDetails firstName lastName email employeeId admissionNumber adminId").limit(limit);
      const fallbackResults = fallback.map(u => {
        let name = "";
        if (u.personalDetails) name = `${u.personalDetails.firstName || ""} ${u.personalDetails.lastName || ""}`.trim();
        if (!name && (u.firstName || u.lastName)) name = `${u.firstName || ""} ${u.lastName || ""}`.trim();
        if (!name && u.email) name = u.email;
        if (!name && u.adminId) name = u.adminId;
        if (!name) name = String(u._id);
        return { _id: u._id, name, email: u.email, adminId: u.adminId, employeeId: u.employeeId, admissionNumber: u.admissionNumber };
      });
      // return fallback results if any
      if (fallbackResults.length) {
        return res.status(200).json({ success: true, users: fallbackResults });
      }
    }

    return res.status(200).json({ success: true, users: results });
  } catch (error) {
    console.error("getUsersByRole error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* -----------------------
   BROADCAST: Admin -> All Students
   POST /api/messages/send-broadcast
   body: { subject, message, messageType?, priority? }
   ----------------------- */
const sendBroadcastMessage = async (req, res) => {
  try {
    // Only allow Admin / Superadmin (treated as Admin)
    const senderRole = normalizeRoleToModel(req.user?.role);
    if (senderRole !== "Admin") {
      return res.status(403).json({ success: false, message: "Only admins can send broadcast messages" });
    }

    const { subject, message, messageType, priority } = req.body;
    if (!message) return res.status(400).json({ success: false, message: "Message content required" });

    if (!Student) return res.status(500).json({ success: false, message: "Student model not available on server" });

    const students = await Student.find({}, "_id").lean();
    if (!students.length) return res.status(404).json({ success: false, message: "No students found" });

    const senderName = req.user?.email || req.user?.firstName || "Administrator";

    const docs = students.map(s => ({
      sender: req.user.id,
      senderModel: "Admin",
      senderName,
      recipient: s._id,
      recipientModel: "Student",
      recipientName: undefined,
      subject,
      message,
      messageType: messageType || "announcement",
      priority: priority || "medium",
    }));

    await Message.insertMany(docs);

    return res.status(201).json({ success: true, message: `Broadcast sent to ${students.length} students` });
  } catch (error) {
    console.error("sendBroadcastMessage error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* -----------------------
   Quick unread count endpoint
   GET /api/messages/unread-count
   ----------------------- */
const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({ recipient: req.user.id, isRead: false });
    return res.status(200).json({ success: true, unreadCount });
  } catch (error) {
    console.error("getUnreadCount error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* -----------------------
   EXISTING sendMessage with normalization + validation
   ----------------------- */
const sendMessage = async (req, res) => {
  try {
    const { recipient, recipientModel, subject, message, messageType, priority } = req.body;

    if (!recipient || !message || !recipientModel) {
      return res.status(400).json({ success: false, message: "Missing required fields (recipient, recipientModel, message)." });
    }

    if (!mongoose.Types.ObjectId.isValid(recipient)) {
      return res.status(400).json({ success: false, message: "Invalid recipient ID. Must be a 24-char ObjectId." });
    }

    const senderModel = normalizeRoleToModel(req.user?.role);

    let senderName;
    if (req.user) {
      if (req.user.personalDetails && (req.user.personalDetails.firstName || req.user.personalDetails.lastName)) {
        senderName = `${req.user.personalDetails.firstName || ""} ${req.user.personalDetails.lastName || ""}`.trim();
      } else if (req.user.firstName || req.user.lastName) {
        senderName = `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim();
      } else if (req.user.email) {
        senderName = req.user.email;
      }
    }

    const recipientName = await resolveDisplayName(recipientModel, recipient);

    const newMessage = new Message({
      sender: req.user.id,
      senderModel,
      senderName: senderName || undefined,
      recipient,
      recipientModel,
      recipientName: recipientName || undefined,
      subject,
      message,
      messageType: messageType || "text",
      priority: priority || "medium",
    });

    await newMessage.save();

    return res.status(201).json({ success: true, message: "Message sent", newMessage });
  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* -----------------------
   other message functions unchanged (getReceivedMessages, getSentMessages, markMessageAsRead, deleteMessage)
   ----------------------- */

const getReceivedMessages = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const isRead = req.query.isRead;

    const query = { recipient: req.user.id };
    if (isRead !== undefined) query.isRead = isRead === "true";

    const messages = await Message.find(query)
      .populate("sender", "personalDetails firstName lastName email")
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Message.countDocuments(query);
    const unreadCount = await Message.countDocuments({ recipient: req.user.id, isRead: false });

    res.status(200).json({
      success: true,
      messages,
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("getReceivedMessages error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSentMessages = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);

    const messages = await Message.find({ sender: req.user.id })
      .populate("recipient", "personalDetails firstName lastName email")
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Message.countDocuments({ sender: req.user.id });

    res.status(200).json({
      success: true,
      messages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("getSentMessages error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ success: false, message: "Invalid messageId" });
    }

    const messageDoc = await Message.findById(messageId);
    if (!messageDoc) return res.status(404).json({ success: false, message: "Message not found" });
    if (String(messageDoc.recipient) !== String(req.user.id)) return res.status(403).json({ success: false, message: "Not allowed to mark this message" });

    messageDoc.isRead = true;
    messageDoc.readAt = new Date();
    await messageDoc.save();

    return res.status(200).json({ success: true, message: "Message marked as read", message: messageDoc });
  } catch (error) {
    console.error("markMessageAsRead error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(messageId)) return res.status(400).json({ success: false, message: "Invalid messageId" });

    const messageDoc = await Message.findById(messageId);
    if (!messageDoc) return res.status(404).json({ success: false, message: "Message not found" });
    if (String(messageDoc.recipient) !== String(req.user.id) && String(messageDoc.sender) !== String(req.user.id)) return res.status(403).json({ success: false, message: "Not allowed to delete this message" });

    await Message.findByIdAndDelete(messageId);
    return res.status(200).json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.error("deleteMessage error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Notices and contact form (unchanged, kept for completeness)
const createNotice = async (req, res) => { /* ... same as before ... */ };
const getAllNotices = async (req, res) => { /* ... same as before ... */ };
const updateNotice = async (req, res) => { /* ... same as before ... */ };
const deleteNotice = async (req, res) => { /* ... same as before ... */ };

const sendContactForm = async (req, res) => {
  try {
    const { name, email, message: contactMessage } = req.body;
    if (!name || !email || !contactMessage) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER || "support@edumanage.com",
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `<div><h2>New Contact Form Submission</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><hr><h3>Message:</h3><p>${contactMessage.replace(/\n/g, "<br>")}</p></div>`,
    };
    await transporter.sendMail(mailOptions);
    const confirmationEmail = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "We received your message - EduManage",
      html: `<div><h2>Thank You for Contacting Us!</h2><p>Dear ${name},</p><p>We have received your message and will respond shortly.</p></div>`,
    };
    await transporter.sendMail(confirmationEmail);
    res.status(200).json({ success: true, message: "Your message has been sent successfully!" });
  } catch (error) {
    console.error("Error sending contact form:", error);
    res.status(500).json({ success: false, message: "Failed to send message. Please try again later." });
  }
};

module.exports = {
  getUsersByRole,
  sendBroadcastMessage,
  getUnreadCount,
  sendMessage,
  getReceivedMessages,
  getSentMessages,
  markMessageAsRead,
  deleteMessage,
  createNotice,
  getAllNotices,
  updateNotice,
  deleteNotice,
  sendContactForm,
};