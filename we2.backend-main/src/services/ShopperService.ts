import { ShopperResource } from "../Resources";
import { ShopItem } from "../model/ShopItemModel";
import { ShopList } from "../model/ShopListModel";
import { IUser, User } from "../model/UserModel";
import { dateToString } from "./ServiceHelper";

/**
 * Gibt alle ShopLists zurück, die für einen User sichtbar sind. Dies sind:
 * - alle öffentlichen (public) ShopLists
 * - alle eigenen ShopLists, dies ist natürlich nur möglich, wenn die userId angegeben ist.
 */
export async function getShopper(userId?: string): Promise<ShopperResource> {
    let shopper;

    if (!userId) {
        shopper = await ShopList.find({ public: true })
            .populate<{ creator: IUser & { id: string } }>("creator")
            .exec();      
    }
    else {
        const user = await User.findById(userId).exec();
        if (!user) {
            throw new Error(`No User with the id ${userId} found.`);
        }
        shopper = await ShopList.find({ $or: [{ public: true }, { creator: user.id }] })
            .populate<{ creator: IUser & { id: string } }>("creator")
            .exec();
    }

    return {
        shopLists: await Promise.all(shopper.map(async (shopList) => {
            const shopItem = await ShopItem.find({shopList: shopList}).exec();
            return {
                id: shopList.id,
                store: shopList.store,
                creator: shopList.creator.id,
                creatorName: shopList.creator.name,
                public: shopList.public,
                done: shopList.done,
                createdAt: dateToString(shopList.createdAt),
                shopItemCount: shopItem.length
            }
        }))
    }
}
