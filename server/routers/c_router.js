const express = require('express');
const router = express.Router();

const materialService = require('../services/BaseInfo/material_service');

router.get("/materialList", async (req, res) => {
  try {
    const result = await materialService.getMaterialList();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "검색 중 오류 발생" });
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