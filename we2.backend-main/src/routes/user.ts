import express from "express";
import { createUser, deleteUser, updateUser } from "../services/UsersService"
import { UserResource } from "../Resources";
import { body, param, validationResult, matchedData } from "express-validator";
import { requiresAuthentication } from "./authentication";
import { User } from "../model/UserModel";

// Aufbau: Vgl. Folie 119

const userRouter = express.Router();

userRouter.post("/", requiresAuthentication,
    body('name').isString().isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('admin').isBoolean(),
    body('password').isString().isLength({ max: 100 }), //.isStrongPassword()
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const user = await User.findById(req.userId);
        try {
            if (user) {
                if (!user.admin) {
                    return res.status(403).send({ error: "Forbidden" });
                }
            }
            const userResource = matchedData(req) as UserResource;
            const createdUserResource = await createUser(userResource);
            res.status(201).send(createdUserResource);
        } catch (err) {
            res.status(400);
            next(err);
        }
    })

userRouter.put("/:id", requiresAuthentication,
    param('id').isMongoId(),
    body('id').isMongoId(),
    body('name').isString().isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('admin').isBoolean(),
    body('password').optional().isString().isLength({ max: 100 }), //.isStrongPassword()
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        //const id = req.params!.id as string;
        const user = await User.findById(req.userId);
        try {
            if (user) {
                if (!user.admin) {
                    return res.status(403).send({ error: "Forbidden" });
                }
                const userResource = matchedData(req) as UserResource;
                const updatedUserResource = await updateUser(userResource);
                res.send(updatedUserResource);
            }
        } catch (err) {
            res.status(400); // duplicate user, we do not want show that
            next(err);
        }
    })


userRouter.delete("/:id", requiresAuthentication,
    param('id').isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const id = req.params!.id as string;
        try {
            const user = await User.findById(req.userId);
            if (!user) {
                return res.status(404);
            }
            // user muss admin sein und admin darf sich nicht selbst löschen
            if (!user!.admin || user!.id! == id) {
                return res.status(403).send({ error: "Forbidden" });
            }
            await deleteUser(id);
            res.sendStatus(204)
        } catch (err) {
            res.status(404);
            next(err);
        }
    })



export default userRouter;
