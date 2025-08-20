import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { syncFormToBrowserStorage } from "../utils/formSync";

export default function Dashboard() {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState([]);

  function loadDraftsFromSession() {
    try {
      const rawIndex = sessionStorage.getItem("form:draftIndex");
      let ids = rawIndex ? JSON.parse(rawIndex) : [];
      let items = [];
      if (Array.isArray(ids) && ids.length > 0) {
        items = ids
          .map((id) => {
            const rawDoc = sessionStorage.getItem(`form:preview:${id}`);
            if (!rawDoc) return null;
            try {
              return JSON.parse(rawDoc);
            } catch {
              return null;
            }
          })
          .filter(Boolean);
      } else {
        // Fallback: scan sessionStorage for any form:preview:* entries
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith("form:preview:")) {
            const rawDoc = sessionStorage.getItem(key);
            if (!rawDoc) continue;
            try {
              const obj = JSON.parse(rawDoc);
              items.push(obj);
            } catch {}
          }
        }
      }
      // Sort newest first by updatedAt if present
      items.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      setDrafts(items);
      // setForms((prev) => [...items, ...prev]);
    } catch {
      setDrafts([]);
    }
  }

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      // Preload local drafts so user sees them quickly
      loadDraftsFromSession();
      try {
        const res = await axios.get("/api/forms");
        setForms(res.data);
        // Keep local drafts visible even if API succeeds
      } catch {
        setForms([]);
        // Re-read drafts in case another tab updated them
        loadDraftsFromSession();
      }
      setLoading(false);
    }
    fetchServices();
  }, []);

  async function handleDuplicateService(service) {
    try {
      const payload = {
        name: `Copy of ${service.name}`,
        fields: service.fields || [],
        settings: service.settings || {},
      };
      const res = await axios.post("/api/forms", payload);
      syncFormToBrowserStorage(res.data);
      setForms((prev) => [res.data, ...prev]);
    } catch {}
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main content */}
      <header>
        <a href="/builder" className="text-blue-600 hover:underline mb-4">
          Create a form
        </a>
      </header>
      <main className="mx-auto max-w-7xl">
        <section className="space-y-3">
          {forms.map((service) => (
            <div
              key={service.id}
              className="bg-white border rounded p-3 flex justify-between items-center"
            >
              <span className="font-medium text-slate-900">{service.name}</span>
              <div className="flex items-center gap-3">
                <Link
                  className="text-blue-600 hover:underline"
                  to={`/builder/${service.id}`}
                  state={{ formId: service.id, startPage: 0 }}
                >
                  Edit
                </Link>
                <Link
                  className="text-blue-600 hover:underline"
                  to={`/preview/${service.id}`}
                  // state={{ formId: service.id, startPage: 0 }}
                >
                  Preview
                </Link>
                {/* <button
                    className="text-slate-700 hover:underline"
                    onClick={() => handleDuplicateService(service)}
                  >
                    Duplicate
                  </button> */}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
