import prisma from "../prismaClient.js";

// Get a single service (form) by id
export async function getService(req, res) {
  try {
    const { id } = req.params;
    const { default: prisma } = await import("../prismaClient.js");
    const form = await prisma.form.findUnique({ where: { id } });
    if (!form) return res.status(404).json({ error: "not_found" });
    res.json(form);
  } catch (e) {
    res.status(500).json({ error: "get_failed", details: e?.message });
  }
}

// Get all services (forms)
export async function getServices(req, res) {
  try {
    const { userId } = req.query;
    const { default: prisma } = await import("../prismaClient.js");
    const where = userId ? { userId } : {};
    const forms = await prisma.form.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(forms);
  } catch (e) {
    res.status(500).json({ error: "get_failed", details: e?.message });
  }
}

// Update a service (form) by id
export async function updateService(req, res) {
  try {
    const { id } = req.params;
    const { default: prisma } = await import("../prismaClient.js");
    const form = await prisma.form.update({
      where: { id },
      data: req.body,
    });
    res.json(form);
  } catch (e) {
    res.status(500).json({ error: "update_failed", details: e?.message });
  }
}
// Delete a service (form) by id
export async function deleteService(req, res) {
  try {
    const { id } = req.params;
    const { default: prisma } = await import("../prismaClient.js");
    await prisma.form.delete({ where: { id } });
    res.json({ ok: true, id });
  } catch (e) {
    res.status(404).json({ error: "delete_failed", details: e?.message });
  }
}
// Create a new service (form)
export async function createService(req, res) {
  try {
    const {
      name,
      userId = "anon",
      fields = [],
      settings = {},
      isDraft = false,
    } = req.body;
    const { default: prisma } = await import("../prismaClient.js");
    const form = await prisma.form.create({
      data: {
        name,
        userId,
        fields,
        settings,
        isDraft,
      },
    });
    res.status(201).json({ id: form.id, ...form });
  } catch (e) {
    res.status(500).json({ error: "create_failed", details: e?.message });
  }
}

export async function createForm(req, res) {
  const { name, fields, settings } = req.body;
  try {
    const form = await prisma.form.create({
      data: {
        userId: req.user.id,
        name,
        fields,
        settings,
      },
    });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getForms(req, res) {
  try {
    const forms = await prisma.form.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getForm(req, res) {
  try {
    const form = await prisma.form.findUnique({
      where: { id: req.params.id },
    });
    if (!form) return res.status(404).json({ error: "Not found" });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateForm(req, res) {
  try {
    const form = await prisma.form.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteForm(req, res) {
  try {
    await prisma.form.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getEmbedCode(req, res) {
  const formId = req.params.id;
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  res.json({
    iframe: `<iframe src="${baseUrl}/embed/${formId}" width="100%" height="500"></iframe>`,
    widget: `<script src="${baseUrl}/widget.js" data-form-id="${formId}"></script>`,
    link: `${baseUrl}/embed/${formId}`,
  });
}
