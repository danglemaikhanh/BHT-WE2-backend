import { Model, Query, Schema, model } from "mongoose"
import bcrypt from "bcryptjs"
import { logger } from "../logger"

//Interface für die User Entität
export interface IUser {
    email: string;
    name: string;
    password: string;
    admin: boolean;
}

// Interface für die Methode
export interface IUserMethods {
    isCorrectPassword(password: string): boolean;
}
type UserModel = Model<IUser, {}, IUserMethods>;

//Schema für die User Entität
const userSchema = new Schema<IUser, UserModel, IUserMethods>({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: { type: Boolean, default: false }
});

// Hash passwort
userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        const hashPassword = await bcrypt.hash(this.password, 10);
        this.password = hashPassword;
    }
});
// updateOne
userSchema.pre<Query<any, IUser>>("updateOne", async function () {
    if (this.getUpdate()) {
        const update = this.getUpdate() as { password: string } | null;
        if (update && update.password) {
            const hashPassword = await bcrypt.hash(update.password, 10)
            update.password = hashPassword;
            logger.info("The password has been updated");
        }
    }
    else {
        logger.info("Password has not been changed");
    }
});

// updateMany
userSchema.pre<Query<any, IUser>>('updateMany', async function () {
    if (this.getUpdate()) {
        const update = this.getUpdate() as { password: string } | null;
        if (update && update.password) {
            const hashPassword = await bcrypt.hash(update.password, 10)
            update.password = hashPassword;
            logger.info("The password for the users has been updated");
        }
    }
    else {
        logger.info("The Password for the users has not been changed");
    }
});

// Methode
userSchema.method("isCorrectPassword", async function (password: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, this.password);
    if (!isMatch) {
        logger.error("The password is not correct");
    } else {
        logger.info("The password is correct");
    }
    return isMatch;
});

//Model für die User Entität
export const User = model<IUser, UserModel>("User", userSchema);
