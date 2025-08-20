import React from "react";

export default function Home() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome to Bridge</h2>
      <p>
        Proxy government transactions easily: payments, applications, status
        inquiries.
      </p>
      <a href="/dashboard" className="text-blue-600 hover:underline">
        Start
      </a>
    </div>
  );
}
