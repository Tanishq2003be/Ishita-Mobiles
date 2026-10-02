import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
  override: true,
});

const app = express();
const PORT = 4000;

const phonesFile = path.join(__dirname, "data", "phones.json");
const reviewsFile = path.join(__dirname, "data", "reviews.json");

const ADMIN_KEY = process.env.ADMIN_KEY?.trim();

if (!ADMIN_KEY) {
  console.error("ADMIN_KEY is missing from server/.env");
  process.exit(1);
}

console.log("Admin key loaded:", `${ADMIN_KEY.slice(0, 3)}***`);

const requireAdmin = (req, res, next) => {
  const adminKey = String(req.headers["x-admin-key"] || "").trim();

  if (adminKey !== ADMIN_KEY) {
    return res.status(401).json({
      message: "Administrator access required",
    });
  }

  next();
};
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const read = (f) => JSON.parse(fs.readFileSync(f, "utf8")),
  write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));
const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename: (_, file, cb) =>
    cb(
      null,
      Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9.-]/g, "-"),
    ),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, f, cb) => cb(null, f.mimetype.startsWith("image/")),
});
app.get("/api/health", (_, res) => res.json({ ok: true }));
app.get("/api/phones", (_, res) => res.json(read(phonesFile)));
app.post("/api/phones", requireAdmin, upload.single("image"), (req, res) => {
  const list = read(phonesFile),
    phone = {
      id: crypto.randomUUID(),
      ...req.body,
      price: Number(req.body.price),
      image: req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl,
    };
  if (!phone.name || !phone.image)
    return res.status(400).json({ message: "Name and image are required" });
  list.push(phone);
  write(phonesFile, list);
  res.status(201).json(phone);
});
app.put("/api/phones/:id", requireAdmin, upload.single("image"), (req, res) => {
  const list = read(phonesFile),
    i = list.findIndex((x) => x.id === req.params.id);
  if (i < 0) return res.sendStatus(404);
  list[i] = {
    ...list[i],
    ...req.body,
    price: Number(req.body.price || list[i].price),
    image: req.file
      ? `/uploads/${req.file.filename}`
      : req.body.imageUrl || list[i].image,
  };
  write(phonesFile, list);
  res.json(list[i]);
});
app.post("/api/admin/login", (req, res) => {
  const adminKey = String(req.body?.adminKey || "").trim();

  console.log(
    "Admin login attempt:",
    `${adminKey.slice(0, 3)}***`,
  );

  if (!adminKey || adminKey !== ADMIN_KEY) {
    return res.status(401).json({
      message: "Invalid administrator key",
    });
  }

  return res.status(200).json({
    authenticated: true,
  });
});
app.put(
  "/api/phones/:id",
  requireAdmin,
  upload.single("image"),
  (req, res) => {
    const list = read(phonesFile);
    const index = list.findIndex(
      (phone) => phone.id === req.params.id,
    );

    if (index < 0) {
      return res.status(404).json({
        message: "Mobile not found",
      });
    }

    list[index] = {
      ...list[index],
      ...req.body,
      price: Number(
        req.body.price || list[index].price,
      ),
      image: req.file
        ? `/uploads/${req.file.filename}`
        : list[index].image,
    };

    write(phonesFile, list);

    return res.json(list[index]);
  },
);
app.delete("/api/phones/:id", requireAdmin, (req, res) => {
  const list = read(phonesFile).filter((x) => x.id !== req.params.id);
  write(phonesFile, list);
  res.sendStatus(204);
});
app.get("/api/reviews", (_, res) => res.json(read(reviewsFile)));
app.post("/api/reviews", (req, res) => {
  const list = read(reviewsFile),
    review = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...req.body,
      rating: Number(req.body.rating),
    };
  if (!review.name || !review.text)
    return res.status(400).json({ message: "Name and review are required" });
  list.unshift(review);
  write(reviewsFile, list);
  res.status(201).json(review);
});
app.listen(PORT, "127.0.0.1", () =>
  console.log(`API running at http://127.0.0.1:${PORT}`),
);
