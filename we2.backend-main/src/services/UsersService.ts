import { Types } from "mongoose";
import { UserResource, UsersResource } from "../Resources";
import { User } from "../model/UserModel";
import { ShopList } from "../model/ShopListModel";
import { ShopItem } from "../model/ShopItemModel";


/**
 * Die Passwörter dürfen nicht zurückgegeben werden.
 */
export async function getUsers(): Promise<UsersResource> {
    const users = await User.find().exec();
    if (users.length < 1) {
        throw new Error('No user found');
    }
    const userResource = {
        users: users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            admin: user.admin!
        }))
    }
    return userResource;
}

/**
 * Erzeugt einen User. Die E-Mail-Adresse wird in Kleinbuchstaben umgewandelt.
 * Das Password darf nicht zurückgegeben werden.
 */
export async function createUser(userResource: UserResource): Promise<UserResource> {
    const lowerCaseEmail = userResource.email.toLowerCase(); 
    const user = await User.create({
        name: userResource.name,
        email: lowerCaseEmail,
        admin: userResource.admin,
        password: userResource.password
    });
    await user.save();
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        admin: user.admin
    }
}

/**
 * Updated einen User. Die E-Mail-Adresse, falls angegeben, wird in Kleinbuchstaben umgewandelt.
 * Beim Update wird der User über die ID identifiziert.
 * Der Admin kann einfach so ein neues Passwort setzen, ohne das alte zu kennen.
 */
export async function updateUser(userResource: UserResource): Promise<UserResource> {
    if (!userResource.id) {
        throw new Error("User id missing, cannot update");
    }
    
    const user = await User.findById(userResource.id).exec();
    if (!user) {
        throw new Error(`No user with id ${userResource.id} found, cannot update`);
    }
    if (userResource.name) user.name = userResource.name;
    if (userResource.email) user.email = userResource.email.toLowerCase();
    if (userResource.admin !== undefined) user.admin = userResource.admin;
    if (userResource.password) user.password = userResource.password;

    const savedUser = await user.save();
    return {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        admin: savedUser.admin!
    }
}

/**
 * Beim Löschen wird der User über die ID identifiziert. 
 * Falls Benutzer nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 * Wenn der User gelöscht wird, müssen auch alle zugehörigen ShopLists und ShopItems gelöscht werden.
 */
export async function deleteUser(id: string): Promise<void> {
    const userID = await User.findById(id).exec();
    if (!userID) {
        throw new Error(`No user with id ${id} found`);
    }
    await ShopList.deleteMany({user: id}).exec();
    await ShopItem.deleteMany({user: id}).exec();
    await User.deleteOne({ _id: new Types.ObjectId(id) }).exec();
    /*if (res.deletedCount !== 1) {
        throw new Error(`No user with id ${id} deleted, probably id not valid`);
    }
    */
}