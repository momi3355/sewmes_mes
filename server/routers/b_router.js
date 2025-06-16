const express = require('express');
const router = express.Router();
const matOrderService = require('../services/Material/matOrder.js');
const matCheckService = require('../services/Material/matCheck.js');
const checkedMatService = require('../services/Material/matCheckView.js')


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

router.get("/matcheckview", async (req, res) => {
  try {
    const result = await checkedMatService.checkedMaterialList();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "조회 중 오류 발생"});
  }
});

router.post("/matorder/save", async (req, res) => {
  try {
    const orderList = req.body;
    const result = await matOrderService.saveMaterialOrder(orderList);
    res.status(200).send(result);

  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "저장 중 오류 발생" });
  }
});

module.exports = router;

