import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

import {
    findUserByEmail,
    createUser,
    createUserSession
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

export {
    registerUser,
    loginUser
}