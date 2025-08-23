import React, { useState } from "react";
import { FIELD_TYPES } from "../utils/constants";

export default function FieldEditor({ field, onChange, onDelete }) {
  const [optionInput, setOptionInput] = useState("");
  function handleChange(key, value) {
    if (key === "required") {
      // Ensure required is saved in props
      onChange({
        ...field,
        props: { ...field.props, required: value },
      });
    } else {
      onChange({ ...field, [key]: value });
    }
  }
  function addOption() {
    if (optionInput.trim()) {
      const newOptions = [...(field.options || []), optionInput.trim()];
      handleChange("options", newOptions);
      setOptionInput("");
    }
  }
  return (
    <div className="flex gap-2 w-full bg-amber-100 p-4 rounded-lg">
      <div className="flex flex-col gap-2 w-full">
        <select
          value={field.type || "text"}
          onChange={(e) => handleChange("type", e.target.value)}
        >
          {FIELD_TYPES.map((ft) => (
            <option key={ft.value} value={ft.value}>
              {ft.label}
            </option>
          ))}
        </select>
        <input
          placeholder="Field Label"
          value={field.label || ""}
          onChange={(e) => handleChange("label", e.target.value)}
        />
        <div className="flex items-center mt-4 gap-2">
          <label>
            <input
              type="checkbox"
              checked={field.props?.required || false}
              onChange={(e) => handleChange("required", e.target.checked)}
            />{" "}
            Required
          </label>
          <input
            className="border p-2 rounded"
            placeholder="Validation (e.g. regex)"
            value={field.validation || ""}
            onChange={(e) => handleChange("validation", e.target.value)}
          />
        </div>
        {(field.type === "dropdown" || field.type === "radio") && (
          <div className="mt-4">
            <div className="flex gap-2 mb-2">
              <input
                className="border p-2 rounded flex-1"
                placeholder="Option label"
                value={optionInput}
                onChange={(e) => setOptionInput(e.target.value)}
              />
              <button
                type="button"
                className="bg-blue-600 text-white px-2 rounded"
                onClick={addOption}
              >
                Add Option
              </button>
            </div>
            <ul>
              {(field.options || []).map((opt, i) => (
                <li key={i}>{opt}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div>
        <button type="button" onClick={onDelete}>
          &times;
        </button>
      </div>
    </div>
  );
}
