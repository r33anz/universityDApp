import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {createServer} from "http";
import { Server } from "socket.io";
import studentRoutes from "./interface/routes/studentRoutes.js";
import notificationRoutes from "./interface/routes/notificationRoutes.js"
import ListenBlockchainEvent from "./interface/events/ListenBlockchainEvent.js";
import pdfRoutes from "./interface/routes/pdfRoutes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer,{
    cors:"*",
    methods:["GET","POST"]
});
app.use(cors());    
app.use(express.json());
app.use('/api',studentRoutes);
app.use('/api',notificationRoutes);
app.use('/api',pdfRoutes);

io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado:", socket.id);
  
    socket.on("disconnect", () => {
      console.log("Cliente desconectado:", socket.id);
    });
  
});

ListenBlockchainEvent.listening();

  export { httpServer as app, io };
