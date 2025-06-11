const express = require('express');
const { convertObjToAry } = require('../utils/converts.js');
const router = express.Router();

const materialService = require('../services/BaseInfo/baseMaterial_service');
const productService = require('../services/BaseInfo/baseProduct_service');

router.get("/baseMaterial", async (req, res) => {
  //query string 사용
  try {
    const result = await materialService.getMaterialList(req.query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "검색 중 오류 발생" });
  }
});

router.post("/baseMaterial", async (req, res) => {
  try {
    const result = await materialService.addMaterial(req.body.data);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "추가 중 오류 발생" });
  }
});

router.put("/baseMaterial", async (req, res) => {
  const updateColumn = Object.keys(req.body);
  const attr = convertObjToAry(req.body, updateColumn); //객체 분해
  const code = req.query.code; // '/baseMaterial?code='
  try {
    const result = await materialService.setMaterial(code, attr);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "수정 중 오류 발생" });
  }
});

router.get("/baseProduct", async (req, res) => {
  try {
    const result = await productService.getProductList(req.query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "검색 중 오류 발생" });
  }
});

router.post("/baseProduct", async (req, res) => {
  try {
    const result = await productService.addProduct(req.body.data);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "추가 중 오류 발생" });
  }
});

router.put("/baseProduct", async (req, res) => {
  const updateColumn = Object.keys(req.body);
  const attr = convertObjToAry(req.body, updateColumn); //객체 분해
  const code = req.query.code; // '/baseProduct?code='
  try {
    const result = await productService.setProduct(code, attr);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "수정 중 오류 발생" });
  }
});

module.exports = router;