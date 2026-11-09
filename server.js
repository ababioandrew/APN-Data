// server.js
import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// =====================================================
// REQUIRED ENV VARS
// =====================================================
const requiredEnv = ["EMAIL_USER", "EMAIL_PASS", "ENQUIRY_EMAIL"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.warn(`⚠️  Missing environment variable: ${key}`);
  }
}

// JSONBin Config (Added .trim() to remove hidden spaces/newlines that break Windows .env files)
const RAW_BIN_ID = process.env.JSONBIN_BIN_ID || process.env.REACT_APP_JSONBIN_BIN_ID || "";
const RAW_MASTER_KEY = process.env.JSONBIN_MASTER_KEY || process.env.REACT_APP_JSONBIN_MASTER_KEY || "";

const JSONBIN_BIN_ID = RAW_BIN_ID.trim();
const JSONBIN_MASTER_KEY = RAW_MASTER_KEY.trim();

if (!JSONBIN_BIN_ID || !JSONBIN_MASTER_KEY) {
  console.warn("⚠️  Missing JSONBin environment variables. Data will not save.");
}

// =====================================================
// MIDDLEWARE
// =====================================================
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// =====================================================
// EMAIL TRANSPORTER
// =====================================================
let transporter = null;

try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log("✅ Email transporter configured");
  } else {
    console.warn("⚠️  Email credentials not configured");
  }
} catch (error) {
  console.error("❌ Email configuration error:", error.message);
}

// =====================================================
// HEALTH CHECK & DEBUG
// =====================================================
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Church site backend running",
    email: !!transporter,
    environment: process.env.VERCEL ? "Vercel" : "Local",
    timestamp: new Date().toISOString(),
  });
});

// DEBUG ROUTE: Visit http://localhost:5000/api/debug-jsonbin to see what the server sees
app.get("/api/debug-jsonbin", (req, res) => {
  res.json({
    binIdLength: JSONBIN_BIN_ID.length,
    binIdStart: JSONBIN_BIN_ID.substring(0, 4) + "...",
    keyLength: JSONBIN_MASTER_KEY.length,
    keyStart: JSONBIN_MASTER_KEY.substring(0, 4) + "...",
    warning: "If key length is less than 64, the '$' signs were stripped by dotenv."
  });
});

// =====================================================
// MEMBERS: FETCH FROM JSONBIN.IO
// =====================================================
app.get("/api/members", async (req, res) => {
  try {
    if (!JSONBIN_BIN_ID || !JSONBIN_MASTER_KEY) {
      return res.status(500).json({ error: "Server missing JSONBin credentials." });
    }

    const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
      method: "GET",
      headers: {
        "X-Master-Key": JSONBIN_MASTER_KEY,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch from JSONBin");
    }

    res.json(data);
  } catch (error) {
    console.error("Fetch members error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// MEMBERS: SAVE TO JSONBIN.IO
// =====================================================
app.put("/api/members", async (req, res) => {
  try {
    if (!JSONBIN_BIN_ID || !JSONBIN_MASTER_KEY) {
      return res.status(500).json({ error: "Server missing JSONBin credentials." });
    }

    const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      method: "PUT",
      headers: {
        "X-Master-Key": JSONBIN_MASTER_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to save to JSONBin");
    }

    res.json(data);
  } catch (error) {
    console.error("Save members error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// SEND ENQUIRY EMAIL
// =====================================================
const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

app.post("/api/send-enquiry", async (req, res) => {
  try {
    const { message, whatsappCaption } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Enquiry message is required.",
      });
    }

    const emailMessage = message.trim();
    const whatsappMessage = whatsappCaption?.trim() || emailMessage;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"Answered Prayer Network" <${process.env.EMAIL_USER}>`,
          to: process.env.ENQUIRY_EMAIL,
          subject: "New Church Website Enquiry",
          text: `${emailMessage}\n\nWhatsApp Caption:\n${whatsappMessage}`,
          html: `
            <h2>New Church Website Enquiry</h2>
            <p>${escapeHtml(emailMessage)}</p>
            <hr/>
            <p><strong>WhatsApp Caption:</strong></p>
            <p>${escapeHtml(whatsappMessage)}</p>
          `,
        });
        console.log("✅ Enquiry email sent");
      } catch (emailError) {
        console.error("❌ Email send error:", emailError.message);
      }
    } else {
      console.warn("⚠️  Email not sent - transporter not configured");
    }

    res.json({
      success: true,
      message: "Enquiry sent successfully.",
      whatsappCaption: whatsappMessage,
    });
  } catch (error) {
    console.error("Send enquiry error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to send enquiry.",
      error: error.message,
    });
  }
});

// =====================================================
// 404 + ERROR HANDLERS
// =====================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

app.use((error, req, res, next) => {
  console.error("Unhandled error:", error.message);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// =====================================================
// LOCAL DEV SERVER
// =====================================================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`✅ Church site backend on http://localhost:${PORT}`);
  });
}

// =====================================================
// EXPORT FOR VERCEL
// =====================================================
export default app;