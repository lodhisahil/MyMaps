import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

import jwt from "jsonwebtoken"

const verifyJWT = asyncHandler( async (req, res, next) => {
    // 1) get access token from cookies
    const token = req.cookies?.accessToken;

    if(!token){
        throw new ApiError(
            401,
            "Unauthorixed request"
        )
    }

    //2) verify token
    const decodedToken = jwt.verify(
        token, 
        process.env.JWT_SECRET
    )

    //3) store authenticated user information
    req.user = decodedToken;

    next();
})

export {
    verifyJWT
}