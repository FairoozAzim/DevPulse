
        import {createRequire} from 'module';
        const require  = createRequire(import.meta.url);

    

// src/app.ts
import express from "express";
import "dotenv/config";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET
};
var config_default = config;

// src/app.ts
import cors from "cors";

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(
      `
         CREATE TABLE IF NOt EXISTS users(
         id SERIAL PRIMARY KEY,
         name VARCHAR(100),
         email VARCHAR(50) UNIQUE NOT NULL,
         password TEXT NOT NULL,
         role VARCHAR(20) NOT NULL 
            DEFAULT 'contributor'
            CHECK (role IN ('contributor', 'maintainer')),
         created_at TIMESTAMP DEFAULT NOW(),
         updated_at TIMESTAMP DEFAULT NOW()
        )
        `
    );
    await pool.query(
      `
         CREATE TABLE IF NOt EXISTS issues(
         id SERIAL PRIMARY KEY,
         title TEXT NOT NULL,
         description TEXT NOT NULL,
         type VARCHAR(20) NOT NULL
              CHECK (type IN ('bug', 'feature_request')),
         status VARCHAR(20) NOT NULL  
              DEFAULT 'open'
              CHECK (status IN ('open', 'in_progress', 'resolved')),
         reporter_id INT,
         created_at TIMESTAMP DEFAULT NOW(),
         updated_at TIMESTAMP DEFAULT NOW()
        )
        `
    );
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/app.ts
import "pg";

// src/modules/signup/signup.route.ts
import { Router } from "express";

// src/modules/signup/signup.service.ts
import bcrypt from "bcryptjs";
var createUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 11);
  const allowedRoles = ["contributor", "maintainer"];
  const userRole = role || "contributor";
  if (!allowedRoles.includes(userRole)) {
    throw new Error("Invalid Role!");
  }
  const result = await pool.query(`
        INSERT INTO users (name, email, password, role) VALUES($1, $2, $3, $4) 
        RETURNING *
        `, [name, email, hashPassword, userRole]);
  delete result.rows[0].password;
  return result;
};
var getAllUsersFromDB = async () => {
  const result = await pool.query(`
        SELECT * FROM users
        `);
  return result;
};
var signupService = {
  createUserIntoDB,
  getAllUsersFromDB
};

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/signup/signup.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await signupService.createUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      data: error
    });
  }
};
var getUsers = async (req, res) => {
  try {
    const result = await signupService.getAllUsersFromDB();
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Users retrieved successfully",
      data: result.rows
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      data: error
    });
  }
};
var signupController = {
  createUser,
  getUsers
};

// src/middleware/auth.ts
import jwt from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized Access"
        });
      }
      ;
      const decoded = jwt.verify(token, config_default.secret);
      const userData = await pool.query(
        `
        SELECT * FROM users WHERE id=$1
        `,
        [decoded.id]
      );
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User not found!"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "Unauthorized user!"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/modules/signup/signup.route.ts
var router = Router();
router.post("/signup", signupController.createUser);
var signupRoute = router;

// src/modules/login/login.route.ts
import { Router as Router2 } from "express";

// src/modules/login/login.service.ts
import bcrypt2 from "bcryptjs";
import jwt2 from "jsonwebtoken";
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(`
    SELECT * FROM users WHERE email=$1
    `, [email]);
  if (userData.rows.length === 0) {
    throw new Error("Invalid credentials");
  }
  ;
  const user = userData.rows[0];
  const matchPassword = await bcrypt2.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const accessToken = jwt2.sign(jwtPayload, config_default.secret, { expiresIn: "1d" });
  return { accessToken };
};
var loginService = {
  loginUserIntoDB
};

// src/modules/login/login.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await loginService.loginUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Logged In Successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      data: error
    });
  }
};
var loginController = {
  loginUser
};

// src/modules/login/login.route.ts
var router2 = Router2();
router2.post("/login", loginController.loginUser);
var loginRoute = router2;

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  const log = `
Method => ${req.method} - Time -> ${Date.now()} - URL -> ${req.url}
`;
  fs.appendFile("logger.txt", log, (err) => {
    console.log(err);
  });
  next();
};
var logger_default = logger;

// src/modules/issues/issue.route.ts
import { Router as Router3 } from "express";

