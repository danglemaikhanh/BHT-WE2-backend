import { NextFunction, Request, Response } from "express";
import { verifyJWT } from "../services/JWTService";
import { logger } from "../logger"


/**
 * Typdefinitionen für TypeScript.
 */
declare global {
    namespace Express {
        /**
         * Wir erweitern das Interface `Request` um die Felder `userId` und `role`.
         * Das ist nur für TypeScript wichtig, damit wir später auf diese Felder ohne 
         * Compiler-Fehler zugreifen können.
         */
        export interface Request {
            /**
             * Mongo-ID of currently logged in user; or undefined, if user is a guest.
             */
            userId?: string;
            role: "u" | "a";
        }
    }
}

/**
 * Prüft Authentifizierung und schreibt `userId` mit Mongo-ID des Users und `role` mit Kürzel der Rolle in den Request.
 * Falls Authentifizierung fehlschlägt, wird ein Fehler (401) erzeugt.
 */
export async function requiresAuthentication(req: Request, res: Response, next: NextFunction) {
    //throw new Error("Not implemented");
    req.userId = undefined;
    const auth = req.header("Authorization")
    if (auth && auth.startsWith("Bearer ")) {
        try {
            const jwtString = auth.substring("Bearer ".length);
            const { userId, role } = verifyJWT(jwtString);
            req.userId = userId;
            req.role = role;
            next();
        } catch (err) {
            res.status(401); // Unauthorized
            res.setHeader("WWW-Authenticate", ['Bearer', 'realm="app"', 'error="invalid_token"']);
            logger.error("invalid token");
            next(err);
        }
    } else {
        res.status(401); // Unauthorized
        res.setHeader("WWW-Authenticate", ['Bearer', 'realm="app"']);
        logger.error("Authentication required");
        next("Authentication required");
    }
}

/**
* Prüft Authentifizierung und schreibt `userId` mit Mongo-ID des Users und `role` mit Kürzel der Rolle in den Request.
* Falls kein JSON-Web-Token im Request-Header vorhanden ist, wird kein Fehler erzeugt (und auch nichts in den Request geschrieben).
* Falls Authentifizierung fehlschlägt, wird ein Fehler (401) erzeugt.
*/
export async function optionalAuthentication(req: Request, res: Response, next: NextFunction) {
    //throw new Error("Not implemented");
    const auth = req.header("Authorization");

    if (auth && auth.startsWith("Bearer ")) {
        try {
            const jwtString = auth.substring("Bearer ".length);
            const { userId, role } = verifyJWT(jwtString);
            req.userId = userId;
            req.role = role;
            next();
        } catch (err) {
            res.status(401);
            res.setHeader("WWW-Authenticate", ['Bearer', 'realm="app"', 'error="invalid_token"']);
            next(err);
        }
    }
    else {
        next();
    }
}