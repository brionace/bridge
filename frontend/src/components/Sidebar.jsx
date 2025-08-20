import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="bg-gray-100 w-48 h-full p-4 flex flex-col gap-4">
      <Link to="/" className="font-semibold">
        Home
      </Link>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/submit">Submit Service</Link>
      <Link to="/status">Status Tracker</Link>
    </aside>
  );
}
