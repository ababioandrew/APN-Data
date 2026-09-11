const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { put, head, list } = require("@vercel/blob");

const app = express();
const PORT = process.env.PORT || 7000;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(helmet());
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// =====================================================
// HELPERS
// =====================================================

function safeFilename(filename) {
  if (!filename || typeof filename !== "string") return null;
  const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, "");
  return cleanName.toLowerCase().endsWith(".json")
    ? cleanName
    : `${cleanName}.json`;
}

function blobKey(filename) {
  const safe = safeFilename(filename);
  if (!safe) throw new Error("Invalid JSON filename.");
  return `data/${safe}`;
}

// =====================================================
// READ JSON BLOB — explicit token mode
// =====================================================

async function readJSONBlob(filename) {
  const key = blobKey(filename);
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  try {
    const meta = await head(key, { token });
    const res = await fetch(meta.url, { cache: "no-store" });

    if (!res.ok) return [];

    const text = await res.text();
    return text.trim() ? JSON.parse(text) : [];
  } catch (err) {
    const msg = String(err?.message || "").toLowerCase();

    const isNotFound =
      err?.name === "BlobNotFoundError" ||
      msg.includes("does not exist") ||
      msg.includes("not found") ||
      msg.includes("blobnotfound");

    if (isNotFound) return [];

    throw err;
  }
}

// =====================================================
// WRITE JSON BLOB — explicit token mode
// =====================================================

async function writeJSONBlob(filename, data) {
  const key = blobKey(filename);

  await put(key, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

// =====================================================
// FIND RECORD BY ID
// =====================================================

function findRecordById(data, id) {
  if (!Array.isArray(data)) return -1;

  return data.findIndex(
    (item) =>
      String(item.id) === String(id) ||
      String(item._id) === String(id)
  );
}

// =====================================================
// DIAGNOSTIC
// =====================================================

app.get("/api/debug", (req, res) => {
  res.json({
    hasStoreId: !!process.env.BLOB_STORE_ID,
    hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    hasPublicKey: !!process.env.BLOB_WEBHOOK_PUBLIC_KEY,
    tokenPrefix: process.env.BLOB_READ_WRITE_TOKEN
      ? process.env.BLOB_READ_WRITE_TOKEN.substring(0, 20) + "..."
      : null,
    storeId: process.env.BLOB_STORE_ID || null,
    nodeEnv: process.env.NODE_ENV || null,
    vercel: !!process.env.VERCEL,
  });
});

// =====================================================
// ROOT
// =====================================================

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the JSON API Server",
    status: "Running",
    environment: process.env.VERCEL ? "Vercel" : "Local",
    timestamp: new Date().toISOString(),
    endpoints: [
      { method: "GET", path: "/" },
      { method: "GET", path: "/health" },
      { method: "GET", path: "/api/json-files" },
      { method: "GET", path: "/api/json/:filename" },
      { method: "GET", path: "/api/json/:filename/:id" },
      { method: "GET", path: "/api/json/:filename/search?q=query" },
      { method: "POST", path: "/api/json/:filename" },
      { method: "PUT", path: "/api/json/:filename/:id" },
      { method: "DELETE", path: "/api/json/:filename/:id" },
    ],
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "JSON Express Server is healthy",
    environment: process.env.VERCEL ? "Vercel" : "Local",
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// LIST FILES — explicit token mode
// =====================================================

app.get("/api/json-files", async (req, res) => {
  try {
    const { blobs } = await list({
      prefix: "data/",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const files = blobs.map((b) =>
      b.pathname.replace(/^data\//, "")
    );

    res.json({ success: true, count: files.length, files });
  } catch (error) {
    console.error("List files error:", error);
    res.status(500).json({
      success: false,
      error: "Unable to list files.",
      detail: error?.message || String(error),
      env: {
        hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
        hasStoreId: !!process.env.BLOB_STORE_ID,
      },
    });
  }
});

// =====================================================
// GET ALL RECORDS
// =====================================================

app.get("/api/json/:filename", async (req, res) => {
  try {
    const data = await readJSONBlob(req.params.filename);
    res.json(data);
  } catch (error) {
    console.error("GET JSON error:", error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message || "Unable to read JSON file.",
    });
  }
});

// =====================================================
// SEARCH
// =====================================================

app.get("/api/json/:filename/search", async (req, res) => {
  try {
    const query = String(req.query.q || "").trim().toLowerCase();

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Search query required (?q=...)",
      });
    }

    const data = await readJSONBlob(req.params.filename);

    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: "Search only works on arrays.",
      });
    }

    const results = data.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(query)
    );

    res.json({ success: true, count: results.length, results });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.message || "Search failed.",
    });
  }
});

