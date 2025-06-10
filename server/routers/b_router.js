const express = require('express');
const router = express.Router();
const matOrderService = require('../services/Material/matOrder.js');


router.get("/matorderList", async (req, res) => {
  try {
    const result = await matOrderService.getMaterialList(req.query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "조회 중 오류 발생" });
  }
});

router.post("/materialInsert", async (req, res) => {
  let code = req.params.code;
  try {
    const result = await materialService.setMaterial(code, req.body);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "수정 중 오류 발생" });
  }
});

router.put("/materialUpdate/:code", async (req, res) => {
  let code = req.params.code;
  try {
    const result = await materialService.addMaterial(code, req.body);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "추가 중 오류 발생" });
  }
});

module.exports = router;