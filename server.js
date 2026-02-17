import express from "express";
import cors from "cors";
import aiRoutes from "./ai.js";

const app = express();
const allowed = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowed.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.static("."));

app.get("/ping", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/ai", aiRoutes);

app.listen(3000, () => console.log("App + API running on http://localhost:3000"));
