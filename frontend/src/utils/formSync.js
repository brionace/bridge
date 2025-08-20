// Unified sync utility for browser storage
export function syncFormToBrowserStorage(form) {
  if (!form || !form.id) return;
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
