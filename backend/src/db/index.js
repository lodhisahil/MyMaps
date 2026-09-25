import pg from "pg"

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

const connecDB = async () => {
    try {
        await pool.query("SELECT NOW()");
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed", error.message);
        process.exit(1);
    }
}

export {
    pool,
    connecDB
}