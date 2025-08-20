import React, { useEffect, useState } from "react";
import ClientPreview from "../components/client-preview/ClientPreview";
import { useParams } from "react-router-dom";

export default function Preview() {
  const { formId } = useParams();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!formId) return;
    setLoading(true);
    fetch(`/api/forms/${formId}/preview`)
      .then((res) => {
        if (!res.ok) throw new Error("Form not found");
        return res.json();
      })
      .then((data) => {
        setForm(data || {});
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setForm({});
      })
      .finally(() => setLoading(false));
  }, [formId]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return <ClientPreview form={form} />;
}
