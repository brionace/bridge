import React, { useEffect, useMemo, useState } from "react";
import FormBuilderLeftPanel from "./FormBuilderLeftPanel";
import FormBuilderRightPanel from "./FormBuilderRightPanel";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { cssStringToObject, extractAppliedStyleObjects } from "../utils/styles";
import { syncFormToBrowserStorage } from "../utils/formSync";
import axios, { supabase } from "../utils/axios";
import StyleToolbox from "./StyleToolbox";
import { Wand2 } from "lucide-react";
import FieldEditor from "./FieldEditor";

export default function FormBuilder() {
  const navigate = useNavigate();
  const { state, search } = useLocation();
  const { id } = useParams();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const draftIdParam = params.get("draftId");
  const template = state?.template || null;

  const [name, setName] = useState(template?.name || "");
  const initialPages = useMemo(() => {
    if (template?.pages) {
      if (Array.isArray(template.pages) && template.pages[0]?.fields)
        return template.pages;
      return template.pages.map((fields, i) => ({
        pageName: `Page ${i + 1}`,
        fields,
      }));
    }
    return [{ pageName: "Page 1", fields: [] }];
  }, [template]);
  const [pages, setPages] = useState(initialPages);
  const [currentPage, setCurrentPage] = useState(() => {
    const sp = state?.startPage;
    return typeof sp === "number" && sp >= 0 ? sp : 0;
  });
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  // Validation helpers
  const hasAnyField = pages.some((p) => (p.fields || []).length > 0);
  const nameOk = name.trim().length > 0;
  const canSave = nameOk && hasAnyField;
  const saveMissingMsg = !canSave
    ? `Add ${[
        !nameOk ? "a name" : null,
        !hasAnyField ? "at least one field" : null,
      ]
        .filter(Boolean)
        .join(" and ")}`
    : "";
  const [previewJson, setPreviewJson] = useState("");
  const [previewSource, setPreviewSource] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showStyleToolbox, setShowStyleToolbox] = useState(null);
  const [settings, setSettings] = useState({});

  // Persist collapse state across sessions
  useEffect(() => {
    const l = localStorage.getItem("fb:leftCollapsed");
    const r = localStorage.getItem("fb:rightCollapsed");
    if (l !== null) setLeftCollapsed(l === "1");
    if (r !== null) setRightCollapsed(r === "1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    localStorage.setItem("fb:leftCollapsed", leftCollapsed ? "1" : "0");
  }, [leftCollapsed]);
  useEffect(() => {
    localStorage.setItem("fb:rightCollapsed", rightCollapsed ? "1" : "0");
  }, [rightCollapsed]);

  const gridCols =
    leftCollapsed && rightCollapsed
      ? "grid-cols-[0_1fr_0]"
      : leftCollapsed
      ? "grid-cols-[0_1fr_16rem]"
      : rightCollapsed
      ? "grid-cols-[16rem_1fr_0]"
      : "grid-cols-[16rem_1fr_16rem]";

  function addField() {
    setPages((pages) =>
      pages.map((page, idx) =>
        idx === currentPage
          ? {
              ...page,
              fields: [
                ...page.fields,
                {
                  type: "text",
                  label: "",
                  name: `field_${page.fields.length + 1}`,
                },
              ],
            }
          : page
      )
    );
    // If no name yet, set a default so Save can enable after first field is added
    if (name.trim().length === 0) {
      setName("Untitled form");
    }
  }
  function updateField(idx, field) {
    setPages((pages) =>
      pages.map((page, pageIdx) =>
        pageIdx === currentPage
          ? {
              ...page,
              fields: page.fields.map((f, i) =>
                i === idx
                  ? {
                      ...field,
                      name: field.name || f.name || `field_${i + 1}`,
                    }
                  : f
              ),
            }
          : page
      )
    );
  }
  function deleteField(idx) {
    setPages((pages) =>
      pages.map((page, pageIdx) =>
        pageIdx === currentPage
          ? { ...page, fields: page.fields.filter((_, i) => i !== idx) }
          : page
      )
    );
  }
  function addPage() {
    setPages((pages) => [
      ...pages,
      { pageName: `Page ${pages.length + 1}`, fields: [] },
    ]);
    setCurrentPage((i) => i + 1);
  }
  function removePage(idx) {
    if (pages.length > 1) {
      setPages((pages) => pages.filter((_, i) => i !== idx));
      setCurrentPage((i) => Math.max(0, i - (idx <= i ? 1 : 0)));
    }
  }
  async function handleSave() {
    if (!canSave || saving) return;
    setSaving(true);
    const payload = { name, pages, settings };

    // Determine effective id for this save
    let savedFormId = null;
    let effectiveId = id || draftIdParam;

    // If editing a saved form, update it
    if (id) {
      try {
        const res = await axios.put(`/api/forms/${id}`, payload);
        savedFormId = res.data?.id || id;
        effectiveId = savedFormId;
        syncFormToBrowserStorage(res.data);
      } catch (e) {
        // swallow backend errors so we can still show local preview
        console.log(e);
      }
    } else if (draftIdParam) {
      // Always seed preview for drafts
      try {
        let userId = null;
        try {
          const s = await supabase.auth.getSession();
          userId = s?.data?.session?.user?.id || null;
        } catch {}
        const res = await axios.post("/api/preview", {
          userId,
          id: draftIdParam,
          ...payload,
        });
        if (res.data) syncFormToBrowserStorage(res.data);
      } catch (e) {
        console.log(e);
      }
    } else {
      // Creating a new form (non-draft)
      try {
        const res = await axios.post("/api/forms", payload);
        savedFormId = res.data?.id || null;
        effectiveId = savedFormId;
        syncFormToBrowserStorage(res.data);
      } catch (e) {
        // swallow backend errors so we can still show local preview
      }
    }

    // Always save to sessionStorage (keyed by id) and show preview
    try {
      const localDoc = { id: effectiveId, updatedAt: Date.now(), ...payload };
      sessionStorage.setItem(
        `form:preview:${effectiveId}`,
        JSON.stringify(localDoc)
      );
      sessionStorage.setItem("form:lastSavedId", effectiveId);
      // Maintain a simple drafts index for dashboard fallback (deduped, newest first)
      try {
        const raw = sessionStorage.getItem("form:draftIndex");
        let arr = raw ? JSON.parse(raw) : [];
        arr = [effectiveId, ...arr.filter((x) => x !== effectiveId)];
        sessionStorage.setItem(
          "form:draftIndex",
          JSON.stringify(arr.slice(0, 100))
        );
      } catch {}
      setPreviewJson(JSON.stringify(localDoc, null, 2));
      setPreviewSource("local");
    } catch {}

    // If a new form was created, move to the canonical URL with its id
    try {
      if (savedFormId && savedFormId !== id) {
        // Clean up draft storage if we navigated from a draft
        if (draftIdParam) {
          try {
            sessionStorage.removeItem(`form:preview:${draftIdParam}`);
            const raw = sessionStorage.getItem("form:draftIndex");
            if (raw) {
              const arr = JSON.parse(raw).filter((x) => x !== draftIdParam);
              sessionStorage.setItem("form:draftIndex", JSON.stringify(arr));
            }
          } catch {}
        }
        navigate(`/builder/${savedFormId}`, { replace: true });
      }
    } catch {}
    setSaving(false);
  }
  async function handlePublish() {
    if (!draftIdParam) return;
    try {
      const payload = { name, pages, published: true };
      const res = await axios.put(`/api/forms/${draftIdParam}`, payload);
      // Remove from browser storage
      sessionStorage.removeItem(`form:preview:${draftIdParam}`);
      const raw = sessionStorage.getItem("form:draftIndex");
      let arr = raw ? JSON.parse(raw) : [];
      arr = arr.filter((x) => x !== draftIdParam);
      sessionStorage.setItem("form:draftIndex", JSON.stringify(arr));
      // Redirect to live builder
      navigate(`/builder/${draftIdParam}`);
    } catch (err) {
      alert("Failed to publish draft.");
    }
  }
  async function handleDeleteForm(id) {
    try {
      await axios.delete(`/api/forms/${id}`);
      window.sessionStorage.removeItem(`form:preview:${id}`);
      let raw = window.sessionStorage.getItem("form:draftIndex");
      let arr = raw ? JSON.parse(raw) : [];
      arr = arr.filter((x) => x !== id);
      window.sessionStorage.setItem("form:draftIndex", JSON.stringify(arr));
      setForms(forms.filter((s) => s.id !== id));
    } catch {}
  }

  useEffect(() => {
    if (!id) return;
    (async () => {
      function ensureFieldNames(pages) {
        return pages.map((page, i) => ({
          ...page,
          fields: (page.fields || []).map((field, idx) => ({
            ...field,
            name: field.name || `field_${idx + 1}`,
          })),
        }));
      }
      try {
        const res = await axios.get(`/api/forms/${id}`);
        const form = res.data;
        setName(form.name || "");
        if (Array.isArray(form.pages)) {
          if (form.pages.length && form.pages[0]?.fields) {
            setPages(ensureFieldNames(form.pages));
            setSettings(form.settings || {});
          } else {
            setPages(
              form.pages.map((fields, i) => ({
                pageName: `Page ${i + 1}`,
                fields: fields.map((field, idx) => ({
                  ...field,
                  name:
                    typeof field.label === "string" &&
                    field.label.trim().length > 0
                      ? field.label.trim().replace(/\s+/g, "_").toLowerCase()
                      : `field_${idx + 1}`,
                })),
              }))
            );
          }
          setCurrentPage(0);
        }
      } catch (e) {
        // If server fetch fails, try to hydrate from local preview by id
        try {
          const raw = sessionStorage.getItem(`form:preview:${id}`);
          if (raw) {
            const doc = JSON.parse(raw);
            setName(doc.name || "");
            if (Array.isArray(doc.pages)) {
              if (doc.pages.length && doc.pages[0]?.fields) {
                setPages(ensureFieldNames(doc.pages));
                setSettings(doc.settings || {});
              } else {
                setPages(
                  doc.pages.map((fields, i) => ({
                    pageName: `Page ${i + 1}`,
                    fields: fields.map((field, idx) => ({
                      ...field,
                      name:
                        typeof field.label === "string" &&
                        field.label.trim().length > 0
                          ? field.label
                              .trim()
                              .replace(/\s+/g, "_")
                              .toLowerCase()
                          : `field_${idx + 1}`,
                    })),
                  }))
                );
              }
              setCurrentPage(0);
            }
          }
        } catch {}
      }
    })();
  }, [id]);

  // Load draft content into editor when draftId is present (no server id)
  useEffect(() => {
    if (id || !draftIdParam) return;
    function ensureFieldNames(pages) {
      return pages.map((page, i) => ({
        ...page,
        fields: (page.fields || []).map((field, idx) => ({
          ...field,
          name:
            typeof field.label === "string" && field.label.trim().length > 0
              ? field.label.trim().replace(/\s+/g, "_").toLowerCase()
              : field.name || `field_${idx + 1}`,
        })),
      }));
    }
    try {
      const raw = sessionStorage.getItem(`form:preview:${draftIdParam}`);
      if (!raw) return;
      const doc = JSON.parse(raw);
      setName(doc.name || "");
      if (Array.isArray(doc.fields)) {
        if (doc.fields.length && doc.fields[0]?.fields) {
          setPages(ensureFieldNames(doc.fields));
        } else {
          setPages(
            doc.fields.map((fields, i) => ({
              pageName: `Page ${i + 1}`,
              fields: fields.map((field, idx) => ({
                ...field,
                name: field.name || `field_${idx + 1}`,
              })),
            }))
          );
        }
        setCurrentPage(0);
      }
    } catch {}
  }, [id, draftIdParam]);

  // Fetch preview by id so each form can be previewed individually
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (id) {
          try {
            const res = await axios.get(`/api/forms/${id}`);
            if (!cancelled) {
              setPreviewJson(JSON.stringify(res.data, null, 2));
              setPreviewSource("api");
              return;
            }
          } catch {
            // If API not available or not found, fall back to session by id
            const local = sessionStorage.getItem(`form:preview:${id}`);
            if (local && !cancelled) {
              setPreviewJson(local);
              setPreviewSource("local");
              return;
            }
          }
        } else {
          // No id: try draft from session as a convenience
          const lastId = sessionStorage.getItem("form:lastSavedId");
          const s = lastId
            ? sessionStorage.getItem(`form:preview:${lastId}`)
            : null;
          if (s && !cancelled) {
            setPreviewJson(s);
            setPreviewSource("local");
          }
        }
      } catch {
        // silent; user can still Save to generate preview
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, draftIdParam]);

  // Seed backend preview store on mount when working with a draft id
  useEffect(() => {
    (async () => {
      if (!draftIdParam) return;
      try {
        const raw = sessionStorage.getItem(`form:preview:${draftIdParam}`);
        const fallback = {
          id: draftIdParam,
          name,
          pages,
        };
        const doc = raw ? JSON.parse(raw) : fallback;
        await axios.post("/api/forms", {
          id: draftIdParam,
          name: doc.name || name,
          pages: doc.pages || pages,
        });
      } catch {}
    })();
    // We only want this to run once per draft id
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftIdParam]);

  async function refreshPreview() {
    if (id) {
      try {
        const res = await axios.get(`/api/forms/${id}`);
        setPreviewJson(JSON.stringify(res.data, null, 2));
        setPreviewSource("api");
        return;
      } catch {
        // fall through to local
      }
    }
    if (draftIdParam) {
      const raw = sessionStorage.getItem(`form:preview:${draftIdParam}`);
      if (raw) {
        setPreviewJson(raw);
        setPreviewSource("local");
        return;
      }
    }
    setPreviewJson(JSON.stringify({ name, pages, published: false }, null, 2));
    setPreviewSource("local");
  }

  if (!draftIdParam && !id) {
    const PREMADE_TEMPLATES = [
      {
        name: "License Application",
        fields: [
          [
            { type: "text", label: "Full Name", props: { required: true } },
            { type: "date", label: "Date of Birth", props: { required: true } },
            {
              type: "dropdown",
              label: "License Type",
              props: { required: true },
              options: ["A", "B", "C"],
            },
          ],
        ],
      },
      {
        name: "Payment Request",
        fields: [
          [
            { type: "number", label: "Amount", props: { required: true } },
            {
              type: "dropdown",
              label: "Payment Method",
              props: { required: true },
              options: ["Credit Card", "Bank Transfer"],
            },
          ],
        ],
      },
    ];

    function createDraftId() {
      return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function seedDraftInSession(id, tpl) {
      try {
        const doc = {
          id,
          name: tpl?.name || "",
          pages: tpl?.pages
            ? Array.isArray(tpl.pages) && tpl.pages[0]?.fields
              ? tpl.pages
              : tpl.pages.map((fields, i) => ({
                  pageName: `Page ${i + 1}`,
                  fields,
                }))
            : [{ pageName: "Page 1", fields: [] }],
          updatedAt: Date.now(),
        };
        sessionStorage.setItem(`form:preview:${id}`, JSON.stringify(doc));
        const raw = sessionStorage.getItem("form:draftIndex");
        let arr = raw ? JSON.parse(raw) : [];
        arr = [id, ...arr.filter((x) => x !== id)];
        sessionStorage.setItem(
          "form:draftIndex",
          JSON.stringify(arr.slice(0, 100))
        );
      } catch {}
    }

    async function handleNewForm(tpl) {
      const id = createDraftId();
      seedDraftInSession(id, tpl || null);
      try {
        const res = await axios.post("/api/forms", {
          id,
          name: tpl?.name || "",
          pages: tpl?.pages || [{ pageName: "Page 1", fields: [] }],
          settings: {},
        });
        syncFormToBrowserStorage(res.data);
      } catch {}
      navigate(`?draftId=${encodeURIComponent(id)}`, {
        state: tpl ? { template: tpl } : undefined,
      });
    }

    return (
      <div className="flex flex-wrap gap-2">
        <button
          className="block text-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 mb-3"
          onClick={() => handleNewForm()}
          type="button"
        >
          New Form
        </button>
        {PREMADE_TEMPLATES.map((tpl) => (
          <button
            key={tpl.name}
            className="rounded bg-gray-200 px-2 py-1 text-sm hover:bg-gray-300"
            onClick={() => handleNewForm(tpl)}
            type="button"
          >
            {tpl.name}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-screen bg-slate-50">
      <main className={`grid ${gridCols} gap-4 h-screen`}>
        <FormBuilderLeftPanel
          leftCollapsed={leftCollapsed}
          setLeftCollapsed={setLeftCollapsed}
          pages={pages}
          setPages={setPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          addPage={addPage}
          removePage={removePage}
          extractAppliedStyleObjects={extractAppliedStyleObjects}
          setShowStyleToolbox={setShowStyleToolbox}
        />
        {/* Center */}
        <div className="border rounded p-3 overflow-auto">
          <section className="bg-white rounded-lg p-3 overflow-auto">
            <div
              className="flex justify-center items-center max-w-xl mx-auto"
              style={cssStringToObject(settings.style)}
            >
              {pages.map((page) => (
                <div className="form" style={cssStringToObject(page.style)}>
                  {page.fields.map((field, idx) => (
                    <div
                      key={idx}
                      className="form-field"
                      style={cssStringToObject(field.style)}
                    >
                      <div className="field-label text-xs w-6 h-3 mb-1 bg-gray-500">
                        {/* {field.label} */}
                      </div>
                      <div className="field-input w-12 h-6 bg-gray-500">
                        {/* {field.input} */}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
          <section className="max-w-xl mx-auto mt-4">
            <div>
              {pages[currentPage].fields.length === 0 ? (
                <p className="text-center text-gray-500">
                  No fields yet. Use the Add Field button to get started.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {pages[currentPage].fields.map((field, idx) => (
                    <FieldEditor
                      key={idx}
                      field={field}
                      onChange={(f) => updateField(idx, f)}
                      onDelete={() => deleteField(idx)}
                    />
                  ))}
                </div>
              )}
              {!hasAnyField && (
                <p className="text-sm text-red-600 mt-3">
                  Add at least one field to save.
                </p>
              )}
            </div>
          </section>
          <section className="flex items-center justify-between bg-white rounded-lg p-3">
            <button
              className="px-3 py-2 rounded bg-gray-200"
              onClick={() => {
                // Remove current draft/form from storage and go back to dashboard
                navigate("/dashboard");
              }}
            >
              Back to Dashboard
            </button>
            <button
              className="px-3 py-2 rounded bg-gray-200"
              onClick={() => {
                // Remove current draft/form from storage and go back to dashboard
                navigate("/preview/" + id);
              }}
            >
              Preview
            </button>
            <div className="flex items-center gap-3">
              {/* {!canSave && (
                  <span className="text-sm text-slate-600">
                    {saveMissingMsg}
                  </span>
                )} */}
              <button
                className={`px-3 py-2 rounded text-white ${
                  canSave
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-300 cursor-not-allowed opacity-60"
                }`}
                onClick={handleSave}
                disabled={!canSave}
                title={!canSave ? saveMissingMsg : ""}
              >
                Save
              </button>
              {draftIdParam && (
                <button
                  className={`px-3 py-2 rounded text-white bg-green-600 hover:bg-green-700`}
                  onClick={handlePublish}
                  disabled={!canSave}
                  title={
                    !canSave
                      ? "Complete all required fields before publishing."
                      : ""
                  }
                >
                  Publish
                </button>
              )}
            </div>
          </section>
        </div>
        {/* Right */}
        <FormBuilderRightPanel
          rightCollapsed={rightCollapsed}
          setRightCollapsed={setRightCollapsed}
          name={name}
          setName={setName}
          settings={settings}
          setSettings={setSettings}
          extractAppliedStyleObjects={extractAppliedStyleObjects}
          setShowStyleToolbox={setShowStyleToolbox}
          handleDeleteForm={handleDeleteForm}
          id={id}
          addField={addField}
        />
      </main>
      {showStyleToolbox && (
        <StyleToolbox
          onInsert={(css) => {
            if (showStyleToolbox.type === "form") {
              setSettings((s) => ({
                ...s,
                style:
                  (s.style ? s.style.trim() : "") +
                  (s.style && !s.style.trim().endsWith(";") ? ";" : "") +
                  " " +
                  css,
              }));
            }
            if (showStyleToolbox.type === "page") {
              setPages((pages) =>
                pages.map((page, idx) =>
                  idx === showStyleToolbox.index
                    ? {
                        ...page,
                        style:
                          (page.style ? page.style.trim() : "") +
                          (page.style && !page.style.trim().endsWith(";")
                            ? ";"
                            : "") +
                          " " +
                          css,
                      }
                    : page
                )
              );
            }
            if (showStyleToolbox.type === "field") {
              setPages((pages) =>
                pages.map((page, pIdx) =>
                  pIdx === showStyleToolbox.pageIndex
                    ? {
                        ...page,
                        fields: page.fields.map((field, fIdx) =>
                          fIdx === showStyleToolbox.fieldIndex
                            ? {
                                ...field,
                                style:
                                  (field.style ? field.style.trim() : "") +
                                  (field.style &&
                                  !field.style.trim().endsWith(";")
                                    ? ";"
                                    : "") +
                                  " " +
                                  css,
                              }
                            : field
                        ),
                      }
                    : page
                )
              );
            }
            setShowStyleToolbox(null);
          }}
          onClose={() => setShowStyleToolbox(null)}
        />
      )}
    </div>
  );
}
