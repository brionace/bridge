# Bridge MVP

This project is a monorepo MVP for a web-based conduit service to help users in developing countries interact with underdeveloped government websites by proxying transactions (payments, applications, status inquiries).

## Tech Stack

- **Frontend:** Vite + React + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (or in-memory mock)

## Features

### Frontend

- Basic layout: Header, Sidebar, Main content
- Routing: Home, Login/Register, Dashboard, Service Submission, Status Tracker
- Axios for backend communication
- Form with file upload & validation
- Toast notifications & loading spinner

### Backend

- RESTful endpoints: register, login, submit, status
- JWT authentication
- Multer for file uploads
- Dummy Puppeteer service automation
- CORS enabled
- Logging with timestamps

## Dev Setup

- `.env.example` included for environment variables
- Scripts to run frontend and backend locally

## Folder Structure

- `services/`, `controllers/`, `routes/` for scalable backend organization

---

See `.github/copilot-instructions.md` for Copilot guidance.
