import { Router } from "express";
import StudentController from "../controllers/StudentController.js";

const router = Router();

router.post("/verify", StudentController.veryfyStudentInDB);

export default router;