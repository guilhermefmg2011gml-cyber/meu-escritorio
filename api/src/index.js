import "dotenv/config";
import express from "express";
import cors from "cors";
import { seedAdminIfEnabled } from "./seed.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
app.use(express.json());

const originConfig = process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || "*";
const allowedOrigins = parseAllowedOrigins(originConfig);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (isOriginAllowed(origin, allowedOrigins)) {
      return callback(null, true);
    }

    console.warn(`CORS: origin "${origin}" não autorizado.`);
    return callback(new Error("Not allowed by CORS"), false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.get("/api/health", (_, res) => res.status(200).send("OK"));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

seedAdminIfEnabled().catch((err) => console.error("Seed error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
  if (allowedOrigins.includes("*")) {
    console.log("CORS liberado para qualquer origem.");
  } else {
    console.log(`CORS autorizado para: ${allowedOrigins.join(", ")}`);
  }
});

function parseAllowedOrigins(value) {
  if (!value || value.trim() === "") {
    return ["*"];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin, origins) {
  if (!origins.length || origins.includes("*")) {
    return true;
  }

  return origins.some((allowed) => matchesOriginPattern(origin, allowed));
}

function matchesOriginPattern(origin, pattern) {
  if (pattern === origin) {
    return true;
  }

  if (!pattern.includes("*")) {
    return false;
  }

  const escapedSegments = pattern
    .split("*")
    .map((segment) => segment.replace(/[-/\\^$+?.()|[\]{}]/g, "\\$&"));
  const regex = new RegExp(`^${escapedSegments.join(".*")}$`);
  return regex.test(origin);
}