import { Router } from "express";
import NotificationController from "../controllers/NotificationController.js";

const router = Router();

router.get("/allNotifications", NotificationController.recoverAllNotifications);
router.post('/attend-multiple', NotificationController.attendMultipleNotifications);

export default router;