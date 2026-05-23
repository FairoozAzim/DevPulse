import { Router} from "express";
import { signupController } from "./signup.controller";
import auth from "../../middleware/auth";

const router = Router();

router.post("/signup", signupController.createUser)
// router.get("/getUsers", auth(), userController.getUsers)



export const signupRoute = router
