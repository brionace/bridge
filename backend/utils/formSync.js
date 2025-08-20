// Utility for unified form saving, syncing, and storage
// Backend: DB (Prisma), Frontend: browser storage, network

const { PrismaClient } = require("../prismaClient");
const prisma = new PrismaClient();

/**
 * Save or update a form in the DB, and return the canonical form object.
 * @param {Object} form - The form object to save. Should include id, name, fields, settings, isDraft.
 * @returns {Promise<Object>} - The saved form from DB.
 */
async function saveFormToDB(form) {
  if (!form || !form.name) throw new Error("Form must have a name");
  if (form.id) {
    // Update existing
    return await prisma.form.update({
      where: { id: form.id },
      data: {
        name: form.name,
        fields: form.fields,
        settings: form.settings || {},
        isDraft: !!form.isDraft,
        updatedAt: new Date(),
      },
    });
  } else {
    // Create new
    return await prisma.form.create({
      data: {
        name: form.name,
        fields: form.fields,
        settings: form.settings || {},
        isDraft: !!form.isDraft,
        updatedAt: new Date(),
      },
    });
  }
}

/**
 * Delete a form from DB and return success boolean.
 * @param {string} id - Form ID
 * @returns {Promise<boolean>}
 */
async function deleteFormFromDB(id) {
  if (!id) return false;
  await prisma.form.delete({ where: { id } });
  return true;
}

/**
 * Get a form from DB by ID
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
async function getFormFromDB(id) {
  if (!id) return null;
  return await prisma.form.findUnique({ where: { id } });
}

/**
 * Sync form to browser storage (to be called from frontend via API response)
 * @param {Object} form
 * @param {Window} window
 */
function syncFormToBrowserStorage(form, window) {
  if (!form || !form.id || !window) return;
  window.sessionStorage.setItem(
    `form:preview:${form.id}`,
    JSON.stringify(form)
  );
  let raw = window.sessionStorage.getItem("form:draftIndex");
  let arr = raw ? JSON.parse(raw) : [];
  arr = [form.id, ...arr.filter((x) => x !== form.id)];
  window.sessionStorage.setItem(
    "form:draftIndex",
    JSON.stringify(arr.slice(0, 100))
  );
}

module.exports = {
  saveFormToDB,
  deleteFormFromDB,
  getFormFromDB,
  syncFormToBrowserStorage,
};
