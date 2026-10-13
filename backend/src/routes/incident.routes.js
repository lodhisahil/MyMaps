import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    createIncident,
    deleteIncident,
    getAllIncidents,
    getIncidentById,
    updateIncident
} from "../controllers/incident.controller.js"

const router = Router();

router.post("/", verifyJWT, createIncident)
router.get("/", getAllIncidents)
router.get("/:id", getIncidentById)
router.patch("/:id", verifyJWT, updateIncident)
router.delete("/:id", verifyJWT, deleteIncident)

export default router