const express= require("express");
const cors= require("cors");
const helmet= require("helmet");
const fs= require("fs");
const path= require("path");
const app= express();

const PORT= process.env.PORT || 7000;

const DATA_DIR= path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (error) {
    console.warn("Could not create data directory:", error.message);
  }
}

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

function safeFilename(filename) {
  if (!filename || typeof filename !== "string") {
    return null;
  }
  const cleanName= path.basename(filename);
  if (!cleanName.toLowerCase().endsWith(".json")) {
    return `${cleanName}.json`;
  }
  return cleanName;
}
function getFilePath(filename) {
  const safeName= safeFilename(filename);

  if (!safeName) {
    throw new Error("Invalid JSON filename.");
  }

  return path.join(DATA_DIR, safeName);
}
function readJSONFile(filename) {
  const filePath= getFilePath(filename);

  if (!fs.existsSync(filePath)) {
    const error= new Error(`JSON file "${filename}" not found.`);
    error.status= 404;
    throw error;
  }

  try {
    const content= fs.readFileSync(filePath, "utf8");

    if (!content.trim()) {
      return [];
    }

    return JSON.parse(content);
  } catch (error) {
    if (error.status=== 404) {
      throw error;
    }

    const jsonError= new Error(
      `Invalid JSON format in "${filename}".`
    );

    jsonError.status= 500;

    throw jsonError;
  }
}
function writeJSONFile(filename, data) {
  const filePath= getFilePath(filename);

  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2),
    "utf8"
  );
}
function findRecordById(data, id) {
  if (!Array.isArray(data)) {
    return -1;
  }

  return data.findIndex((item)=> {
    return (
      String(item.id)=== String(id) ||
      String(item._id)=== String(id)
    );
  });
}

