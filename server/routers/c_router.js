const express = require('express');
const { convertObjToAry } = require('../utils/converts.js');
const router = express.Router();

const materialService = require('../services/BaseInfo/baseMaterial_service');
const productService = require('../services/BaseInfo/baseProduct_service');
const bomService = require('../services/BaseInfo/bom_service.js');
const prdReceiveService = require('../services/Production/prdReceive_service.js');

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

router.get("/baseMaterial/:code", async (req, res) => {
  try {
    const code = req.params.code;
    const result = await materialService.getMaterialListByCode(code);
    res.send(result[0]);
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
    res.status(500).send({ message: "추가 중 오류 발생("+err+")" });
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
    res.status(500).send({ message: "수정 중 오류 발생("+err+")" });
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

router.get("/baseProduct/:code", async (req, res) => {
  try {
    const code = req.params.code;
    const result = await productService.getProductListByCode(code);
    res.send(result[0]);
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

router.get("/bomItem", async (req, res) => {
  try {
    const result = await bomService.getBomItemList(req.query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "추가 중 오류 발생" });
  }
});

router.post("/bomDetail", async (req, res) => {
  try {
    const result = await bomService.addBomDataWithDetails(req.body);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "추가 중 오류 발생" });
  }
});

router.put("/bomDetail", async (req, res) => {
    try {
    const result = await bomService.upsertBomDetail(req.body);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "추가 중 오류 발생" });
  }
});

router.get("/bomDetail", async (req, res) => {
  try {
    const result = await bomService.getBomDetailList(req.query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "추가 중 오류 발생" });
  }
});

router.get("/prdReceive", async (req, res) => {
  try {
    const result = await prdReceiveService.getProductReceiveList(req.query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "검색 중 오류 발생" });
  }
});

router.get("/prdReceive/lot", async (req, res) => {
  const code = req.query.code; // '/prdReceive/lot?code='
  try {
    const result = await prdReceiveService.getReleaseLotList(code);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "검색 중 오류 발생" });
  }
});

router.post("/prdReceive", async (req, res) => {
  try {
    const result = await prdReceiveService.addReleaseDataWithDetails(req.body);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "추가 중 오류 발생" });
  }
});

router.get("/prdRelease", async (req, res) => {
    try {
    const result = await prdReceiveService.getReleaseList(req.query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "추가 중 오류 발생" });
  }
});

module.exports = router;