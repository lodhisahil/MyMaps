import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {
     createIncident as createIncidentModel ,
     getAllIncidents as getAllIncidentsModel
} from "../models/incident.model.js";

const createIncident = asyncHandler ( async (req, res) => {
    //1) Get authenticated user
    const userId = req.user.userId;

    //2) get incident data from body
    const {
        type,
        description,
        severity,
        latitude,
        longitude
    } = req.body

    //3) validation
    if(!type || !severity || latitude === undefined || longitude === undefined){
        throw new ApiError(
            400,
            "Type, Severity and location points are required"
        )
    }

    //4) create incident through model
    const incident = await createIncidentModel(
        userId, 
        type,
        description,
        severity,
        latitude,
        longitude
    )

    //5) checkincident creation
    if(!incident){
        throw new ApiError(
            500,
            "Something went wrong while creating incident"
        )
    }

    //6) send response
    res
        .status(201)
        .json(
            new ApiResponse(
                201,
                incident,
                "Incident created successfully"
            )
        )
})

const getAllIncidents = asyncHandler ( async (req, res) => {
    const incidents = await getAllIncidentsModel();

    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                incidents,
                "All incidetns fetched successfully"
            )
        )
})

export {
    createIncident,
    getAllIncidents
}