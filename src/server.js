import express from "express";
import { ENV } from "./config/env.js";
import todoRouter from "./router/todo.js";
import userRouter from "./router/user.js";
import categoriesRouter from "./router/categories.js";
import subcategoriesRouter from "./router/subcategories.js";
import timelogsRouter from "./router/timelogs.js";
import importantDatesRouter from "./router/importantDates.js";
import calendarEventsRouter from "./router/calendarEvents.js";
import userSettingsRouter from "./router/usersettings.js";

const app = express();

app.use(express.json());

app.use("/api/todo", todoRouter);
app.use("/api/user", userRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/subcategories", subcategoriesRouter);
app.use("/api/timelogs", timelogsRouter);
app.use("/api/importantDates", importantDatesRouter);
app.use("/api/calendarEvents", calendarEventsRouter);
app.use("/api/userSettings", userSettingsRouter);

app.get("/", (req, res) => {
    res.send("Welcome to the API");
    console.log("Welcome to the API");
});

app.listen(ENV.PORT, () => {
    console.log(`Server is running on port ${ENV.PORT}`);
});


