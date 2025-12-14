// server.js (edited)
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Socket client connected:', socket.id);
  socket.on('disconnect', () => console.log('Socket disconnected', socket.id));
});

// Connect to MongoDB
connectDB();

// Rebuild indexes (kept as you had)
const rebuildIndexes = async () => {
  try {
    const Student = require("./models/Student");
    const Admission = require("./models/Admission");

    await Student.syncIndexes();
    await Admission.syncIndexes();
    console.log("✅ Indexes synced successfully");
  } catch (error) {
    console.error("Index sync error:", error.message);
  }
};
setTimeout(() => rebuildIndexes(), 1000);

// Enable CORS (your existing allowedOrigins logic kept)
const allowedOrigins = [ /* ... keep your list ... */ ];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV === 'development') return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Content-Length", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// NOTE: we need express.json after mounting webhook raw route capability
// We will mount the razorpayRoutes with raw body middleware for /api/razorpay/webhook

// parse JSON bodies for most routes
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/favicon.ico", (req, res) => res.status(204).send());
app.get("/api/health", (req, res) => res.status(200).json({ status: "ok", timestamp: new Date().toISOString(), uptime: process.uptime() }));

// API docs + other routes (as before)
app.use("/api/docs", require("./routes/apiDocRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
// ... other existing routes ...
app.use("/api/fees", require("./routes/feeRoutes"));

// Razorpay routes: mount so that webhook route can use raw body
const razorpayRoutes = require('./routes/razorpayRoutes');
// For all razorpay routes except /webhook we want normal JSON parsing. For webhook, Razorpay requires raw body.
// We mount the /api/razorpay/webhook with raw parser and the rest normally.

// Mount create-order and verify-payment under /api/razorpay
app.use('/api/razorpay', razorpayRoutes);

// But override the webhook endpoint to use express.raw for exact signature verification
const razorpayController = require('./controllers/razorpayController');
const expressRaw = express.raw({ type: 'application/json' });
app.post('/api/razorpay/webhook', expressRaw, (req, res, next) => {
  // raw body is in req.body as Buffer/string; controller expects parsed JSON, so convert:
  try {
    req.body = JSON.parse(req.body.toString('utf8'));
  } catch (e) {
    req.body = {};
  }
  return razorpayController.webhookHandler(req, res, next);
});

// Continue mounting other routes (your original list)
app.use("/api/admissions", require("./routes/admissionsRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/teachers", require("./routes/teacherRoutes"));
app.use("/api/teacher", require("./routes/teacherRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/exams", require("./routes/examRoutes"));
app.use("/api/lms", require("./routes/lmsRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/timetable", require("./routes/timetableRoutes"));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
