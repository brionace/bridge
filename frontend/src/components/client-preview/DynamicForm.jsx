import React from "react";
import { FIELD_TYPES } from "../../utils/constants";

/**
 * DynamicForm renders a form from JSON data.
 * @param {Object} props
 * @param {Array} props.fields - Array of field definitions from API.
 * @param {Object} props.settings - Form settings (e.g., submitLabel).
 * @param {Function} [props.onSubmit] - Optional submit handler.
 */
export default function DynamicForm({ fields = [], settings = {}, onSubmit }) {
  function handleSubmit(e) {
    e.preventDefault();
    const formData = {};
    fields.forEach((field) => {
      formData[field.name] = e.target[field.name]?.value;
    });
    if (onSubmit) {
      onSubmit(formData);
    } else {
      alert("Form submitted!\n" + JSON.stringify(formData, null, 2));
    }
  }

  // Helper to get field type config
  function getFieldTypeConfig(type) {
    return (
      FIELD_TYPES.find((t) => t.value === type) || { value: type, label: type }
    );
  }

  // Render a single field element
  function renderField(field, idx) {
    const typeConfig = getFieldTypeConfig(field.type);
    const fieldClass = settings.fieldClass || "border rounded px-2 py-1 w-full";
    const containerTag = settings.fieldContainer || "div";
    const Container = containerTag;

    // Use field.props for element props
    const elementProps = {
      id: field.name,
      name: field.name,
      className: fieldClass,
      defaultValue: field.default || "",
      ...(field.props || {}),
    };

    let element = null;
    switch (field.type) {
      case "textarea":
        element = <textarea {...elementProps} />;
        break;
      case "checkbox":
        element = (
          <input
            type="checkbox"
            {...elementProps}
            defaultChecked={!!field.default}
          />
        );
        break;
      case "dropdown":
        element = (
          <select {...elementProps}>
            {(field.options || []).map((opt, i) => (
              <option key={i} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        );
        break;
      case "radio":
        element = (
          <div className="flex gap-4">
            {(field.options || []).map((opt, i) => (
              <label key={i} className="inline-flex items-center">
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value || opt}
                  defaultChecked={field.default === (opt.value || opt)}
                  className={fieldClass}
                  {...(field.props || {})}
                />
                <span className="ml-2">{opt.label || opt}</span>
              </label>
            ))}
          </div>
        );
        break;
      default:
        element = <input type={field.type || "text"} {...elementProps} />;
    }

    // Allow settings to intercept and wrap field
    if (typeof settings.renderField === "function") {
      return settings.renderField(field, element, idx);
    }

    // Default container
    return (
      <Container key={idx} className={settings.fieldContainerClass || "mb-4"}>
        <label className="block font-semibold mb-1" htmlFor={field.name}>
          {field.label || typeConfig.label || field.name}
        </label>
        {element}
      </Container>
    );
  }

  // Only return field elements, not the form wrapper
  const fieldElements = fields.map(renderField);

  // Return field elements, possibly intercepted by settings
  if (typeof settings.interceptFields === "function") {
    return settings.interceptFields(fieldElements);
  }

  return <>{fieldElements}</>;
}
