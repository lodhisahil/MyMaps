import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {
     createIncident as createIncidentModel ,
     getAllIncidents as getAllIncidentsModel,
     getIncidentById as getIncidentByIdModel,
     updateIncident as updateIncidentModel
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

const getIncidentById = asyncHandler (async (req, res) => {
    const { id } = req.params;
    const incident = await getIncidentByIdModel(id);

    if(!incident){
        throw new ApiError(
            404,
            "Incident not found"
        )
    }

    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                incident,
                "Incident fetched successfully."
            )
        )
})

const updateIncident = asyncHandler (async (req, res) => {
    const { id } = req.params
    const userId = req.user.userId;

    const {description, severity, status} = req.body

    if(
        description == undefined &&
        severity == undefined &&
        status == undefined 
    ){
        throw new ApiError(
            400,
            "Minimum one field is required to update"
        )
    }

   const allowedSeverities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

    const allowedStatuses = ["ACTIVE", "RESOLVED", "CLOSED"];

    if (severity !== undefined && !allowedSeverities.includes(severity)) {
        throw new ApiError(
            400,
            "Invalid severity value"
        );
    }

    if (status !== undefined && !allowedStatuses.includes(status)) {
        throw new ApiError(
            400,
            "Invalid status value"
        );
    }

    if (description !== undefined && typeof description !== "string") {
        throw new ApiError(
            400,
            "Description must be a string"
        );
    }

    const  incident = await updateIncidentModel(
        id, userId, description, severity, status
    )

    if(!incident){
        throw new ApiError(
            404,
            "Incident not found or you are not authorized to update it"
        )
    }

    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                incident,
                "Incident updated successfully"
            )
        )
})

export {
    createIncident,
    getAllIncidents,
    getIncidentById,
    updateIncident
}