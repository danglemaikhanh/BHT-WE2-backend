/* istanbul ignore file */

import http from "http";
import https from "https";
import mongoose from 'mongoose';
import app from "./app";
import { logger } from "./logger"
import { readFile } from "fs/promises";

import dotenv from "dotenv";
import { prefillDB } from "./prefill";
dotenv.config() // read ".env"

async function setup() {

    let mongodURI = process.env.DB_CONNECTION_STRING;
    if (!mongodURI) {
        logger.error(`Cannot start, no database configured. Set environment variable DB_CONNECTION_STRING. Use "memory" for MongoMemoryServer`);
        process.exit(1);
    }
    if (mongodURI === "memory") {
        logger.info("Start MongoMemoryServer")
        const MMS = await import('mongodb-memory-server')
        const mongo = await MMS.MongoMemoryServer.create();
        mongodURI = mongo.getUri();
        if (process.env.DB_PREFILL == "true") {
            prefillDB();
            }
    }

    logger.info(`Connect to mongod at ${mongodURI}`)
    await mongoose.connect(mongodURI);

    const useSSL = process.env.USE_SSL === 'true';
    if (useSSL) {
        const key = process.env.SSL_KEY_FILE ? process.env.SSL_KEY_FILE : "cert/private.key";
        const cert = process.env.SSL_CERT_FILE ? process.env.SSL_CERT_FILE : "cert/public.crt";

        const [privateSSLKey, publicSSLCert] = await Promise.all([
            readFile(key),
            readFile(cert)
        ]);
        const httpsPort = process.env.HTTPS_PORT ? parseInt(process.env.HTTPS_PORT) : 3001;
        const httpsServer = https.createServer({ key: privateSSLKey, cert: publicSSLCert }, app);
        httpsServer.listen(httpsPort, () => {
            logger.info(`Listening for HTTPS at https://localhost:${httpsPort}`);
        });
    }
    else {
        const port = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 3000;
        const httpServer = http.createServer(app);
        httpServer.listen(port, () => {
            logger.info(`Listening for HTTP at http://localhost:${port}`);
        });
    }
};

setup();