app.get("/", (req, res)=> {
  res.status(200).json({
    message: "Welcome to the JSON API Server",
    status: "Running",
    environment: process.env.VERCEL
      ? "Vercel"
      : "Local",
    timestamp: new Date().toISOString(),

    endpoints: [
      {
        method: "GET",
        path: "/",
      },
      {
        method: "GET",
        path: "/health",
      },
      {
        method: "GET",
        path: "/api/json-files",
      },
      {
        method: "GET",
        path: "/api/json/:filename",
      },
      {
        method: "GET",
        path: "/api/json/:filename/:id",
      },
      {
        method: "GET",
        path: "/api/json/:filename/search?q=query",
      },
      {
        method: "POST",
        path: "/api/json/:filename",
      },
      {
        method: "PUT",
        path: "/api/json/:filename/:id",
      },
      {
        method: "DELETE",
        path: "/api/json/:filename/:id",
      },
    ],
  });
});
app.get("/health", (req, res)=> {
  res.status(200).json({
    status: "OK",
    message: "JSON Express Server is healthy",
    environment: process.env.VERCEL
      ? "Vercel"
      : "Local",
    timestamp: new Date().toISOString(),
  });
});
app.get("/json-files", (req, res)=> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      return res.json({
        success: true,
        count: 0,
        files: [],
      });
    }

    const files= fs
      .readdirSync(DATA_DIR)
      .filter((file)=>
        file.toLowerCase().endsWith(".json")
      );

    res.status(200).json({
      success: true,
      count: files.length,
      files,
    });
  } catch (error) {
    console.error("JSON files error:", error);

    res.status(500).json({
      success: false,
      error: "Unable to read JSON files.",
    });
  }
});
app.get("/json/:filename", (req, res)=> {
  try {
    const data= readJSONFile(req.params.filename);

    res.status(200).json(data);
  } catch (error) {
    console.error("GET JSON error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: error.message || "Unable to read JSON file.",
    });
  }
});
app.get("/json/:filename/search", (req, res)=> {
  try {
    const query= String(req.query.q || "")
      .trim()
      .toLowerCase();

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Search query is required. Use ?q=query",
      });
    }

    const data= readJSONFile(req.params.filename);

    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: "Search is only supported for JSON arrays.",
      });
    }

    const results= data.filter((item)=>
      JSON.stringify(item)
        .toLowerCase()
        .includes(query)
    );

    res.status(200).json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("SEARCH error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: error.message || "Search failed.",
    });
  }
});
app.get("/json/:filename/:id", (req, res)=> {
  try {
    const data= readJSONFile(req.params.filename);

    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: "This JSON file does not contain an array.",
      });
    }

    const index= findRecordById(
      data,
      req.params.id
    );

    if (index=== -1) {
      return res.status(404).json({
        success: false,
        error: `Record with ID "${req.params.id}" not found.`,
      });
    }

    res.status(200).json(data[index]);
  } catch (error) {
    console.error("GET record error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: error.message || "Unable to retrieve record.",
    });
  }
});
app.post("/json/:filename", (req, res)=> {
  try {
    const filename= req.params.filename;
    const newItem= req.body;

    if (
      !newItem ||
      typeof newItem !== "object" ||
      Array.isArray(newItem)
    ) {
      return res.status(400).json({
        success: false,
        error: "Request body must be a JSON object.",
      });
    }

    const filePath= getFilePath(filename);

    let data= [];

    if (fs.existsSync(filePath)) {
      data= readJSONFile(filename);

      if (!Array.isArray(data)) {
        return res.status(400).json({
          success: false,
          error: "JSON file must contain an array.",
        });
      }
    }

    const item= {
      ...newItem,
      id:
        newItem.id ||
        newItem._id ||
        Date.now().toString(),
    };

    data.push(item);

    writeJSONFile(filename, data);

    res.status(201).json({
      success: true,
      message: "Record created successfully.",
      data: item,
    });
  } catch (error) {
    console.error("POST error:", error);

    res.status(500).json({
      success: false,
      error:
        error.message ||
        "Unable to create record.",
    });
  }
});
app.put("/json/:filename/:id", (req, res)=> {
  try {
    const filename= req.params.filename;
    const id= req.params.id;
    const updates= req.body;

    if (
      !updates ||
      typeof updates !== "object" ||
      Array.isArray(updates)
    ) {
      return res.status(400).json({
        success: false,
        error: "Request body must be a JSON object.",
      });
    }

    const data= readJSONFile(filename);

    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: "JSON file must contain an array.",
      });
    }

    const index= findRecordById(data, id);

    if (index=== -1) {
      return res.status(404).json({
        success: false,
        error: `Record with ID "${id}" not found.`,
      });
    }

    const originalId=
      data[index].id ||
      data[index]._id ||
      id;

    data[index]= {
      ...data[index],
      ...updates,
      id: originalId,
    };

    writeJSONFile(filename, data);

    res.status(200).json({
      success: true,
      message: "Record updated successfully.",
      data: data[index],
    });
  } catch (error) {
    console.error("PUT error:", error);

    res.status(error.status || 500).json({
      success: false,
      error:
        error.message ||
        "Unable to update record.",
    });
  }
});
app.delete("/json/:filename/:id", (req, res)=> {
  try {
    const filename= req.params.filename;
    const id= req.params.id;

    const data= readJSONFile(filename);

    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: "JSON file must contain an array.",
      });
    }

    const index= findRecordById(data, id);

    if (index=== -1) {
      return res.status(404).json({
        success: false,
        error: `Record with ID "${id}" not found.`,
      });
    }

    const deleted= data[index];

    data.splice(index, 1);

    writeJSONFile(filename, data);

    res.status(200).json({
      success: true,
      message: "Record deleted successfully.",
      data: deleted,
    });
  } catch (error) {
    console.error("DELETE error:", error);

    res.status(error.status || 500).json({
      success: false,
      error:
        error.message ||
        "Unable to delete record.",
    });
  }
});
app.use((req, res)=> {
  res.status(404).json({
    success: false,
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
});
app.use((err, req, res, next)=> {
  console.error("❌ Global error:", err);

  res.status(err.status || 500).json({
    success: false,
    error:
      err.message ||
      "Internal server error.",
  });
});

if (!process.env.VERCEL) {
  const server= app.listen(PORT, ()=> {
    console.log("");
    console.log("=".repeat(60));
    console.log("🚀 JSON Express Server is running!");
    console.log("=".repeat(60));
    console.log(`📍 URL:       http://localhost:${PORT}`);
    console.log(`❤️ Health:    http://localhost:${PORT}/health`);
    console.log(`📦 API:       http://localhost:${PORT}/api`);
    console.log(`📁 JSON Data: ${DATA_DIR}`);
    console.log("=".repeat(60));
    console.log("");
  });

  server.on("error", (error)=> {
    if (error.code=== "EADDRINUSE") {
      console.error(
        `❌ Port ${PORT} is already in use.`
      );
      process.exit(1);
    }

    console.error("❌ Server error:", error);
  });
}

module.exports= app;