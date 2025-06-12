const express = require('express');
const router = express.Router();
const matOrderService = require('../services/Material/matOrder.js');
const matCheckService = require('../services/Material/matCheck.js');


router.get("/matorder", async (req, res) => {
  try {
    const result = await matOrderService.getMaterialOrderList();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "조회 중 오류 발생" });
  }
});

router.get("/matcheck", async (req, res) => {
  try {
    const result = await matCheckService.getMaterialCheckList();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "조회 중 오류 발생" });
  }
});

module.exports = router;

