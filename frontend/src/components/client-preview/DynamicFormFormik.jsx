import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { cssStringToObject } from "../../utils/styles";

/**
 * DynamicFormFormik renders a dynamic form using Formik and Yup.
 * @param {Array} fields - Array of field definitions.
 * @param {Object} settings - Page-level settings (layout, container, i18n, etc.)
 * @param {Function} onSubmit - Callback for form submission.
 * @param {Object} i18n - Optional i18n mapping for labels/placeholders.
 */
export default function DynamicFormFormik({ form = {}, onSubmit, i18n = {} }) {
  const fields = form.pages || [];
  const settings = form.settings || {};
  // Support grouped fields: fields is now array of groups
  // Each group: { label, fields: [...] }
  const allFields = Array.isArray(fields)
    ? fields.flatMap((group) => group.fields || [])
    : [];

  // Build initial values
  const initialValues = {};
  allFields.forEach((field) => {
    initialValues[field.name] = field.default ?? "";
  });

  // Build Yup validation schema
  const shape = {};
  allFields.forEach((field) => {
    if (field.validation) {
      shape[field.name] = field.validation;
    } else if (field.props?.required) {
      shape[field.name] = Yup.string().required("Required");
    } else {
      shape[field.name] = Yup.string();
    }
  });
  const validationSchema = Yup.object().shape(shape);

  // Render a single field
  function renderField(field, idx, formik) {
    const label = i18n[field.label] || field.label || field.name;
    const commonProps = {
      ...field.props,
      id: field.name,
      name: field.name,
      className:
        field.props?.className ||
        settings.fieldClass ||
        "border rounded px-2 py-1 w-full",
      "aria-label": label,
      "aria-required": field.props?.required || false,
    };

    // Custom component support
    if (field.component) {
      const CustomComponent = field.component;
      return <CustomComponent field={field} formik={formik} {...commonProps} />;
    }

    // Standard field types
    switch (field.type) {
      case "textarea":
        return (
          <div key={idx} className={settings.fieldContainerClass}>
            <label htmlFor={field.name} className="block font-semibold mb-1">
              {label}
            </label>
            <Field as="textarea" {...commonProps} />
            <ErrorMessage
              name={field.name}
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>
        );
      case "checkbox":
        return (
          <div
            key={idx}
            className={
              settings.fieldContainerClass || "flex items-center gap-2"
            }
          >
            <Field type="checkbox" {...commonProps} />
            <label htmlFor={field.name} className="font-semibold">
              {label}
            </label>
            <ErrorMessage
              name={field.name}
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>
        );
      case "dropdown":
      case "select":
        return (
          <div key={idx} className={settings.fieldContainerClass}>
            <label htmlFor={field.name} className="block font-semibold mb-1">
              {label}
            </label>
            <Field as="select" {...commonProps}>
              {(field.options || []).map((opt, i) => (
                <option key={i} value={opt.value ?? opt}>
                  {i18n[opt.label] || opt.label || opt.value || opt}
                </option>
              ))}
            </Field>
            <ErrorMessage
              name={field.name}
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>
        );
      case "radio":
        return (
          <div key={idx} className={settings.fieldContainerClass}>
            <span className="block font-semibold mb-1">{label}</span>
            <div className="flex gap-4">
              {(field.options || []).map((opt, i) => (
                <label key={i} className="inline-flex items-center">
                  <Field
                    type="radio"
                    name={field.name}
                    value={opt.value ?? opt}
                    className={commonProps.className}
                    aria-label={
                      i18n[opt.label] || opt.label || opt.value || opt
                    }
                  />
                  <span className="ml-2">
                    {i18n[opt.label] || opt.label || opt.value || opt}
                  </span>
                </label>
              ))}
            </div>
            <ErrorMessage
              name={field.name}
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>
        );
      case "file":
        return (
          <div key={idx} className={settings.fieldContainerClass || "mb-4"}>
            <label htmlFor={field.name} className="block font-semibold mb-1">
              {label}
            </label>
            <input
              type="file"
              {...commonProps}
              onChange={(e) =>
                formik.setFieldValue(field.name, e.target.files[0])
              }
            />
            <ErrorMessage
              name={field.name}
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>
        );
      case "date":
        return (
          <div key={idx} className={settings.fieldContainerClass}>
            <label htmlFor={field.name} className="block font-semibold mb-1">
              {label}
            </label>
            <Field type="date" {...commonProps} />
            <ErrorMessage
              name={field.name}
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>
        );
      case "button":
        return (
          <div key={idx} className={settings.fieldContainerClass}>
            <button type="button" {...commonProps}>
              {field.label}
            </button>
          </div>
        );
      case "submit":
        return (
          <div key={idx} className={settings.fieldContainerClass}>
            <button type="submit" {...commonProps} value={field.value} />
          </div>
        );
      case "submit":
        return (
          <div key={idx} className={settings.fieldContainerClass}>
            <button type="reset" {...commonProps} value={field.value} />
          </div>
        );
      default:
        return (
          <div key={idx} className={settings.fieldContainerClass}>
            <label htmlFor={field.name} className="block font-semibold mb-1">
              {label}
            </label>
            <Field type={field.type || "text"} {...commonProps} />
            <ErrorMessage
              name={field.name}
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>
        );
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {(formik) => (
        <Form
          className={settings.formClass || "space-y-4"}
          style={cssStringToObject(settings.style)}
        >
          {Array.isArray(fields)
            ? fields.map((group, gIdx) => (
                <div
                  key={gIdx}
                  className="space-x-2"
                  style={cssStringToObject(group.style)}
                >
                  {group.label && (
                    <div className="font-bold text-lg mb-2">{group.label}</div>
                  )}
                  {Array.isArray(group.fields) &&
                    group.fields.map((field, idx) =>
                      renderField(field, `${gIdx}-${idx}`, formik)
                    )}
                </div>
              ))
            : null}
          {/* <button
            type="submit"
            className={
              settings.submitClass || "bg-blue-600 text-white px-4 py-2 rounded"
            }
            aria-label={
              i18n[settings.submitLabel] || settings.submitLabel || "Submit"
            }
          >
            {i18n[settings.submitLabel] || settings.submitLabel || "Submit"}
          </button> */}
        </Form>
      )}
    </Formik>
  );
}
