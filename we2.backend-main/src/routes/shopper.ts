import express from "express";
import { getShopper } from "../services/ShopperService";
import { optionalAuthentication } from "./authentication";

const shoppersRouter = express.Router();

shoppersRouter.get("/", optionalAuthentication,
async (req, res, next) => {

    /* const shopper = await getShopper();
    const publicShopLists = shopper.shopLists.filter(shopList => shopList.public === true);
    res.send({ shopLists: publicShopLists }); */
    try{
        const shopper = await getShopper(req.userId);
        res.send(shopper);
    }catch(err){
        res.status(404);
        next(err);
    }
});

export default shoppersRouter;