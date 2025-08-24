import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { supabase } from "../utils/axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id;
        // Pass userId as a query param
        const res = await axios.get(`/api/forms`, {
          params: { userId },
        });
        setForms(res.data);
      } catch {
        setForms([]);
      }
      setLoading(false);
    }
    fetchServices();
  }, []);

  async function handleDuplicateService(service) {
    try {
      const payload = {
        name: `Copy of ${service.name}`,
        pages: service.pages || [],
        settings: service.settings || {},
      };
      const res = await axios.post("/api/forms", payload);
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
          {forms?.map((service) => (
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
