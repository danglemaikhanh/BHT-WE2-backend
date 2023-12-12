import { Types } from "mongoose";
import { ShopItemResource } from "../Resources";
import { ShopItem } from "../model/ShopItemModel";
import { IShopList, ShopList } from "../model/ShopListModel";
import { IUser, User } from "../model/UserModel";
import { dateToString } from "./ServiceHelper";

/**
 * Liefert die ShopItemResource mit angegebener ID.
 * Falls kein ShopItem gefunden wurde, wird ein Fehler geworfen.
 */
export async function getShopItem(id: string): Promise<ShopItemResource> {
    const item = await ShopItem.findById(id)
        .populate<{ creator: IUser & { id: string } }>("creator")
        .populate<{ shopList: IShopList & { id: string } }>("shopList")
        .exec();
    if (!item) {
        throw new Error(`No Item with id ${id} found`);
    }
    return {
        id: id,
        name: item.name,
        quantity: item.quantity,
        remarks: item.remarks,
        creator: item.creator.id,
        creatorName: item.creator.name,
        shopList: item.shopList.id,
        shopListStore: item.shopList.store,
        createdAt: dateToString(item.createdAt)
    }
}

/**
 * Erzeugt ein ShopItem.
 * Daten, die berechnet werden aber in der gegebenen Ressource gesetzt sind, werden ignoriert.
 * Falls die Liste geschlossen (done) ist, wird ein Fehler wird geworfen.
 */
export async function createShopItem(shopItemResource: ShopItemResource): Promise<ShopItemResource> {
    const shopList = await ShopList.findById(shopItemResource.shopList).exec();
    if (!shopList) {
        throw new Error(`ShopList with id ${shopItemResource.shopList} not found, cannot create shop item`);
    }
    if (shopList.done) {
        throw new Error("ShopList is already closed");
    }
    const user = await User.findById(shopItemResource.creator).exec();
    if (!user) {
        throw new Error(`No user with id ${shopItemResource.creator}found.`);
    }
    const shopItem = new ShopItem({
        name: shopItemResource.name,
        quantity: shopItemResource.quantity,
        remarks: shopItemResource.remarks,
        creator: user,
        shopList: shopList,
        createdAt: shopItemResource.createdAt
    });
    await shopItem.save();
    return {
        id: shopItem.id,
        name: shopItem.name,
        quantity: shopItem.quantity,
        remarks: shopItem.remarks,
        creator: user.id,
        creatorName: user.name,
        createdAt: dateToString(shopItem.createdAt),
        shopList: shopList.id,
        shopListStore: shopList.store
    }
}

/**
 * Updated eine ShopItem. Es können nur Name, Quantity und Remarks geändert werden.
 * Aktuell können ShopItems nicht von einem ShopList in einen anderen verschoben werden.
 * Auch kann der Creator nicht geändert werden.
 * Falls die ShopList oder Creator geändert wurde, wird dies ignoriert.
 */
export async function updateShopItem(shopItemResource: ShopItemResource): Promise<ShopItemResource> {
    const user = await User.findById(shopItemResource.creator).exec();
    if (!user) {
        throw new Error(`No user with id ${shopItemResource.creator} found.`);
    }
    const shopList = await ShopList.findById(shopItemResource.shopList).exec();
    if (!shopList) {
        throw new Error(`No shopList with id ${shopItemResource.shopList}found`);
    }
    const updateItem = await ShopItem.findById(shopItemResource.id)
        .populate<{ creator: IUser & { id: string } }>("creator")
        .populate<{ shopList: IShopList & { id: string } }>("shopList")
        .exec();
    if (!updateItem) {
        throw new Error(`No item with id ${shopItemResource.id}found.`);
    }
    if (shopItemResource.name) updateItem.name = shopItemResource.name;
    if (shopItemResource.quantity) updateItem.quantity = shopItemResource.quantity;
    if (shopItemResource.remarks) updateItem.remarks = shopItemResource.remarks;

    await updateItem.save();
    return {
        id: updateItem.id,
        name: updateItem.name,
        quantity: updateItem.quantity,
        remarks: updateItem.remarks,
        creator: updateItem.creator.id,
        creatorName: updateItem.creator.name,
        createdAt: dateToString(updateItem.createdAt),
        shopList: updateItem.shopList.id,
        shopListStore: updateItem.shopList.store
    }
}

/**
 * Beim Löschen wird das ShopItem über die ID identifiziert.
 * Falls es nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 */
export async function deleteShopItem(id: string): Promise<void> {
    const item = await ShopItem.findById(id).exec();
    if (!item) {
        throw new Error(`No item with the id ${id} found.`);
    }
    await ShopItem.deleteOne({ _id: new Types.ObjectId(id) }).exec();
}


