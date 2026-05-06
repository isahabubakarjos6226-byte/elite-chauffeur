import { Router } from "express";
import multer from "multer";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";
import { randomBytes } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = join(__dirname, "..", "..", "uploads");
mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = randomBytes(8).toString("hex");
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const router = Router();

router.post("/car-photo", upload.single("photo"), (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
  res.json({ url: `/api/uploads/${req.file.filename}` });
});

router.post("/logo", upload.single("logo"), (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
  res.json({ url: `/api/uploads/${req.file.filename}` });
});

export default router;
