const express = require("express");
const app = express();
const dotenv = require("dotenv").config(); // .env파일 쓸려면 있어야 하는거....
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary");

const MongoClient = require("mongodb").MongoClient;
let db = null;
MongoClient.connect(process.env.MONGO_URL, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log(err);
  }
  db = client.db("crudapp");
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false })); // post에서 보낸 데이터 req.body로 받을려면 있어야함
app.use(express.static(path.join(__dirname, "/public")));
//app.use("/upload", express.static(path.join(__dirname, "/upload")));
app.set("port", process.env.PORT || 8099);
const PORT = app.get("port");

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/insert", (req, res) => {
  res.render("insert");
});

app.listen(PORT, () => {
  console.log(`${PORT}에서 서버 대기중`);
});
