import express from "express";
import corsMiddleware from "./middleware/cors.js";
import dotenv from "dotenv";
import formRoutes from "./routes/formRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple in-memory fallback store for previews; not for production use
const previewByFormId = new Map();

// Public: seed preview (upsert into SQLite and memory)
app.post("/api/preview", async (req, res) => {
  try {
    const payload = req.body || {};
    const formId = String(payload.id || "");
    if (!formId) {
      console.error("[preview] missing_id", { body: req.body });
      return res.status(400).json({ error: "missing_id" });
    }
    previewByFormId.set(formId, payload);
    try {
      const { default: prisma } = await import("./prismaClient.js");
      const data = {
        id: formId,
        name: payload.name || "",
        userId: payload.userId || "anon",
        pages: payload.fields ?? [],
        published: false,
      };
      await prisma.form.upsert({
        where: { id: formId },
        update: {
          name: data.name,
          pages: data.pages,
          published: false,
        },
        create: data,
      });
    } catch (e) {
      console.error("[preview] DB upsert failed", {
        error: e?.message,
        stack: e?.stack,
      });
    }
    res.json({ ok: true });
  } catch (e) {
    console.error("[preview] store failed", {
      error: e?.message,
      stack: e?.stack,
      body: req.body,
    });
    res.status(500).json({ error: "preview_store_failed" });
  }
});

// Public: fetch preview by id (DB first, then memory)
app.get("/api/forms/:id/preview", async (req, res) => {
  const id = String(req.params.id);
  try {
    const { default: prisma } = await import("./prismaClient.js");
    const form = await prisma.form.findUnique({ where: { id } });
    if (form) {
      return res.json({
        id: form.id,
        name: form.name,
        pages: form.pages,
        published: form.published ?? false,
      });
    }
  } catch (e) {
    console.warn("preview DB fetch failed:", e?.message);
  }
  if (previewByFormId.has(id)) {
    return res.json(previewByFormId.get(id));
  }
  return res.status(404).json({ error: "preview_not_found" });
});

// create a /api/forms to get drafts from the database
app.get("/api/forms", async (req, res) => {
  try {
    const { default: prisma } = await import("./prismaClient.js");
    const forms = await prisma.form.findMany({
      where: { published: false },
    });
    res.json(forms);
  } catch (e) {
    console.error("[forms] fetch failed", {
      error: e?.message,
      stack: e?.stack,
    });
    res.status(500).json({ error: "forms_fetch_failed" });
  }
});

// Update (save) a form by id
app.put("/api/forms/:id", async (req, res) => {
  const { default: prisma } = await import("./prismaClient.js");
  const id = String(req.params.id);
  const { name, pages, published } = req.body;
  try {
    const updated = await prisma.form.update({
      where: { id },
      data: {
        name,
        pages,
        published: typeof published === "boolean" ? published : undefined,
      },
    });
    res.json(updated);
  } catch (e) {
    console.error("[form:update]", e);
    res.status(404).json({ error: "form_not_found" });
  }
});

// Mount the rest of /api (may include auth)
app.use("/api", formRoutes);

// Routes (may include auth). Keep after public preview endpoints so they don't get blocked.
// app.use("/api", formRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
