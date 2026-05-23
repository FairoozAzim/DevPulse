import { Router } from "express";
import { loginController } from "./login.controller";

const router = Router();

router.post("/login", loginController.loginUser);

export const loginRoute = router;