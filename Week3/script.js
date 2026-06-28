import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env file
dotenv.config();

// Resolve paths for static file serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Initialize the Gemini API client
const apiKey = process.env.API_KEY;
let ai;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey: apiKey });
} else {
  console.warn("WARNING: API_KEY environment variable is not defined in .env");
}

// Helper to serve files
function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
}

// Create the HTTP server
const server = http.createServer(async (req, res) => {
  // Serve Frontend assets
  if (req.method === "GET") {
    if (req.url === "/" || req.url === "/index.html") {
      serveFile(res, path.join(__dirname, "index.html"), "text/html");
      return;
    } else if (req.url === "/style.css") {
      serveFile(res, path.join(__dirname, "style.css"), "text/css");
      return;
    }
  }

  // API Route to Generate Plan
  if (req.method === "POST" && req.url === "/api/plan") {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        if (!ai) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Gemini API key is not configured on the server." }));
          return;
        }

        const { goal, currentDateTime } = JSON.parse(body);
        if (!goal || goal.trim() === "") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Goal input is required." }));
          return;
        }

        const projectStart = currentDateTime || new Date().toISOString();

        // Generate response from Gemini
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Create a step-by-step task checklist and timeline to achieve the following goal: "${goal}".
The project start time is ${projectStart}.
Please determine the logical sequence in which tasks should be done, their priorities, durations, and timing offsets.
For each task, provide:
1. task_name: name of the task.
2. priority: High, Medium, or Low.
3. estimated_time: user friendly duration description (e.g. "3 hours", "2 days").
4. start_offset_hours: the recommended delay in hours from the project start time (${projectStart}) at which this task should start. If it can start immediately, this is 0. If it should start after previous tasks are completed, calculate the accumulated offset accordingly.
5. duration_hours: estimated duration of the task in hours (can be integer or decimal).`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                tasks: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      task_name: { type: "STRING" },
                      priority: { type: "STRING" },
                      estimated_time: { type: "STRING" },
                      start_offset_hours: { type: "NUMBER" },
                      duration_hours: { type: "NUMBER" }
                    },
                    required: ["task_name", "priority", "estimated_time", "start_offset_hours", "duration_hours"]
                  }
                }
              },
              required: ["tasks"]
            }
          }
        });

        // Convert the structured JSON string into a live JavaScript Object
        const data = JSON.parse(response.text);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
      } catch (error) {
        console.error("Gemini API Error:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to generate task plan. Please try again later." }));
      }
    });
    return;
  }

  // 404 for other endpoints
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
