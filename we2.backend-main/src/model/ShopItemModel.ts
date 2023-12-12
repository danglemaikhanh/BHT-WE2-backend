import { Schema, model, Types } from "mongoose"

//Interface für die ShopItem Entität
export interface IShopItem {
    name: string;
    quantity: string;
    remarks?: string;
    createdAt: Date;
    creator: Types.ObjectId;
    shopList: Types.ObjectId;
}

//Schema für die ShopItem Entität
const shopItemSchema = new Schema<IShopItem>({
    name: { type: String, required: true },
    quantity: {type: String, required: true},
    remarks: String,
    createdAt: { type: Date, timestamps: true, default: Date.now() },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    shopList: {type: Schema.Types.ObjectId, ref: "ShopList", required: true}
    }, { timestamps: true }
);

//Model für die ShopItem Entität
export const ShopItem = model("ShopItem", shopItemSchema);