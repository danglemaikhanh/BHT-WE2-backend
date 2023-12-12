import { ShopListItemsResource } from "../Resources";
import { ShopItem } from "../model/ShopItemModel";
import { IShopList, ShopList } from "../model/ShopListModel";
import { IUser } from "../model/UserModel";
import { dateToString } from "./ServiceHelper";

/**
 * Gibt alle ShopItems zurück in einer ShopList zurück.
 */
export async function getShopListItems(shopListId: string): Promise<ShopListItemsResource> {
    const shopList = await ShopList.findById(shopListId);
    if (!shopList) {
        throw new Error(`No shopList with id ${shopListId}found`);
    }
    const shopItems = await ShopItem.find({ shopList: shopListId })
        .populate<{ creator: IUser & { id: string } }>("creator")
        .populate<{ shopList: IShopList & { id: string } }>("shopList")
        .exec();

    const shopItemsResource ={
        shopItems:  await Promise.all(shopItems.map(shopItem => ({
            id: shopItem.id,
            name: shopItem.name,
            quantity: shopItem.quantity,
            creator: shopItem.creator.id,
            creatorName: shopItem.creator.name,
            createdAt: dateToString(shopItem.createdAt),
            shopList: shopItem.shopList.id,
            shopListStore: shopItem.shopList.store  
        })))
    }
    return shopItemsResource;
}
