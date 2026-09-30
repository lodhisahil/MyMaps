import { pool } from "../db/index.js"
import bcrypt from "bcrypt"

const findUserByEmail = async (email) => {
    const result = await pool.query(
        `SELECT id, name, email, password_hash
        FROM users
        WHERE email = $1`,
        [email]
    );

    return result.rows[0];
}

const createUser = async (name, email, passwordHash) => {
    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, created_at`,
        [name, email, passwordHash]
    );
    return result.rows[0];
};

const createUserSession = async (userId, refreshTokenHash, expiresAt) => {
    const result = await pool.query(
        `INSERT INTO user_sessions (
            user_id,
            refresh_token_hash,
            expires_at
        )
        VALUES ($1, $2, $3)
        RETURNING id, user_id, expires_at, created_at`,
        [userId, refreshTokenHash, expiresAt]
    )

    return result.rows[0]
}

const revokeUserSession = async(sessionId) => {
    const result = await pool.query(
        `UPDATE user_sessions
         SET revoked_at = NOW()
         WHERE id = $1
         RETURNING id, user_id, revoked_at`,
         [sessionId]
    )

    return result.rows[0];
}

const findUserSessionByToken = async(userId, refreshToken) => {
    const result = await pool.query(
        `SELECT id, user_id, refresh_token_hash, expires_at, revoked_at
         FROM user_sessions
         WHERE user_id = $1
         AND revoked_at IS NULL`,
         [userId]
    )

    for(const session of result.rows){
        const isTokenValid = await bcrypt.compare(
            refreshToken,
            session.refresh_token_hash
        )

        if(isTokenValid){
            return session;
        }
    }

    return null;
}

const findUserById = async (userId) => {
    const result = await pool.query(
        `SELECT id, name, email, created_at
         FROM users
         WHERE id = $1`,
         [userId]
    )

    return result.rows[0];
}

export {
    findUserByEmail,
    createUser,
    createUserSession,
    revokeUserSession,
    findUserSessionByToken,
    findUserById
}