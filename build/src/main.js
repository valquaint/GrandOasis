"use strict";
const express = require('express');
const bodyParser = require('body-parser');
const path = require("node:path");
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");
const winston = require('winston');
let config;
try {
    config = require("./config.json") || null;
}
catch (err) {
    console.warn("Config file is not properly formatted. Unable to load config. Please check that it is valid JSON.");
}
const ENVIRONMENT = (() => {
    const args = {
        PORT: 4242,
        DEBUG: false
    };
    const regE = new RegExp(/\1(-{2}[A-z]*[\w\S]*)|\2(-{1}[A-z]{1})|\3(-{2}[A-z]*)/, "i");
    console.log(process.argv);
    let currentFlag = {
        flag: "",
        processed: false
    };
    for (const arg of process.argv) {
        //console.log(`Testing ${arg}`)
        const Exists = regE.exec(arg);
        if (Exists) {
            const regExec = Exists[0];
            console.log(`REGEX TESTS: ${regExec}`);
            if (regExec && currentFlag.processed) {
                currentFlag.flag = regExec;
            }
            else if (regExec) {
                Object.keys(args).forEach((k, v) => {
                    if (currentFlag.flag.toUpperCase() === k || currentFlag.flag.toUpperCase() === k.substring(0, 1)) {
                        args[k] = true;
                    }
                });
                currentFlag.flag = regExec;
            }
            else {
                Object.keys(args).forEach((k, v) => {
                    if (currentFlag.flag.toUpperCase() === k || currentFlag.flag.toUpperCase() === k.substring(0, 1)) {
                        switch (typeof args[k]) {
                            case "number":
                                args[k] = parseInt(arg);
                                break;
                            case "boolean":
                                args[k] = arg === "true" ? true : false;
                                break;
                            case "string":
                            default:
                                args[k] = arg;
                                break;
                        }
                    }
                });
            }
        }
    }
    return args;
})();
console.log(ENVIRONMENT);
const mainTransport = new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize({
        level: true,
        colors: {
            info: "blue",
            debug: "orange",
            error: "red"
        }
    }), winston.format.splat(), winston.format.simple())
});
winston.add(mainTransport);
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, './public'));
const app = express();
app.use(connectLivereload());
app.use(bodyParser.json());
app.use("/", express.static(path.resolve(path.join(__dirname, "./public"))));
const findPort = ENVIRONMENT.PORT || config?.port || 4242;
app.listen(findPort, console.log(`Test Server is live at http://localhost:${findPort}`));
app.post("/console", (req, res) => {
    if (process.argv.indexOf("debug") > -1) {
        for (const r of req.body) {
            if (typeof (r) === "object") {
                winston.info("From frontend, Object:");
                console.log(r);
            }
            else {
                winston.info(r);
            }
        }
    }
    res.sendStatus(200);
});
liveReloadServer.server.once("connection", () => {
    console.log("Reconnected to frontend...");
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 100);
});
