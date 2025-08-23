import React from "react";
import { Wand2 } from "lucide-react";

export default function FormBuilderRightPanel({
  rightCollapsed,
  setRightCollapsed,
  name,
  setName,
  settings,
  setSettings,
  extractAppliedStyleObjects,
  setShowStyleToolbox,
  handleDeleteForm,
  id,
  addField,
}) {
  return (
    <div className="border rounded p-3 overflow-auto">
      {rightCollapsed ? (
        <button
          className="px-2 py-1 rounded bg-gray-100 border"
          onClick={() => setRightCollapsed(false)}
        >
          Show Details
        </button>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">
              Form{" "}
              <button
                onClick={addField}
                className="bg-blue-600 text-white px-2 py-1 rounded"
              >
                +
              </button>
            </h4>
            <button
              className="text-sm text-gray-600"
              onClick={() => setRightCollapsed(true)}
            >
              Hide
            </button>
          </div>
          <label>
            <span className="text-sm text-gray-600 mb-1">Form Name</span>
            <input
              className="border p-2 rounded w-full mb-3"
              placeholder="Form Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <div className="flex flex-col gap-2 mb-3">
            <div className="flex gap-1 flex-wrap">
              {extractAppliedStyleObjects(settings.style).map((opt) => (
                <span
                  key={opt.css}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 rounded border text-xs gap-1"
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                  <button
                    className="ml-1 text-red-500 hover:text-red-700"
                    type="button"
                    onClick={() =>
                      setSettings((s) => ({
                        ...s,
                        style: (s.style || "")
                          .replace(opt.css, "")
                          .replace(/\s*;\s*;/g, ";")
                          .trim(),
                      }))
                    }
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div>
              <button
                className="px-2 py-1 rounded bg-indigo-100 border inline-flex items-center gap-1"
                type="button"
                onClick={() => setShowStyleToolbox({ type: "form" })}
              >
                <Wand2 size={16} /> Style
              </button>
            </div>
          </div>
          <button
            className="text-red-600 hover:underline"
            onClick={() => handleDeleteForm(id)}
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
}
