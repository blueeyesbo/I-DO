import express from "express";
import { ENV } from "./config/env.js";
import todoRouter from "./router/todo.js";
import userRouter from "./router/user.js";

const app = express();

app.use(express.json());

app.use("/api/todo", todoRouter);
app.use("/api/user", userRouter);

app.listen(ENV.PORT, () => {
    console.log(`Server is running on port ${ENV.PORT}`);
});


