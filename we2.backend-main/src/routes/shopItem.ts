import express from "express";
import { ShopItemResource } from "../Resources";
import { createShopItem, getShopItem, updateShopItem, deleteShopItem } from "../services/ShopItemService";
import { body, param, validationResult, matchedData } from "express-validator";
import { optionalAuthentication, requiresAuthentication } from "./authentication";
import { getShopList } from "../services/ShopListService";
const shopItemRouter = express.Router();

shopItemRouter.get("/:id", optionalAuthentication,
    param('id').isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const shopItemId = req.params!.id as string;
        try {
            const shopItem = await getShopItem(shopItemId);
            const shopList = await getShopList(shopItem.shopList);
            if (!shopList.public && shopList.creator !== req.userId){
                return res.status(403).send({ error: "Forbidden" });
            }
            res.send(shopItem);
        } catch (err) {
            res.status(404);
            next(err);
        }
    });

shopItemRouter.post("/", requiresAuthentication,
    body('name').isString().isLength({ max: 100 }),
    body('quantity').isString().isLength({ max: 100 }),
    body('remarks').optional().isString().isLength({ max: 100 }),
    body('creator').isMongoId(),
    body('creatorName').optional().isString().isLength({ max: 100 }),
    body('createdAt').optional().isString().isLength({ max: 100 }),
    body('shopList').isMongoId(),
    body('shopListStore').optional().isString().isLength({ max: 100 }),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const shopListId = req.body.shopList;
        try {
            const shopList = await getShopList(shopListId);
            if (!shopList.public && shopList.creator !== req.userId){
                return res.status(403).send({ error: "Forbidden" });
            }
            const shopItemResource = matchedData(req) as ShopItemResource;
            const newShopItem = await createShopItem(shopItemResource);
            res.send(newShopItem);
        } catch (err) {
            res.status(404);
            next(err);
        }
    });

shopItemRouter.put("/:id", requiresAuthentication,
    param('id').isMongoId(),
    body('id').isMongoId(),
    body('name').isString().isLength({ max: 100 }),
    body('quantity').isString().isLength({ max: 100 }),
    body('remarks').optional().isString().isLength({ max: 100 }),
    body('creator').isMongoId(),
    body('creatorName').optional().isString().isLength({ max: 100 }),
    body('createdAt').optional().isString().isLength({ max: 100 }),
    body('shopList').isMongoId(),
    body('shopListStore').optional().isString().isLength({ max: 100 }), async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const shopItemId = req.params!.id as string;
        const shopListId = req.body.shopList;
        try {
            const shopItem = await getShopItem(shopItemId);
            const shopList = await getShopList(shopListId);
            if (shopItem.creator !== req.userId && shopList.creator !== req.userId) {
                return res.status(403).send({ error: "Forbidden" });
            }
            const shopItemResource = matchedData(req) as ShopItemResource;
            const updatedShopItem = await updateShopItem(shopItemResource);
            res.status(201).send(updatedShopItem);
        } catch (err) {
            res.status(404);
            next(err);
        }
    });

shopItemRouter.delete("/:id", requiresAuthentication,
    param('id').isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const shopItemId = req.params!.id as string;
        try {
            const shopItem = await getShopItem(shopItemId);
            if (shopItem.creator !== req.userId) {
                return res.status(403).send({ error: "Forbidden" });
            }
            await deleteShopItem(shopItemId);
            res.sendStatus(204);
        } catch (err) {
            res.status(404);
            next(err);
        }
    });

export default shopItemRouter;