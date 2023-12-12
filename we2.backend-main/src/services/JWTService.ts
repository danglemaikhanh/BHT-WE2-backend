import { JwtPayload, sign, verify } from "jsonwebtoken";
import { User } from "../model/UserModel";
import dotenv from 'dotenv';
dotenv.config();

/**
 * Prüft Email und Passwort, bei Erfolg wird ein String mit einem JWT-Token zurückgegeben.
 *  
 * Die zur Unterzeichnung notwendige Passphrase wird aus der Umgebungsvariable `JWT_SECRET` gelesen,
 * falls diese nicht gesetzt ist, wird ein Fehler geworfen.
 * Die Zeitspanne, die das JWT gültig ist, also die 'Time To Live`, kurz TTL, wird der Umgebungsvariablen
 * `JWT_TTL` entnommen. Auch hier wird ein Fehler geworfen, falls diese Variable nicht gesetzt ist.
 * 
 * Wir schreiben die Rolle nur mit "u" oder "a" in das JWT, da wir nur diese beiden Rollen haben und 
 * wir das JWT so klein wie möglich halten wollen.
 * 
 * @param email E-Mail-Adresse des Users
 * @param password Das Passwort des Users
 * @returns JWT als String, im JWT ist sub gesetzt mit der Mongo-ID des Users als String sowie role mit "u" oder "a" (User oder Admin); 
 *      oder undefined wenn Authentifizierung fehlschlägt.
 */
export async function verifyPasswordAndCreateJWT(email: string, password: string): Promise<string | undefined> {
    //throw new Error("Not implemented");
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new Error("No User with this Email found");
    }
    const checkPassword = await user.isCorrectPassword(password);
    if (!checkPassword) {
        throw new Error("Wrong Password");
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not set");
    }
    const jwtTTL = process.env.JWT_TTL;
    if (!jwtTTL) {
        throw new Error("JWT_TTL is not set");
    }
    const roles = ['u'];
    if (user.admin) roles.push('a');

    const payload: JwtPayload = {
        sub: user._id.toString(),
        role: roles
    }
    const jwtString = sign(payload, jwtSecret, { expiresIn: jwtTTL, algorithm: "HS256" });
    return jwtString;
}

/**
 * Gibt user id (Mongo-ID) und ein Kürzel der Rolle zurück, falls Verifizierung erfolgreich, sonst wird ein Error geworfen.
 * 
 * Die zur Prüfung der Signatur notwendige Passphrase wird aus der Umgebungsvariable `JWT_SECRET` gelesen,
 * falls diese nicht gesetzt ist, wird ein Fehler geworfen.
 * 
 * @param jwtString das JWT
 * @return user id des Users (Mongo ID als String) und Rolle (u oder a) des Benutzers; 
 *      niemals undefined (bei Fehler wird ein Error geworfen)
 */
export function verifyJWT(jwtString: string | undefined): { userId: string, role: "u" | "a" } {
    //throw new Error("Not implemented");
    if (!jwtString) {
        throw new Error("No JWT String given"); 
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not set");
    }
    try {
        const jwtChecks = verify(jwtString, jwtSecret, { algorithms: ["HS256"] }) as JwtPayload;
        if (typeof jwtChecks === 'object' && "sub" in jwtChecks && jwtChecks.sub) {
            return {userId:jwtChecks.sub?.toString(), role:jwtChecks.role};
        }
    } catch (err) {
        throw new Error("Invalid JWT");
    }    
    throw new Error("Invalid JWT");
}
