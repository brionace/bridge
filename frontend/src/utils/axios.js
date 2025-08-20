import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const api = axios.create({
  // Use relative path by default so Vite dev proxy handles /api -> backend
  baseURL: import.meta.env.VITE_API_URL || "/",
});

api.interceptors.request.use(async (config) => {
  const session =
    supabase.auth.getSession && (await supabase.auth.getSession());
  const token = session?.data?.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
