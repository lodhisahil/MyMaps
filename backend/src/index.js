import app from "./app.js"
import { connecDB } from "./db/index.js"


const PORT = process.env.PORT || 5000;

connecDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`MyMaps Backend running on port ${PORT}`)
        })
    })
    .catch((error) => {
        console.error("Server startup failed:", error.message);
    })