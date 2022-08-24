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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_COUND_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false })); // post에서 보낸 데이터 req.body로 받을려면 있어야함
app.use(express.static(path.join(__dirname, "/public")));
app.use("/upload", express.static(path.join(__dirname, "/upload")));
app.set("port", process.env.PORT || 8099);
const PORT = app.get("port");

const storage = multer.diskStorage({
  // destination: (req, file, done) => {
  //   done(null, path.join(__dirname, "/upload"));
  // },
  // filename: (req, file, done) => {
  //   done(null, file.originalname);
  // },
});

const fileUpload = multer({ storage: storage });

app.get("/", (req, res) => {
  // db에서 데이터 읽어서
  // index로 데이터 전달하기...
  db.collection("pinterest")
    .find()
    .toArray((err, result) => {
      res.render("index", { list: result });
    });
});
app.get("/list", (req, res) => {
  // db에서 데이터 읽어서
  // index로 데이터 전달하기...
  db.collection("pinterest")
    .find()
    .toArray((err, result) => {
      res.render("list", { list: result });
    });
});
app.get("/detail/:title", (req, res) => {
  console.log(req.params.title);
  res.render("detail");
});
app.get("/insert", (req, res) => {
  res.render("insert");
});
app.post("/register", fileUpload.single("image"), (req, res) => {
  const title = req.body.title;
  const date = req.body.date;
  const category = Array.isArray(req.body.category) ? req.body.category.join(" ") : req.body.category;
  const desc = req.body.desc;
  const point = req.body.point;
  const image = req.file.filename;
  console.log(title, "===", date, "===", category, "===", desc, "===", point, "===", image);
  //res.render("insert");
  cloudinary.uploader.upload(req.file.path, (result) => {
    //console.log(result);
    // 이미지 업로드가 재대로 되면 1. pinterestCount에서 name이 total을 찾아서 결과중에 count찾아서 pinterest의 id값으로 입력을 한다.
    // 그리고 pinterest에 값이 제대로 입력이 되면 다시 pinterrestCount의 count값을 1 증가 시켜서 update한다.
    db.collection("pinterestCount").findOne({ name: "total" }, (err, result01) => {
      const count = result01.count;
      db.collection("pinterest").insertOne(
        {
          title: title,
          date: date,
          category: category,
          desc: desc,
          point: point,
          image: result.url,
          id: count,
        },
        (err, result) => {
          db.collection("pinterestCount").updateOne({ name: "total" }, { $inc: { count: 1 } }, (err, result) => {
            if (err) {
              console.log(err);
            }
            res.redirect("/");
          });
        }
      );
    });
  });
});
app.get("/delete", (req, res) => {
  //console.log(req.query.id);
  db.collection("pinterest").deleteOne({ id: parseInt(req.query.id) }, (err, result) => {
    if (result.deletedCount > 0) {
      res.json({ isDelete: true });
    } else {
      res.json({ isDelete: false });
    }
  });
});
app.listen(PORT, () => {
  console.log(`${PORT}에서 서버 대기중`);
});
