import { Schema, model, Types } from "mongoose"

//Interface für die ShopList Entität
export interface IShopList {
    creator: Types.ObjectId;
    store: string;
    public: boolean;
    createdAt: Date;
    done: boolean;
}

//Schema für die ShopList Entität
const shopListSchema = new Schema<IShopList>({
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    store: { type: String, required: true },
    public: { type: Boolean, default: false },
    createdAt: { type: Date, timestamps: true, default: Date.now() },
    done: {type: Boolean, default: false}
    }, { timestamps: true }
);

//Model für die ShopList Entität
export const ShopList = model("ShopList", shopListSchema);