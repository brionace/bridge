import React, { useState } from "react";
import api from "../utils/axios";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";

export default function SubmitService() {
  const [serviceType, setServiceType] = useState("");
  const [details, setDetails] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast({ message: "", type: "" });
    const formData = new FormData();
    formData.append("serviceType", serviceType);
    formData.append("details", details);
    if (file) formData.append("file", file);
    try {
      await api.post("/api/submit", formData);
      setToast({ message: "Submission successful!", type: "success" });
    } catch (err) {
      setToast({ message: "Submission failed", type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Submit Service</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Service</option>
          <option value="license">License Application</option>
          <option value="payment">Payment</option>
        </select>
        <textarea
          placeholder="Details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Submit
        </button>
      </form>
      {loading && <Spinner />}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />
    </div>
  );
}
