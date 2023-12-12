import express from "express";
import { getUsers } from "../services/UsersService";
import { optionalAuthentication } from "./authentication";
import { logger } from "../logger"
import { User } from "../model/UserModel";

// Aufbau: Vgl. Folie 119

const usersRouter = express.Router();

usersRouter.get("/", optionalAuthentication,
    async (req, res, next) => {
        logger.info("test");
        try {
            const user = await User.findById(req.userId);
            if (user) {
                if (!user.admin) {
                    return res.status(403).send({ error: "Forbidden" });
                }
            }
            const users = await getUsers();
            res.send(users); // 200 by default
        }
        catch (err) {
            res.status(404);
            next(err);
        }
    })


export default usersRouter;
