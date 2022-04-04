require("express-async-errors");
const express = require("express");
const helmet = require("helmet");
const config = require("./config/environment");

const https = require('https');

const Exception = require("./helpers/errorHandlers/Exception");

// for reading certificates
const fs = require('fs');
// for deployment
// const key = fs.readFileSync('./ssl/server.key');
// const cert = fs.readFileSync('./ssl/server.cer');
// for local
const key = fs.readFileSync('./ssl/key.pem');
const cert = fs.readFileSync('./ssl/cert.pem');

const cors = require("cors");
require("./config/passport.config");
const app = express();
app.use(helmet());
// delete next middleware before deployment!!!!!!!!!!!!!!!!
app.use(cors({ origin: "*" }));

app.set("port", config.port);

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

const asExcelRoutes = require('./modules/as-excel/route/as-excel.route');


app.get('/test', (req, res) => { res.json('this is a secure server') });

app.use('/api/as-excel', asExcelRoutes);
app.use(Exception.requestDefaultHandler);

const server = https.createServer({ key: key, cert: cert }, app);

server.listen(config.port, () => { console.log(`listening on ${config.port}`) });