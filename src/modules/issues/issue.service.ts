import { pool } from "../../db";
import { getNextStatus } from "../../utils/issueWorkflow";
import type { IIssue } from "./issue.interface";
import bcrypt from "bcryptjs";

const createIssueIntoDB = async(payload : IIssue, userId : number) => {

    const { title, description, type, status } = payload;
    const reporterId = userId;

    const allowedStatus = ['open', 'in_progress','resolved'];
    const allowedTypes = ['bug', 'feature_request'];
    const issueStatus = status || 'open';

     if(!allowedTypes.includes(type)){
        throw new Error("Invalid type! Must be either 'bug' or 'feature_request'")

    }

    if (!allowedStatus.includes(issueStatus)) {
        throw new Error("Invalid Status!");
    }
   
    const result = await pool.query(`
        INSERT INTO issues (title, description, type, status, reporter_id) VALUES($1, $2, $3, $4, $5) 
        RETURNING *
        `, [title, description, type, issueStatus, reporterId]);
    
    return result;
};

const getAllIssuesFromDB = async() => {
     const result = await pool.query(`
        SELECT * FROM issues
        `);
     const issues = result.rows;
    const reporterIds = [
        ...new Set(
            issues.map(issue => issue.reporter_id)
        )
    ];
   
    const reporterResult = await pool.query(
        `
        SELECT id, name, role
        FROM users
        WHERE id = ANY($1)
        `,
        [reporterIds]
    );

    const reporters = reporterResult.rows;
    const reporterMap = new Map();

    reporters.forEach(reporter => {
        reporterMap.set(reporter.id, reporter);
    });
    const structuredResult = issues.map(issue => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,

        reporter: reporterMap.get(issue.reporter_id)
            ? {
                id: reporterMap.get(issue.reporter_id).id,
                name: reporterMap.get(issue.reporter_id).name,
                role: reporterMap.get(issue.reporter_id).role
            }
            : null,

        created_at: issue.created_at,
        updated_at: issue.updated_at
    }));
    // console.log(structuredResult);
    return structuredResult;
}
const getSingleIssueFromDB = async(id : string) => {
     const result = await pool.query(`
        SELECT * FROM issues WHERE id=$1
        `,[id]);
     const {reporter_id, created_at, updated_at, ...rest} = result.rows[0];
     const reporterInfo = await pool.query(`
        SELECT id, name, role FROM users WHERE id=$1 
        `, [reporter_id])

     const {name, role} = reporterInfo.rows[0];
     const reporter = {
        "id" : reporter_id,
        "name" : name,
        "role" : role
     }
    
    const structuredResult = [
        { 
            ...rest, 
            reporter : reporter, 
            created_at : created_at, 
            updated_at : updated_at
        }]

  
    return structuredResult;
}
const updateIssueFromDB = async(id : string, payload : IIssue, userId : number, userRole : string)=> {
    const {title, description, type, status} = payload;
    const issueInfo = await pool.query(`
        SELECT status, reporter_id FROM issues WHERE id=$1 
        `, [id]);
    if (issueInfo.rows.length === 0) {
        throw new Error("Issue not found");
    }

    const {status : current_status, reporter_id} = issueInfo.rows[0]

    if (userRole === 'contributor' && reporter_id !== userId) {
        throw new Error("You can only update your own issues");
    }
    if (userRole === 'contributor' && current_status !== 'open') {
        throw new Error("Permission Denied! Issue is already in progress.");
    }

     const finalStatus = getNextStatus(
        current_status,
        userRole,
        status
    );


    const result = await pool.query(`
        UPDATE issues SET 
        title = COALESCE($1, title), 
        description = COALESCE($2, description), 
        type = COALESCE($3, type), 
        status = COALESCE($4, status),
        updated_at = NOW()
        WHERE id=$5 
        RETURNING *
        `, [title, description, type, finalStatus, id]);
    console.log(result);
    
    return result;
}

const deleteIssueFromDB = async(id : string) => {
    const result = await pool.query(`
        DELETE  FROM issues WHERE id=$1
        `,[id]);
    return result;

}
export const issueService = {
    createIssueIntoDB,
    getAllIssuesFromDB,
    getSingleIssueFromDB,
    updateIssueFromDB,
    deleteIssueFromDB
}