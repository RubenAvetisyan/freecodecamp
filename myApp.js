require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

console.log("Hello World");

app.use(function (req, res, next) {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// ✅ Mount body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Static assets
app.use("/public", express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/json", function (req, res) {
  const message = process.env.MESSAGE_STYLE === "uppercase"
    ? "HELLO JSON"
    : "Hello json";
  res.json({ message });
});

// ✅ Time middleware
app.get("/now", function (req, res, next) {
  req.time = new Date().toString();
  next();
}, function (req, res) {
  res.json({ time: req.time });
});

app.get("/:word/echo", function (req, res) {
    res.json({ echo: req.params.word });
});  

app.route("/name")
  .get(function (req, res) {
    const { first, last } = req.query;
    res.json({ name: `${first} ${last}` });
  })
  .post(function (req, res) {
    const { first, last } = req.body;
    res.json({ name: `${first} ${last}` });
  });

module.exports = app;
