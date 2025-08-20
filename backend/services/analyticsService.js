import prisma from "../prismaClient.js";

export async function getSubmissionAnalytics(formId) {
  const count = await prisma.submission.count({
    where: { formId: Number(formId) },
  });
  const submissions = await prisma.submission.findMany({
    where: { formId: Number(formId) },
    orderBy: { timestamp: "asc" },
  });
  return {
    total: count,
    timeline: submissions.map((s) => ({ timestamp: s.timestamp, id: s.id })),
  };
}
