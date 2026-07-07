import { Router } from "express";
import StudentController from "../controllers/StudentController.js";

const router = Router();

router.post("/verify", StudentController.verifyStudentInDB);
router.get("/verify-wallet/:walletAddress", StudentController.verifyStudentByWallet);
router.get("/students/:sisCode/status", StudentController.studentStatus);

export default router;