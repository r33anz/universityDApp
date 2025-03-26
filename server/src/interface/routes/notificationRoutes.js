import { Router } from "express";
import NotificationController from "../controllers/NotificationController.js";

const router = Router();

router.get("/allNotifications", NotificationController.recoverAllNotifications);

export default router;