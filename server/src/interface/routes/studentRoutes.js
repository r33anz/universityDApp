import { Router } from "express";
import StudentController from "../controllers/StudentController.js";

const router = Router();

router.post("/verify", StudentController.veryfyStudentInDB);
router.get("/verify-wallet/:walletAddress", StudentController.verifyStudentByWallet);

export default router;