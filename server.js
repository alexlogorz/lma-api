import express from "express";
import { hasPurchased, getCourseById } from "./utils.js";
import cors from "cors";
import fs from "fs";
import https from "https";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const allowedOrigins = ["https://latinmixacademy.com/", "http://localhost:3000/", "https://api.latinmixacademy.com/"];
const PORT = process.env.PORT || 3000; 
const isProduction = process.env.NODE_ENV === "production";

let server;

if (isProduction) { 
    // Load SSL certificate and private key
    const options = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH),
    };

    server = https.createServer(options, app);
}
else {
    server = app;
}

app.use(cors({ origin: allowedOrigins, credentials: true }));

// Middleware to parse JSON requests
app.use(express.json());

// Check if a customer has purchased a specific product
app.post("/check-purchase", async (req, res) => {
  const { customerId, productId } = req.body;

  if (!customerId || !productId) {
    return res.status(400).json({ error: "Missing customerId or productId" });
  }

  try {
    const purchased = await hasPurchased(customerId, productId);
    res.status(200).json({ hasPurchased: purchased });
  } 
  catch (error) {
    console.error("Error checking purchase:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch a specific course by ID
app.get("/course/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const course = await getCourseById(id);
        res.status(200).json(course);
    } 
    catch (error) {
        console.error("Error fetching course:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});