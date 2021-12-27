import { Router } from "express";
import authController from "../controllers/auth";
import validation from "../middleware/validation";

const authRoutes = Router();

authRoutes.post('/empRegister', validation.registerValidation, authController.empRegister);
authRoutes.post('/empLogin', validation.loginValidation, authController.empLogin);
authRoutes.post("/addCategory", authController.addCategories);



export default authRoutes;