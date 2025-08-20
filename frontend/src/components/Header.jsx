import React from "react";

import { supabase } from "../utils/axios";

export default function Header({ user, onLogout }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };
  return (
    <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="font-bold text-xl">Bridge Service</h1>
      <div>
        {user ? (
          <>
            <span className="mr-4">Hello, {user}</span>
            <button
              className="bg-white text-blue-600 px-3 py-1 rounded"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <a href="/login" className="bg-white text-blue-600 px-3 py-1 rounded">
            Login
          </a>
        )}
      </div>
    </header>
  );
}
