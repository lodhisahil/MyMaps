import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    createIncident,
    getAllIncidents
} from "../controllers/incident.controller.js"

const router = Router();

router.post("/", verifyJWT, createIncident)
router.get("/", getAllIncidents)

export default router