import type { IssueStatus } from "../types";

export const issueWorkflow = {
    open: {
        contributor: 'in_progress',
        maintainer: ['in_progress', 'resolved', 'open']
    },
    in_progress: {
        contributor: null,
        maintainer: ['resolved', 'open', 'in_progress']
    },
    resolved: {
        contributor: null,
        maintainer: ['open', 'in_progress', 'resolved']
    }
};

// transition helper (logic)
export const getNextStatus = (
    currentStatus: IssueStatus,
    role: string,
    requestedStatus?: string
) => {
    
    const rules = issueWorkflow[currentStatus];
    // console.log(rules);

    if (!rules) {
        throw new Error("Invalid current status");
    }

    // maintainer has full control
    if (role === 'maintainer') {
        return requestedStatus ?? currentStatus;
    }

    // contributor logic (auto transition only)
    if (role === 'contributor') {

        if (requestedStatus) {
            throw new Error("Permission Denied!");
        }

        return rules.contributor ?? currentStatus;
    }

    return currentStatus;
};