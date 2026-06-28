# Smart Task Planner Documentation

Welcome to the documentation for the Week 3 **Smart Task Planner**. This project integrates Google's Gemini API with a clean web interface following Apple's signature design language.

## Architecture & Data Flow

This application is built using a secure **Client-Server Architecture**. Direct communication with the Gemini API from a web browser is avoided to prevent exposing secret API credentials to the client.

```
+------------------+                   +------------------+                   +------------------+
|                  |   POST /api/plan  |                  |   API Request     |                  |
|  Browser Client  | ----------------> |  Node.js Server  | ----------------> |    Gemini API    |
| (index/style)    | <---------------- |   (script.js)    | <---------------- | (JSON schema mode)
|                  |   JSON Tasks list |                  |   Structured JSON |                  |
+------------------+                   +------------------+                   +------------------+
```

### Components

1. **Frontend (Client-Side)**
   - `index.html`: Contains UI layout, input control panel, and JavaScript that queries `/api/plan`. It updates the DOM dynamically based on response parameters.
   - `style.css`: Visual layout using Apple Design tokens, including typographic tracking, rounded buttons, and structured grid displays.

2. **Backend (Proxy Server)**
   - `script.js`: Native Node.js HTTP server. Serves static files and proxies `/api/plan` calls securely using environment configurations.
   - `.env` *(ignored)*: Stores your private Google Studio `API_KEY`.

---

## Setup & Execution

Follow these steps to run the application locally:

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### 2. File Placement
Ensure you have the following structure:
```text
Week3/
├── .gitignore
├── index.html
├── package.json
├── script.js
├── style.css
└── .env (You must create this)
```

### 3. Configure Credentials
Create a `.env` file in the root of the `Week3/` directory and input your API key:
```env
API_KEY="your_google_gemini_api_key_here"
```

### 4. Install Dependencies
Run the following command to download necessary modules (`dotenv` and `@google/genai`):
```bash
npm install
```

### 5. Launch the Server
Start the local server using:
```bash
npm start
```
By default, the server runs at **`http://localhost:3000`**.

---

## UI Design Guidelines (Apple Style Reference)

The visual design relies strictly on the **Apple Style Reference** light theme specs:
- **Canvas Base:** Soft frost (`#f5f5f7`) with a layout width centering at `980px`.
- **Typographic Precision:** Uses the `Inter` font stack with tightened letter-spacing (`-0.016em` on body text) to reflect Apple's signature print.
- **Single Blue Accent:** Action buttons use standard filled Apple Blue (`#0071e3`) with fully rounded margins (`980px` radius).
- **Hairline Borders:** Elements are separated by soft gray dividers (`#e2e2e5` Pebble borders) instead of drop-shadow elevation.
- **Dynamic Priorities:** Low, Medium, and High task priorities are labeled using color-saturated badges on a transparent tint.
