import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import FormBuilder from "./components/FormBuilder";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Preview from "./pages/Preview";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/builder" element={<FormBuilder />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={() => { /* handle login */ }} />} />
        <Route path="/builder/:id" element={<FormBuilder />} />
        <Route path="/preview/:formId" element={<Preview />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