// src/utils/issueWorkflow.ts
var issueWorkflow = {
  open: {
    contributor: "in_progress",
    maintainer: ["in_progress", "resolved", "open"]
  },
  in_progress: {
    contributor: null,
    maintainer: ["resolved", "open", "in_progress"]
  },
  resolved: {
    contributor: null,
    maintainer: ["open", "in_progress", "resolved"]
  }
};
var getNextStatus = (currentStatus, role, requestedStatus) => {
  const rules = issueWorkflow[currentStatus];
  if (!rules) {
    throw new Error("Invalid current status");
  }
  if (role === "maintainer") {
    return requestedStatus ?? currentStatus;
  }
  if (role === "contributor") {
    if (requestedStatus) {
      throw new Error("Permission Denied!");
    }
    return rules.contributor ?? currentStatus;
  }
  return currentStatus;
};

// src/modules/issues/issue.service.ts
import "bcryptjs";
var createIssueIntoDB = async (payload, userId) => {
  const { title, description, type, status } = payload;
  const reporterId = userId;
  const allowedStatus = ["open", "in_progress", "resolved"];
  const allowedTypes = ["bug", "feature_request"];
  const issueStatus = status || "open";
  if (!allowedTypes.includes(type)) {
    throw new Error("Invalid type! Must be either 'bug' or 'feature_request'");
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
var getAllIssuesFromDB = async (query) => {
  const { sort = "newest", type, status } = query;
  let sql = `
        SELECT * FROM issues
    `;
  const conditions = [];
  const values = [];
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(" AND ");
  }
  let orderBy = "created_at DESC";
  if (sort === "oldest") {
    orderBy = "created_at ASC";
  }
  sql += ` ORDER BY ${orderBy}`;
  const result = await pool.query(sql, values);
  const issues = result.rows;
  const reporterIds = [
    ...new Set(
      issues.map((issue) => issue.reporter_id)
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
  const reporterMap = /* @__PURE__ */ new Map();
  reporters.forEach((reporter) => {
    reporterMap.set(reporter.id, reporter);
  });
  const structuredResult = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterMap.get(issue.reporter_id) ? {
      id: reporterMap.get(issue.reporter_id).id,
      name: reporterMap.get(issue.reporter_id).name,
      role: reporterMap.get(issue.reporter_id).role
    } : null,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
  return structuredResult;
};
var getSingleIssueFromDB = async (id) => {
  const result = await pool.query(`
        SELECT * FROM issues WHERE id=$1
        `, [id]);
  const { reporter_id, created_at, updated_at, ...rest } = result.rows[0];
  const reporterInfo = await pool.query(`
        SELECT id, name, role FROM users WHERE id=$1 
        `, [reporter_id]);
  const { name, role } = reporterInfo.rows[0];
  const reporter = {
    "id": reporter_id,
    "name": name,
    "role": role
  };
  const structuredResult = [
    {
      ...rest,
      reporter,
      created_at,
      updated_at
    }
  ];
  return structuredResult;
};
var updateIssueFromDB = async (id, payload, userId, userRole) => {
  const { title, description, type, status } = payload;
  const issueInfo = await pool.query(`
        SELECT status, reporter_id FROM issues WHERE id=$1 
        `, [id]);
  if (issueInfo.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const { status: current_status, reporter_id } = issueInfo.rows[0];
  if (userRole === "contributor" && reporter_id !== userId) {
    throw new Error("You can only update your own issues");
  }
  if (userRole === "contributor" && current_status !== "open") {
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
  return result;
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(`
        DELETE  FROM issues WHERE id=$1
        `, [id]);
  return result;
};
var issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueFromDB,
  deleteIssueFromDB
};

// src/modules/issues/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await issueService.createIssueIntoDB(req.body, userId);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      data: error
    });
  }
};
var getAllIssue = async (req, res) => {
  try {
    const result = await issueService.getAllIssuesFromDB(req.query);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFromDB(id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const result = await issueService.updateIssueFromDB(id, req.body, userId, userRole);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssueFromDB(id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var issueController = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/types/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/modules/issues/issue.route.ts
var router3 = Router3();
router3.post("/", auth_default(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.createIssue);
router3.get("/", issueController.getAllIssue);
router3.get("/:id", issueController.getSingleIssue);
router3.patch("/:id", auth_default(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.updateIssue);
router3.delete("/:id", auth_default(USER_ROLE.maintainer), issueController.deleteIssue);
var issueRoute = router3;

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var app = express();
var port = config_default.port;
var corsOptions = {
  origin: `http://localhost:${port}`
};
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(logger_default);
app.use(cors());
app.use("/api/auth", signupRoute);
app.use("/api/auth", loginRoute);
app.use("/api/issues", issueRoute);
app.use("/api/issues/:id", issueRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map