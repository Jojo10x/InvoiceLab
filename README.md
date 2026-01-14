# InvoiceLab - AI-Powered Invoice Processing Application

# SITE - https://invoice-lab-five.vercel.app/

InvoiceLab is a full-stack web application designed to automate the extraction, analysis, and management of financial documents. It utilizes Google Gemini AI (Multimodal) to parse invoice images and PDFs, extracting key data points while simultaneously assessing fraud risk and compliance status.

## Architecture Overview

The application follows a decoupled client-server architecture:

- **Frontend:** React (Vite) with TypeScript and Tailwind CSS. It handles user authentication, file uploads, and data visualization.
- **Backend:** Node.js and Express. It manages API routing, rate limiting, and interaction with external services.
- **Database:** MongoDB (Atlas). Stores invoice metadata, parsed results, and usage logs.
- **AI Engine:** Google Gemini 1.5/2.5 Flash. Performs OCR, semantic extraction, and fraud analysis in a single pass.
- **Authentication:** Clerk. Managed authentication for secure user sessions.

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas connection string
- Google Gemini API Key
- Clerk API Keys

### 1. Clone the Repository

```bash
git clone https://github.com/Jojo10x/InvoiceLab.git
cd InvoiceLab
```

### 2. Backend Configuration

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_ai_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Configuration

Open a new terminal, navigate to the client directory, and install dependencies:

```bash
cd client
npm install
```

Create a `.env.local` file in the `client` directory:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:5001/api
```

Start the frontend application:

```bash
npm run dev
```

The application should now be accessible at `http://localhost:5173`.

### What Works

- **AI Extraction:** Automatically identifies vendor, date, currency, and total amount from uploaded images or PDFs.
- **Fraud Detection:** Assigns a risk score (0-100) based on analysis of document formatting and round-number anomalies.
- **Model Switching:** Users can toggle between "Gemini 2.5 Flash" (Standard) and "Gemini 2.5 Lite" (Faster/Cheaper) dynamically.
- **Contextual Chat:** A "Chat with Data" feature allows users to query their specific invoice history using natural language.
- **Rate Limiting:** Implemented a centralized database-backed usage tracker to enforce a hard limit of 20 requests per day (syncing with the Google Free Tier constraints).
- **Data Export:** Users can download their processed invoice data as a CSV file.

### What Is Mocked / Simplified

- **File Storage:** This demo uses `Multer` with memory storage to process files. In a production environment, files would be uploaded to an object store like AWS S3 or Google Cloud Storage.
- **Shared Quota:** The rate limiter is currently global for the demo instance to protect the API key. In a real multi-tenant SaaS, this would be refactored to per-user or per-organization limits.

### What Can Be Extended to Production

- **Persistent Storage:** Integrate AWS S3 for long-term retention of the original invoice files.
- **Queue System:** Offload AI processing to a background job queue (e.g., BullMQ) to handle high-volume uploads without blocking the main thread.

## License

MIT
