import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import studentRoutes from "./interface/routes/studentRoutes.js";

dotenv.config();

const app = express();
app.use(cors());    
app.use(express.json());
app.use('/api',studentRoutes);

export default app;
