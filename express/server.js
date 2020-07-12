"use strict";
const express = require("express");
const cors = require("cors");
const path = require("path");
const serverless = require("serverless-http");
const app = express();
const bodyParser = require("body-parser");
require("isomorphic-fetch");

const router = express.Router();
router.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<h1>Hello from Express.js!</h1>");
  res.end();
});
router.post("/itemlist", cors(), (req, res) => {
  const list = req.body.list.map((l) => l.replace(" ", "-"));
  Promise.all(
    list.map((name) => {
      console.log(name);
      return fetch(`https://villagerdb.com/item/${name}`)
        .then((res) => res.text())
        .then((txt) => {
          const m = txt.match(/id=\"item-image\" src=\"([^\"]*)\"/) || [];
          return {
            name,
            img: "https://villagerdb.com" + m[1],
          };
        });
    })
  )
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      console.error(err);
      return res.json({ error: "Error server" });
    });
});
router.get("/another", (req, res) => res.json({ route: req.originalUrl }));
router.post("/", (req, res) => res.json({ postBody: req.body }));

app.use(bodyParser.json());
app.use("/.netlify/functions/server", router); // path must route to lambda
app.use("/", (req, res) => res.sendFile(path.join(__dirname, "../index.html")));

module.exports = app;
module.exports.handler = serverless(app);
