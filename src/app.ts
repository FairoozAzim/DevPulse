import express, {type Application, type Request, type Response} from "express"
import 'dotenv/config';
import config from "./config";
import cors from "cors";

import { initDB, pool } from "./db";
import {Pool} from "pg";
import { signupRoute } from "./modules/signup/signup.route";
import { loginRoute } from "./modules/login/login.route";
import logger from "./middleware/logger";
import { issueRoute } from "./modules/issues/issue.route";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app : Application = express();
const port = config.port;
const corsOptions = {
    origin : `http://localhost:${port}`
}
app.use(express.json());
app.use(express.text()); 
app.use(express.urlencoded({extended :true}));
app.use(logger);
app.use(cors());

app.use("/api/auth", signupRoute)
app.use("/api/auth", loginRoute)
app.use("/api/issues", issueRoute)
app.use("/api/issues/:id",issueRoute)


app.use(globalErrorHandler);

export default app;