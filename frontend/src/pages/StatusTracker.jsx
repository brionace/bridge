import React, { useState } from "react";
import api from "../utils/axios";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";

export default function StatusTracker() {
  const [refId, setRefId] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const handleCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast({ message: "", type: "" });
    try {
      const res = await api.get(`/api/status/${refId}`);
      setStatus(res.data.status);
      setToast({ message: "Status fetched!", type: "success" });
    } catch (err) {
      setToast({ message: "Status not found", type: "error" });
      setStatus(null);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Status Tracker</h2>
      <form onSubmit={handleCheck} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Reference ID"
          value={refId}
          onChange={(e) => setRefId(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Check Status
        </button>
      </form>
      {loading && <Spinner />}
      {status && (
        <div className="mt-4">
          Status: <span className="font-bold">{status}</span>
        </div>
      )}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />
    </div>
  );
}
