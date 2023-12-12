import { Types } from "mongoose";
import { ShopListResource } from "../Resources";
import { ShopItem } from "../model/ShopItemModel";
import { ShopList } from "../model/ShopListModel";
import { IUser, User } from "../model/UserModel";
import { dateToString } from "./ServiceHelper";

/**
 * Liefer die ShopList mit angegebener ID.
 * Falls keine ShopList gefunden wurde, wird ein Fehler geworfen.
 */
export async function getShopList(id: string): Promise<ShopListResource> {
    const shopList = await ShopList.findById(id)
        .populate<{ creator: IUser & { id: string } }>("creator")
        .exec();
    if (!shopList) {
        throw new Error(`No ShopList with the id ${id} found.`);
    }
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
}

/**
 * Erzeugt die ShopList.
 */
export async function createShopList(shopListResource: ShopListResource): Promise<ShopListResource> {
    const creator = await User.findById(shopListResource.creator).exec();
    if (!creator) {
        throw new Error(`No User with id ${shopListResource.creator}found`);
    }
    const shopList = new ShopList({
        store: shopListResource.store,
        creator: creator,
        public: shopListResource.public,
        done: shopListResource.done,
        createdAt: shopListResource.createdAt,
    });
    await shopList.save();
    return {
        id: shopList.id,
        store: shopList.store,
        creator: shopList.creator.id.toString(),
        creatorName: creator.name,
        public: shopList.public,
        done: shopList.done,
        createdAt: dateToString(shopList.createdAt),
        shopItemCount: 0
    }
}

/**
 * Ändert die Daten einer ShopList.
 * Aktuell können nur folgende Daten geändert werden: store, public, done.
 * Falls andere Daten geändert werden, wird dies ignoriert.
 */
export async function updateShopList(shopListResource: ShopListResource): Promise<ShopListResource> {
    const updatedShop = await ShopList.findById(shopListResource.id)
        .populate<{ creator: IUser & { id: string } }>("creator")
        .exec();
    if (!updatedShop) {
        throw new Error(`No ShopList with the id ${shopListResource.id} found.`);
    }
    const creator = await User.findById(shopListResource.creator).exec();
    if (!creator) {
        throw new Error(`No User with id ${shopListResource.creator}found`);
    }
    if (shopListResource.store) updatedShop.store = shopListResource.store;
    if (shopListResource.public) updatedShop.public = shopListResource.public;
    if (shopListResource.done) updatedShop.done = shopListResource.done;
    await updatedShop.save();
    return {
        id: updatedShop.id,
        store: updatedShop.store,
        creator: updatedShop.creator.id,
        creatorName: shopListResource.creatorName,
        public: updatedShop.public,
        done: updatedShop.done,
        createdAt: shopListResource.createdAt,
        shopItemCount: shopListResource.shopItemCount
    }
}

/**
 * Beim Löschen wird die ShopList über die ID identifiziert.
 * Falls keine ShopList nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 * Wenn die ShopList gelöscht wird, müssen auch alle zugehörigen ShopItems gelöscht werden.
 */
export async function deleteShopList(id: string): Promise<void> {
    const shopList = await ShopList.findById(id).exec();
    if (!shopList) {
        throw new Error(`No ShopList with the id ${id} found.`);
    }
    await ShopItem.deleteMany({ shopList: shopList }).exec();
    await ShopList.deleteOne({ _id: new Types.ObjectId(id) }).exec();
}
