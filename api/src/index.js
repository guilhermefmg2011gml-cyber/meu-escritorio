import "dotenv/config";
import express from "express";
import cors from "cors";
import { seedAdminIfEnabled } from "./seed.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
app.use(express.json());

const ORIGIN = process.env.ALLOWED_ORIGIN || "*";
app.use(
  cors({
    origin: ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/api/health", (_, res) => res.status(200).send("OK"));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

seedAdminIfEnabled().catch((err) => console.error("Seed error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});