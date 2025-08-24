import React, { useEffect, useMemo, useState } from "react";
import FormBuilderLeftPanel from "./FormBuilderLeftPanel";
import FormBuilderRightPanel from "./FormBuilderRightPanel";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { cssStringToObject, extractAppliedStyleObjects } from "../utils/styles";
import axios, { supabase } from "../utils/axios";
import StyleToolbox from "./StyleToolbox";
import { Wand2 } from "lucide-react";
import FieldEditor from "./FieldEditor";

export default function FormBuilder() {
  const navigate = useNavigate();
  const { state, search } = useLocation();
  const { id } = useParams();
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
    // If template.fields exists (premade template), use that
    if (template?.fields) {
      if (Array.isArray(template.fields) && template.fields[0]?.fields)
        return template.fields;
      return template.fields.map((fields, i) => ({
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
  const [saving, setSaving] = useState(false);
  const [showStyleToolbox, setShowStyleToolbox] = useState(null);
  const [settings, setSettings] = useState({});
  const [userId, setUserId] = useState("anon");

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || "anon");
    }
    fetchUser();
  }, []);

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
        // If server fetch fails, show empty form
        setName("");
        setPages([{ pageName: "Page 1", fields: [] }]);
        setSettings({});
      }
    })();
  }, [id]);

  if (!id) {
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
    const payload = { name, pages, settings, userId };
    try {
      let res;
      if (id) {
        res = await axios.put(`/api/forms/${id}`, payload);
      } else {
        res = await axios.post(`/api/forms`, payload);
      }
      // Optionally, redirect to canonical URL if new form
      if (res.data?.id && res.data?.id !== id) {
        navigate(`/builder/${res.data.id}`, { replace: true });
      }
    } catch (e) {
      console.log(e);
    }
    setSaving(false);
  }
  async function handlePublish() {
    // Just update published status in DB
    if (!id) return;
    try {
      const payload = { name, pages, published: true, userId };
      await axios.put(`/api/forms/${id}`, payload);
      navigate(`/builder/${id}`);
    } catch (err) {
      alert("Failed to publish form.");
    }
  }
  async function handleDeleteForm(id) {
    try {
      await axios.delete(`/api/forms/${id}`);
      // Remove from local state if needed
      // setForms(forms.filter((s) => s.id !== id));
    } catch {}
  }

  async function handleNewForm(tpl) {
    // Use tpl.fields for premade templates, not tpl.pages
    const isPremade = tpl && tpl.fields;
    const pages = isPremade
      ? Array.isArray(tpl.fields) && tpl.fields[0]?.fields
        ? tpl.fields
        : tpl.fields.map((fields, i) => ({
            pageName: `Page ${i + 1}`,
            fields,
          }))
      : tpl?.pages || [{ pageName: "Page 1", fields: [] }];
    try {
      const res = await axios.post("/api/forms", {
        name: tpl?.name || "Untitled Form",
        pages,
        settings: {},
      });
      if (res.data?.id) {
        navigate(`/builder/${res.data.id}`, {
          state: tpl ? { template: { ...tpl, pages } } : undefined,
        });
      }
    } catch {}
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
              {pages.map((page, pageIdx) => (
                <div
                  key={pageIdx}
                  className="form"
                  style={cssStringToObject(page.style)}
                >
                  {page.fields.map((field, idx) => (
                    <div
                      key={field.name || idx}
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
              {!hasAnyField && (
                <p className="text-sm text-red-600 mt-3 text-center">
                  Add at least one field to save.
                </p>
              )}
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
            </div>
          </section>
          <section className="sticky bottom-0 flex items-center justify-between bg-white rounded-lg p-3">
            <button
              className="px-3 py-2 rounded bg-gray-200"
              onClick={() => {
                // Remove current draft/form from storage and go back to dashboard
                navigate("/dashboard");
              }}
            >
              Dashboard
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
