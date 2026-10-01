import { pool } from "../db/index.js"

const createIncident = async (
    userId,
    type,
    description,
    severity,
    latitude,
    longitude
) => {
    const result = await pool.query(
        `INSERT INTO incidents (
            user_id, type, description, severity, location
        )
        VALUES(
            $1,
            $2,
            $3,
            $4,
            ST_SetSRID(
                ST_MakePoint($6, $5),
                4326
            )::geography
        )
        RETURNING
            id, user_id, type, description, severity, status, location, created_at`,
            [userId, type, description, severity, latitude, longitude]
    );

    return result.rows[0];
}

const getAllIncidents = async () => {
    const result = await pool.query(
        `SELECT 
            id,
            user_id,
            type,
            description,
            severity,
            status,
            location,
            created_at
        FROM incidents
        ORDER BY created_at DESC`
    )

    return result.rows
}

export{
    createIncident,
    getAllIncidents
}