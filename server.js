import express from "express";
import {
    hasPurchased,
    getCourseById,
    verifyShopifyRequest,
    createEnrollment,
    updateOnboardingMetafield
} from "./utils.js";
import cors from "cors";
import fs from "fs";
import https from "https";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const allowedOrigins = ["https://latinmixacademy.com"];
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

// Middleware to parse json data
app.use(express.json())

// CORS
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// Middleware to verify Shopify requests
app.use(verifyShopifyRequest);

// Check if a customer has purchased a specific product
app.post("/check-purchase", async (req, res) => {
    const { customerId, productId } = req.body;

    if (!customerId || !productId) {
        return res.status(400).json({
            error: "Missing customerId or productId"
        });
    }

    try {
        const purchased = await hasPurchased(customerId, productId);
        res.status(200).json({
            hasPurchased: purchased
        });
    } 
    catch (error) {
        console.error("Error checking purchase:", error);
        res.status(500).json({
            error: "Internal server error"
        });
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
        res.status(500).json({
            error: "Internal server error"
        });
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

// Create new Airtable record for onboarding
app.post("/student/onboarding", async (req, res) => {
    const formData = req.body
    const { studentId } = req.body

    try {
        const records = await createEnrollment(formData); 
        const metafield = await updateOnboardingMetafield(studentId);
        
        res.status(201).send("Enrollment created successfully!");
    } 
    catch (error) {
        console.error("Server error:", error); 
        res.status(500).send("Error creating enrollment: " + error.message);
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
