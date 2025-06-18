const express = require('express');
const router = express.Router();
const matOrderService = require('../services/Material/matOrder.js');
const matCheckService = require('../services/Material/matCheck.js');
const checkedMatService = require('../services/Material/matCheckView.js')
const companyService = require('../services/Material/company.js');


router.get("/matorderview", async (req, res) => {
  try {
    const result = await matOrderService.getMaterialList();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "조회 중 오류 발생" });
  }
});

router.get("/matcheck", async (req, res) => {
  try {
    const result = await matCheckService.getMaterialCheckListView();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "조회 중 오류 발생" });
  }
});

router.get("/matquality", async (req, res) => {
  try {
    const result = await matCheckService.getMaterialQualityTest();
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

router.get("/matorder", async (req, res) => {
  try {
    const result = await matOrderService.getMaterialOrderList();
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

router.get("/companies", async (req, res) => {
  try {
    const result = await companyService.getCompanyList();
    res.send(result);
  } catch (err) { res.status(500).send({ message: "공급처 조회 중 오류" }); }
});

router.post("/material/complete-check", async (req, res) => {
  try{
    const result = await matCheckService.completeMaterialCheck(req.body);
    res.send(result);
  } catch(err){
    console.error("검사 완료 라우터 오류:", err);
    res.status(500).send({ success: false, mesage: "저장 중 오류 발생"});
  }
});

router.get("/material/matcheckview", async (req, res) => {
  try {
    const result = await checkedMatService.checkedMaterialList();
    res.send(result);
  } catch (err){
    res.status(500).send({ message: "완료 목록 조회 중 오류 발생" });
  }
});

//router.post("/material/start-check", async (req, res) => {
//  try {
//    // 발주 코드를 받아서 '검수 시작' 처리
//    const { material_order_code } = req.body;
//    const result = await matCheckService.startMaterialCheck(material_order_code);
//    res.send(result);
//  } catch (err) {
//    res.status(500).send({ success: false, message: "검수 시작 처리 중 오류" });
//  }
//});

module.exports = router;

