import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser
} from "../controllers/user.controller.js"


const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

//protected routes
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);

router.post("/refresh-token", refreshAccessToken)

export default router