import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

import {
    findUserByEmail,
    createUser,
    createUserSession,
    findUserSessionByToken,
    revokeUserSession,
    findUserById
} from "../models/user.model.js"


const generateAccessAndRefreshToken = (userId) => {
    const accessToken = jwt.sign(
        {userId: userId},
        process.env.JWT_SECRET,
        {expiresIn: "15m"}
    )
    
    const refreshToken = jwt.sign(
        {userId: userId},
        process.env.JWT_SECRET,
        {expiresIn: "7d"}
    )

    return {accessToken, refreshToken}
}

const generateAccessToken = (userId) => {
    return jwt.sign(
        {userId: userId},
        process.env.JWT_SECRET,
        {expiresIn: "15m"}
    )
}

const registerUser = asyncHandler( async (req, res) => {
    //1) take data from body
    const {name, email, password} = req.body;

    //2) check for validity - not empty
    if(!name || !email || !password){
        throw new ApiError(
            400,
            "All fields are required !"
        )
    }

    //3) check for already existed user
    const existedUser = await findUserByEmail(email);

    if(existedUser){
        throw new ApiError(
            409,
            "User already exists"
        )
    }

    //4) create user, save hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser(
        name, 
        email, 
        hashedPassword
    )

    //5) check successfully user created 
    if(!user){
        throw new ApiError(
            500,
            "Something went wrong while creating user"
        )
    }

    //6) send response
    res
        .status(201)
        .json(
            new ApiResponse(
                201, 
                user, 
                "User registered successfully."
            )
        )

})

const loginUser = asyncHandler ( async (req, res) => {
    //1) take data from body
    const {email, password} = req.body

    //2) validation - not empty
    if(!email || !password){
        throw new ApiError(
            400,
            "All fields required"
        )
    }

    //3) search in db
    const user = await findUserByEmail(email);

    if(!user){
        throw new ApiError(
            401,
            "Invalid email or password"
        )
    }

    //4.1) compare password - bcrypt.compare()
    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password_hash
    )

    if(!isPasswordCorrect){
        throw new ApiError(
            401,
            "Invlaid email or password"
        )
    }

    //4.2) if find generate refresh and access token 
    const {accessToken, refreshToken} = generateAccessAndRefreshToken(user.id);
    
    //5) hash refresh token 
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10)

    //calculate refresh token expiry
    const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    )

    //save refresh token session
    await createUserSession(user.id, refreshTokenHash, expiresAt)

    //6) save tokens in cookies
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    //6.1) send response
    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                "User logged in successfully"
            )
        )
})

const logoutUser = asyncHandler( async (req, res) => {
    //1) get authenticated user
    const userId = req.user.userId;

    //2) get refresh tokem from cookie
    const refreshToken = req.cookies?.refreshToken;

    //3) find current session
    if(refreshToken){
        const session = await findUserSessionByToken(userId, refreshToken);

        //4) revoke the session
        if(session){
            await revokeUserSession(session.id);
        }
    }

    //5) clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    //6) send response
    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "User logged out successfully"
            )
        )
})

const refreshAccessToken = asyncHandler( async (req, res) => {
    //1) get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken;

    if(!refreshToken){
        throw new ApiError(
            401,
            "Refresh token is required"
        )
    }

    //2) verify refresh token
    const decodedToken = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET
    )

    //3) find current session
    const session = await findUserSessionByToken(decodedToken.userId, refreshToken)

    if(!session){
        throw new ApiError(
            401,
            "Invalid refresh token"
        )
    }

    //4) check session expiry
    if(new Date(session.expires_at) <= new Date()){
        throw new ApiError(
            401,
            "Refresh token expired"
        )
    }

    //5) generate new access token
    const accessToken = generateAccessToken(decodedToken.userId);
    
    //6) update access token cookie
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    //7) send response
    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Access token refreshed successfully"
            )
        )
})

const getCurrentUser = asyncHandler( async (req, res) => {
    //1) get the id from auth middleware
    const userId = req.user.userId;

    //2) find user
    const user = await findUserById(userId);

    if(!user){
        throw new ApiError(
            404,
            "User not found"
        )
    }

    //3) send response
    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Current user fetched successfully"
            )
        )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser
}