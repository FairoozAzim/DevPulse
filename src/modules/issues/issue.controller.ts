import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import sendResponse from "../../utils/sendResponse";

const createIssue = async (req : Request, res: Response) => {
     try {
           const userId = req.user?.id;
           const result = await issueService.createIssueIntoDB(req.body,userId);
    
           sendResponse(res, {
                statusCode : 201,
                success : true,
                message: "Issue created successfully",
                data: result.rows[0]
            } )
                
        } catch (error:any) {
            sendResponse(res, {
                statusCode : 500,
                success : false,
                message: error.message,
                data: error
        })
        }
    };
const getAllIssue = async(req : Request, res: Response) => {
    try {

       const result = await issueService.getAllIssuesFromDB(req.query);
       sendResponse(res,{
           statusCode: 200,
           success: true,
           message: "Issues retrieved successfully",
           data: result
       } )
     } catch (error:any) {
       sendResponse(res,{
           statusCode: 500,
           success: false,
           message: error.message,
           error: error
       } )
       
     }
}
const getSingleIssue = async(req : Request, res: Response) => {
    const { id } = req.params;

    try {
       const result = await issueService.getSingleIssueFromDB(id as string)
       sendResponse(res,{
           statusCode: 200,
           success: true,
           message: "Issue retrieved successfully",
           data: result,
       } )
     } catch (error:any) {

        sendResponse(res, {
           statusCode:500,
           success: false,
           message: error.message,
           error: error
       })
       
     }
}

const updateIssue = async(req : Request, res: Response) => {
    const { id } = req.params;


    try {
       const userId = req.user?.id;
       const userRole = req.user?.role;
       const result = await issueService.updateIssueFromDB(id as string, req.body, userId, userRole)
       sendResponse(res,{
           statusCode : 200,
           success: true,
           message: "Issue updated successfully",
           data: result.rows[0]
       } )
     } catch (error:any) {
       sendResponse(res, {
           statusCode : 500,
           success: false,
           message: error.message,
           error: error
       })
       
     }

}
const deleteIssue = async(req : Request, res: Response) => {
    const { id } = req.params;

    try {
       const result = await issueService.deleteIssueFromDB(id as string)
       sendResponse(res, {
           statusCode : 200,
           success: true,
           message: "Issue deleted successfully",
       } )
     } catch (error:any) {
       sendResponse(res, {
           statusCode: 500,
           success: false,
           message: error.message,
           error: error
       })
       
     }

}
export const issueController= {
    createIssue,
    getAllIssue,
    getSingleIssue,
    updateIssue,
    deleteIssue
}