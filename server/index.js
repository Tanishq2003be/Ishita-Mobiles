import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import multer from "multer";
import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.join(__dirname, ".env"),
  override: true,
});

const app = express();
const PORT = process.env.PORT || 4000;

const ADMIN_KEY = process.env.ADMIN_KEY?.trim();
const MONGODB_URI = process.env.MONGODB_URI?.trim();

if (!ADMIN_KEY) {
  console.error("ADMIN_KEY is missing from server/.env");
  process.exit(1);
}

if (!MONGODB_URI) {
  console.error("MONGODB_URI is missing from server/.env");
  process.exit(1);
}

app.use(
  cors({
    origin: ["http://localhost:5173", "https://your-project.vercel.app"],
  }),
);

app.use(express.json());

let cachedConnection = null;
let gridFsBucket;

const connectToDatabase = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  cachedConnection = await mongoose.connect(MONGODB_URI, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    bufferCommands: false,
  });

  gridFsBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: "images",
  });

  console.log("Connected to MongoDB Atlas");
  console.log("GridFS bucket ready");

  return cachedConnection;
};

await connectToDatabase();

const phoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    series: { type: String, required: true },
    tagline: { type: String, default: "" },
    price: { type: Number, required: true },
    display: { type: String, required: true },
    camera: { type: String, required: true },
    battery: { type: String, required: true },
    processor: { type: String, required: true },
    storage: { type: String, required: true },
    color: { type: String, required: true },
    imageId: { type: String, required: true },
  },
  { timestamps: true },
);

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    model: { type: String, required: true },
    rating: { type: Number, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

const Phone = mongoose.model("Phone", phoneSchema);
const Review = mongoose.model("Review", reviewSchema);

const upload = multer({
storage: multer.memoryStorage(),
limits: { fileSize: 4 * 1024 * 1024 },
fileFilter: (_, file, cb) => {
cb(null, file.mimetype.startsWith("image/"));
},
});

const requireAdmin = (req, res, next) => {
  const adminKey = String(req.headers["x-admin-key"] || "").trim();

  if (adminKey !== ADMIN_KEY) {
    return res.status(401).json({
      message: "Administrator access required",
    });
  }

  next();
};

const uploadImageToGridFs = (file) =>
  new Promise((resolve, reject) => {
    const uploadStream = gridFsBucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
    });

    uploadStream.end(file.buffer);

    uploadStream.on("finish", () => {
      resolve(uploadStream.id.toString());
    });

    uploadStream.on("error", reject);
  });

const deleteImageFromGridFs = async (imageId) => {
  try {
    await gridFsBucket.delete(new ObjectId(imageId));
  } catch {
    // Image already missing, ignore
  }
};

const toPhoneResponse = (phoneDoc) => ({
  id: phoneDoc._id.toString(),
  name: phoneDoc.name,
  series: phoneDoc.series,
  tagline: phoneDoc.tagline,
  price: phoneDoc.price,
  display: phoneDoc.display,
  camera: phoneDoc.camera,
  battery: phoneDoc.battery,
  processor: phoneDoc.processor,
  storage: phoneDoc.storage,
  color: phoneDoc.color,
  image: `/api/images/${phoneDoc.imageId}`,
});

const toReviewResponse = (reviewDoc) => ({
  id: reviewDoc._id.toString(),
  name: reviewDoc.name,
  model: reviewDoc.model,
  rating: reviewDoc.rating,
  text: reviewDoc.text,
});

app.get("/api/health", (_, res) => {
  res.json({ ok: true });
});

app.get("/api/images/:id", async (req, res) => {
  try {
    const fileId = new ObjectId(req.params.id);

    const files = await gridFsBucket.find({ _id: fileId }).toArray();

    if (!files.length) {
      return res.sendStatus(404);
    }

    res.set("Content-Type", files[0].contentType);
    gridFsBucket.openDownloadStream(fileId).pipe(res);
  } catch {
    res.sendStatus(404);
  }
});

app.get("/api/phones", async (_, res) => {
  const phones = await Phone.find().sort({ createdAt: -1 });
  res.json(phones.map(toPhoneResponse));
});

app.post(
  "/api/phones",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Mobile image is required",
        });
      }

      const imageId = await uploadImageToGridFs(req.file);

      const phone = await Phone.create({
        name: req.body.name,
        series: req.body.series,
        tagline: req.body.tagline,
        price: Number(req.body.price),
        display: req.body.display,
        camera: req.body.camera,
        battery: req.body.battery,
        processor: req.body.processor,
        storage: req.body.storage,
        color: req.body.color,
        imageId,
      });

      res.status(201).json(toPhoneResponse(phone));
    } catch (error) {
      res.status(500).json({
        message: "Unable to add mobile",
      });
    }
  },
);

app.put(
  "/api/phones/:id",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const phone = await Phone.findById(req.params.id);

      if (!phone) {
        return res.status(404).json({
          message: "Mobile not found",
        });
      }

      let imageId = phone.imageId;

      if (req.file) {
        await deleteImageFromGridFs(phone.imageId);
        imageId = await uploadImageToGridFs(req.file);
      }

      phone.name = req.body.name || phone.name;
      phone.series = req.body.series || phone.series;
      phone.tagline = req.body.tagline ?? phone.tagline;
      phone.price = req.body.price ? Number(req.body.price) : phone.price;
      phone.display = req.body.display || phone.display;
      phone.camera = req.body.camera || phone.camera;
      phone.battery = req.body.battery || phone.battery;
      phone.processor = req.body.processor || phone.processor;
      phone.storage = req.body.storage || phone.storage;
      phone.color = req.body.color || phone.color;
      phone.imageId = imageId;

      await phone.save();

      res.json(toPhoneResponse(phone));
    } catch (error) {
      res.status(500).json({
        message: "Unable to update mobile",
      });
    }
  },
);

app.delete("/api/phones/:id", requireAdmin, async (req, res) => {
  try {
    const phone = await Phone.findById(req.params.id);

    if (!phone) {
      return res.sendStatus(404);
    }

    await deleteImageFromGridFs(phone.imageId);
    await phone.deleteOne();

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete mobile",
    });
  }
});

app.post("/api/admin/login", (req, res) => {
  const adminKey = String(req.body?.adminKey || "").trim();

  if (!adminKey || adminKey !== ADMIN_KEY) {
    return res.status(401).json({
      message: "Invalid administrator key",
    });
  }

  res.json({ authenticated: true });
});

app.get("/api/reviews", async (_, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 });
  res.json(reviews.map(toReviewResponse));
});

app.post("/api/reviews", async (req, res) => {
  const { name, model, rating, text } = req.body;

  if (!name || !text) {
    return res.status(400).json({
      message: "Name and review are required",
    });
  }

  const review = await Review.create({
    name,
    model,
    rating: Number(rating),
    text,
  });

  res.status(201).json(toReviewResponse(review));
});

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
  });
}

export default app;