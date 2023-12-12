import express from "express";
import { getShopList, createShopList, deleteShopList, updateShopList } from "../services/ShopListService";
import { ShopListResource } from "../Resources";
import { body, param, validationResult, matchedData } from "express-validator";
import { optionalAuthentication, requiresAuthentication } from "./authentication";

const shopListRouter = express.Router();

shopListRouter.get("/:id", optionalAuthentication,
    param('id').isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const shopListId = req.params!.id as string;
        try {
            const shopList = await getShopList(shopListId);
            if (!shopList.public && req.userId !== shopList.creator){
                return res.status(403).send({ error: "You are not authorized to view this shop list" });
            }
            res.send(shopList);
        } catch (err) {
            res.status(404);
            next(err);
        }
    });

shopListRouter.post("/", requiresAuthentication,
    body('store').isString().isLength({ max: 100 }),
    body('creator').isMongoId(),
    body('creatorName').optional().isString().isLength({ max: 100 }),
    body('public').optional().isBoolean(),
    body('done').optional().isBoolean(),
    body('createdAt').optional().isString().isLength({ max: 100 }),
    body('shopItemCount').optional().isInt(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const shopListResource = matchedData(req) as ShopListResource;
        try {
            const newShopList = await createShopList(shopListResource);
            res.send(newShopList);
        } catch (err) {
            res.status(404);
            next(err);
        }
    });

shopListRouter.put("/:id", requiresAuthentication,
    param('id').isMongoId(),
    body('id').isMongoId(),
    body('store').isString().isLength({ max: 100 }),
    body('creator').isMongoId(),
    body('creatorName').optional().isString().isLength({ max: 100 }),
    body('public').isBoolean(),
    body('done').isBoolean(),
    body('createdAt').optional().isString().isLength({ max: 100 }),
    body('shopItemCount').optional().isInt(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const shopListId = req.params!.id as string;
        try {
            const shopList = await getShopList(shopListId);
            if (shopList.creator !== req.userId) {
                return res.status(403).send({ error: "Forbidden" });
            }
            const shopListResource = matchedData(req) as ShopListResource;
            const updatedShopList = await updateShopList(shopListResource);
            res.status(201).send(updatedShopList);
        } catch (err) {
            res.status(404);
            next(err);
        }
    });

shopListRouter.delete("/:id", requiresAuthentication,
    param('id').isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const shopListId = req.params!.id as string;
        try {
            const shopList = await getShopList(shopListId);
            if (shopList.creator !== req.userId) {
                return res.status(403).send({ error: "Forbidden" });
            }
            await deleteShopList(shopListId);
            res.sendStatus(204);
        } catch (err) {
            res.status(404);
            next(err);
        }
    });

export default shopListRouter;
