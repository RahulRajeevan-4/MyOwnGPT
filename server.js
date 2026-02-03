// server/index.js
import express from "express";
import cors from "cors";
import aiRoutes from "./ai.js";

const app = express();
const allowed = ["http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:3000"];


app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests with no origin (Thunder/Postman/curl)
      if (!origin) return cb(null, true);
      if (allowed.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  }),
);
// app.options("*", cors());

app.use(express.json());
app.use((req, res, next) => {
  console.log("REQ:", req.method, req.url);
  console.log("  origin:", req.headers.origin);
  console.log("  content-type:", req.headers["content-type"]);
  next();
});

app.get("/ping", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/ai", aiRoutes);

app.listen(3000, () => console.log("API running on http://localhost:3000"));
