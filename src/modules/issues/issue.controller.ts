import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const createIssue = async (req : Request, res: Response) => {
     try {
           const userId = req.user?.id;
           const result = await issueService.createIssueIntoDB(req.body,userId);
           
           res.status(201).json({
                success : true,
                message: "Issue created successfully",
                data: result.rows[0]
            })
                
        } catch (error:any) {
            res.status(500).json({
            success : false,
            message: error.message,
            data: error
        })
        }
    };
const getAllIssue = async(req : Request, res: Response) => {
    try {

       const result = await issueService.getAllIssuesFromDB()

       res.status(200).json({
           success: true,
           message: "Issues retrieved successfully",
           data: result
       });
     } catch (error:any) {
       res.status(500).json({
           success: false,
           message: error.message,
           error: error
       })
       
     }
}
const getSingleIssue = async(req : Request, res: Response) => {
    const { id } = req.params;

    try {
       const result = await issueService.getSingleIssueFromDB(id as string)
       res.status(200).json({
           success: true,
           message: "Issue retrieved successfully",
           data: result,
       });
     } catch (error:any) {
       res.status(500).json({
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
       res.status(200).json({
           success: true,
           message: "Issue updated successfully",
           data: result.rows[0]
       });
     } catch (error:any) {
       res.status(500).json({
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
       res.status(200).json({
           success: true,
           message: "Issue deleted successfully",
       });
     } catch (error:any) {
       res.status(500).json({
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