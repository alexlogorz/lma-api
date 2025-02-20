import express from "express";
import { hasPurchased, getCourseById } from "./utils.js";
import cors from "cors";
import fs from "fs";
import https from "https";
import dotenv from "dotenv";
import crypto from "crypto"

dotenv.config();

const app = express();
const allowedOrigins = ["https://latinmixacademy.com", "http://localhost:3000/"];
const PORT = process.env.PORT || 3000; 
const isProduction = process.env.NODE_ENV === "production";
const APP_CLIENT_SECRET = process.env.APP_CLIENT_SECRET || 'hush'

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

// Middle to parse json data
app.use(express.json())

// Middleware to verify shopify requests
const verifyShopifySignature = (req, res, next) => {
	const query = { ...req.query }
	const signature = query.signature

	if(!signature) {
	   return res.status(403).json({ error: "Missing signature" })
	}

	delete query.signature

	const sortedParams = Object.keys(query).sort().map(key => `${key}=${query[key]}`).join('');
        const calculatedSignature = crypto.createHmac('sha256', APP_CLIENT_SECRET).update(sortedParams).digest('hex');

	// Compare signatures securely
        if (!crypto.timingSafeEqual(Buffer.from(calculatedSignature, "utf8"), Buffer.from(signature, "utf8"))) {
            return res.status(403).send("Invalid signature");
        }

	// Proceed
	next()
}

app.use(cors({ origin: allowedOrigins, credentials: true }));

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to verify Shopify requests
app.use(verifyShopifySignature);

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

// Get student details by ID
app.get("/student/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const student = await getStudentById(id);
        res.status(200).json(student);
    } 
    catch (error) {
        res.status(500).json(error.message);
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
