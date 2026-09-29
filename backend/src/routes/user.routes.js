import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    registerUser,
    loginUser,
    logoutUser
} from "../controllers/user.controller.js"


const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

//protected routes
router.post("/logout", verifyJWT, logoutUser);

export default router