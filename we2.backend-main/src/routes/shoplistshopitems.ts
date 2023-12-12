// Vorlage für den Einstieg

import express from "express";
import { getShopListItems } from "../services/ShopListItemsService";
import { param, validationResult} from "express-validator";
import { optionalAuthentication } from "./authentication";

// Aufbau: Vgl. Folien 124 ff

const shopListShopItemsRouter = express.Router();

shopListShopItemsRouter.get("/api/shoplist/:id/shopitems", optionalAuthentication,
    param('id').isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const id = req.params!.id as string;
        try {
            const shopItems = await getShopListItems(id);
            res.send(shopItems); // 200 by default
        } catch (err) {
            res.status(404); // not found
            next(err);
        }
    })

export default shopListShopItemsRouter;