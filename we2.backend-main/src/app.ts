import express from 'express';
import "express-async-errors" // needs to be imported before routers and other stuff!
import loginRouter from './routes/login';
import shopListShopItemsRouter from './routes/shoplistshopitems';
import userRouter from './routes/user';
import usersRouter from './routes/users';
import shopListRouter from './routes/shoplist';
import shoppersRouter from './routes/shopper';
import shopItemRouter from './routes/shopItem';
import cookieParser from 'cookie-parser';
//import { optionalAuthentication, requiresAuthentication } from './routes/authentication';




const app = express();

// Middleware:
app.use('*', express.json());
app.use(cookieParser());
/*app.use(requiresAuthentication);
app.use(optionalAuthentication);*/

// Routes
app.use(shopListShopItemsRouter) // wird hier ohne Präfix registriert, da er bereits einen Präfix hat (dies ist aber die Ausnahme)
app.use("/api/login", loginRouter)   // wird erst später implementiert, hier nur Dummy; hat aber bereits einen Präfix

// Registrieren Sie hier die weiteren Router (mit Pfad-Präfix):

app.use("/api/users", usersRouter);
app.use("/api/user", userRouter);
app.use("/api/shoplist", shopListRouter);
app.use("/api/shopper", shoppersRouter);
app.use("/api/shopitem", shopItemRouter);

export default app;