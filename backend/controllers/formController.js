import prisma from "../prismaClient.js";

export async function createForm(req, res) {
  const { name, config, pages, paymentEnabled } = req.body;
  try {
    const form = await prisma.form.create({
      data: {
        userId: req.user.id,
        name,
        config,
        pages,
        payments: paymentEnabled
          ? [{ create: { status: "pending", reference: "", amount: 0 } }]
          : undefined,
      },
    });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getForm(req, res) {
  try {
    const form = await prisma.form.findUnique({
      where: { id: Number(req.params.id) },
      include: { submissions: true, payments: true },
    });
    if (!form) return res.status(404).json({ error: "Form not found" });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function submitToForm(req, res) {
  try {
    const submission = await prisma.submission.create({
      data: {
        formId: Number(req.params.id),
        data: req.body,
      },
    });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getFormEntries(req, res) {
  try {
    const entries = await prisma.submission.findMany({
      where: { formId: Number(req.params.id) },
    });
    res.json(entries);
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
