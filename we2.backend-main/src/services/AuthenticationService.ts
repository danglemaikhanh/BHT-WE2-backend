import { User } from "../model/UserModel";

/**
 * Prüft Email und Passwort, bei Erfolg wird die ID und der Name des Users zurückgegeben
 * und success ist true. Groß-/Kleinschreibung bei der E-Mail ist zu ignorieren.
 * Falls kein User mit gegebener EMail existiert oder das Passwort falsch ist, wird nur 
 * success mit falsch zurückgegeben. Aus Sicherheitsgründen wird kein weiterer Hinweis gegeben.
 */
export async function login(email: string, password: string): Promise<{ success: boolean, id?: string, name?: string, role?: "u"|"a"}> {
    const user = await User.findOne({ email: email.toLowerCase() }).exec();
    if (!user) {
        return { success: false };
    }
    const checkPassword = await user.isCorrectPassword(password);
    if(!checkPassword){
        return { success: false };
    }
    if (user.admin){
        return { success: true, id: user._id.toString(), name: user.name, role: "a" };
    }
    return { 
        success: true, 
        id: user._id.toString(), 
        name: user.name, 
        role: "u" }; 
}