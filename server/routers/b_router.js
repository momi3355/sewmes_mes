const express = require('express');
const router = express.Router();
const matOrderService = require('../services/Material/matOrder.js');


router.get("/matorder", async (req, res) => {
  try {
    const result = await matOrderService.getMaterialList();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "조회 중 오류 발생" });
  }
});

module.exports = router;