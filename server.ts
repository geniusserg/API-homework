import express from "express";
import { connectToDatabase } from "./service"
import { gamesRouter } from "./routers/games";
import { usersRouter } from "./routers/users";
import { staticRouter } from "./routers/static";

const app = express();

connectToDatabase()
    .then(() => {
        app.use("/games", gamesRouter);
        app.use("/users", usersRouter);
        app.use("/static", staticRouter);
        app.listen(3000, () => {
            console.log("Express started");
        });
    })
    .catch((error: Error) => {
        console.log("Database connection failed", error);
    });
