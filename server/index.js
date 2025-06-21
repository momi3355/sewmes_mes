require("dotenv").config({ path: "./database/configs/db_config.env" });

const express = require("express");
const morgan = require("morgan");

const app = express();
const port = 3000;

const contextPath = process.argv[2] == "dev" ? "" : "/api";

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan(":date[iso] :method :url :status :remote-addr"));

app.get("/", (req, res) => {
  // console.log(process.argv[2]);
  res.send("Welcome!!");
});

app.use(contextPath, require("./routers/a_router.js"));
app.use(contextPath, require("./routers/b_router.js"));
app.use(contextPath, require("./routers/c_router.js"));
app.use(contextPath, require("./routers/d_router.js"));
app.use(contextPath, require("./routers/e_router.js"));
app.use(contextPath, require("./routers/f_router.js"));

app.listen(port, () => {
  console.log(`listening server http://localhost:${port}`);
});
