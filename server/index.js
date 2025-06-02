require("dotenv").config({ path: "./database/config/db_config.env" });

const express = require("express");
const morgan = require("morgan");
// const router = require("./routers/han_router.js");
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan(":date[iso] :method :url :status :remote-addr"));

app.get("/", (req, res) => {
  res.send("Welcome!!");
});

// app.use("/", router);

app.listen(port, () => {
  console.log(`listening server http://localhost:${port}`);
});
