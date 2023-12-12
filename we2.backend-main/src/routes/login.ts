import express from "express";
import { body, validationResult, matchedData } from "express-validator";
import { verifyPasswordAndCreateJWT } from "../services/JWTService";
import { LoginResource } from "../Resources";
import { requiresAuthentication } from "./authentication";
import { logger } from "../logger"
// Implementierung wird Teil eines nächsten Aufgabenblattes.

const loginRouter = express.Router();

/**
 * Diese Funktion bitte noch nicht implementieren, sie steht hier als Platzhalter.
 * Wir benötigen dafür Authentifizierungsinformationen, die wir später in einem JSW speichern.
 */
loginRouter.post("/",
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ max: 100 }),
    async (req, res, next) => {
        logger.info("login requested");
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const loginResource = matchedData(req) as { email: string, password: string };
            const jwtString = await verifyPasswordAndCreateJWT(loginResource.email, loginResource.password);
            if (jwtString) {
                const login: LoginResource = {
                    access_token: jwtString,
                    token_type: "Bearer"
                }
                return res.status(200).send(login);
            }
        } catch (err) {
            res.status(404);
            next(err);
        }
    })

export default loginRouter;