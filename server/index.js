require("dotenv").config({ path: "./database/configs/db_config.env" });

const express = require("express");
const morgan = require("morgan");
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan(":date[iso] :method :url :status :remote-addr"));

app.get("/", (req, res) => {
  res.send("Welcome!!");
});

app.use("", require("./routers/a_router.js"));
app.use("", require("./routers/b_router.js"));
app.use("", require("./routers/c_router.js"));
app.use("", require("./routers/d_router.js"));
app.use("", require("./routers/e_router.js"));
app.use("", require("./routers/f_router.js"));

app.listen(port, () => {
  console.log(`listening server http://localhost:${port}`);
});
