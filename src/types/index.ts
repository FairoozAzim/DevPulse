export const USER_ROLE = {
    contributor : "contributor",
    maintainer : "maintainer",
    
} as const;

export type ROLES = "contributor" | "maintainer";

export type IssueStatus = 'open' | 'in_progress' | 'resolved';

export type TResponse <T>= {
   statusCode : number;
   success : boolean;
   message : string;
   data?: T;
   error?: any;
}