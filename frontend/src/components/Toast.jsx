import React from "react";

export default function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg text-white ${
        type === "error" ? "bg-red-500" : "bg-green-500"
      }`}
    >
      {message}
      <button className="ml-2" onClick={onClose}>
        ✖
      </button>
    </div>
  );
}