// =====================================================
// GET ONE RECORD
// =====================================================

app.get("/api/json/:filename/:id", async (req, res) => {
  try {
    const data = await readJSONBlob(req.params.filename);

    if (!Array.isArray(data)) {
      return res
        .status(400)
        .json({ success: false, error: "Not an array." });
    }

    const index = findRecordById(data, req.params.id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: `Record "${req.params.id}" not found.`,
      });
    }

    res.json(data[index]);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.message || "Unable to retrieve record.",
    });
  }
});

// =====================================================
// CREATE RECORD
// =====================================================

app.post("/api/json/:filename", async (req, res) => {
  try {
    const newItem = req.body;

    if (
      !newItem ||
      typeof newItem !== "object" ||
      Array.isArray(newItem)
    ) {
      return res.status(400).json({
        success: false,
        error: "Body must be a JSON object.",
      });
    }

    const data = await readJSONBlob(req.params.filename);

    const item = {
      ...newItem,
      id: newItem.id || newItem._id || Date.now().toString(),
    };

    data.push(item);

    await writeJSONBlob(req.params.filename, data);

    res.status(201).json({
      success: true,
      message: "Record created successfully.",
      data: item,
    });
  } catch (error) {
    console.error("POST error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Unable to create record.",
    });
  }
});

// =====================================================
// UPDATE RECORD
// =====================================================

app.put("/api/json/:filename/:id", async (req, res) => {
  try {
    const { filename, id } = req.params;
    const updates = req.body;

    if (
      !updates ||
      typeof updates !== "object" ||
      Array.isArray(updates)
    ) {
      return res.status(400).json({
        success: false,
        error: "Body must be a JSON object.",
      });
    }

    const data = await readJSONBlob(filename);

    if (!Array.isArray(data)) {
      return res
        .status(400)
        .json({ success: false, error: "Not an array." });
    }

    const index = findRecordById(data, id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: `Record "${id}" not found.`,
      });
    }

    const originalId = data[index].id || data[index]._id || id;

    data[index] = { ...data[index], ...updates, id: originalId };

    await writeJSONBlob(filename, data);

    res.json({
      success: true,
      message: "Record updated successfully.",
      data: data[index],
    });
  } catch (error) {
    console.error("PUT error:", error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message || "Unable to update record.",
    });
  }
});

// =====================================================
// DELETE RECORD
// =====================================================

app.delete("/api/json/:filename/:id", async (req, res) => {
  try {
    const { filename, id } = req.params;
    const data = await readJSONBlob(filename);

    if (!Array.isArray(data)) {
      return res
        .status(400)
        .json({ success: false, error: "Not an array." });
    }

    const index = findRecordById(data, id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: `Record "${id}" not found.`,
      });
    }

    const [deleted] = data.splice(index, 1);

    await writeJSONBlob(filename, data);

    res.json({
      success: true,
      message: "Record deleted successfully.",
      data: deleted,
    });
  } catch (error) {
    console.error("DELETE error:", error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message || "Unable to delete record.",
    });
  }
});

// =====================================================
// 404 + ERROR
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Global error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error.",
  });
});

// =====================================================
// LOCAL DEV SERVER
// =====================================================

if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(
      `🚀 JSON Express Server running on http://localhost:${PORT}`
    );
  });

  server.on("error", (e) => {
    if (e.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} in use.`);
      process.exit(1);
    }
    console.error("❌ Server error:", e);
  });
}

module.exports = app;