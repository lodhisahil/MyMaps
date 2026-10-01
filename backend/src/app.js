import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import userRoutes from "./routes/user.routes.js"
import incidentRoutes from "./routes/incident.routes.js"


const app = express();

app.use(cors())
app.use(express.json());
app.use(cookieParser())


// user routes
app.use("/api/users", userRoutes)

//incident route
app.use("/api/incidents", incidentRoutes);


app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "MyMaps backend is running"
    })
})

export default app;