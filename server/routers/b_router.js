const express = require('express');
const router = express.Router();
const matOrderService = require('../services/Material/matOrder.js');
const matCheckService = require('../services/Material/matCheck.js');
const checkedMaterialService = require('../services/Material/matCheckView.js')
const companyService = require('../services/Material/company.js');
const matHold = require('../services/Material/matHold.js');
const matInOutService = require('../services/Material/matInOut.js');

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
    const result = await checkedMaterialService.checkedMaterialList();
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

router.get("/material/matcheckdetail/:inbound_check_code", async (req, res) => {
  try {
    // URL의 :inbound_check_code 파라미터 값을 가져옵니다.
    const { inbound_check_code } = req.params;
    
    // 이전에 만들어둔 matCheckView.js 서비스의 함수를 호출합니다.
    const result = await checkedMaterialService.getCheckDetailInfo(inbound_check_code);
    
    // 조회된 결과를 프론트로 보냅니다.
    res.send(result);
  } catch (err) {
    console.error("상세 정보 조회 라우터 오류:", err);
    res.status(500).send({ message: "상세 정보 조회 중 오류 발생" });
  }
});

router.get("/material/matcheckview", async (req, res) => {
  try {
    const result = await checkedMaterialService.checkedMaterialList();
    res.send(result);
  } catch (err){
    res.status(500).send({ message: "완료 목록 조회 중 오류 발생" });
  }
});

router.get("/material/hold", async (req, res) => {
  try{
    const result = await matHold.getHoldList();
    res.send(result);
  } catch(err) {
    res.status(500).send({ message: "예약 자재 조회 오류" });
  }
});

router.post("/material/hold/delete", async (req, res) => {
  try {
    // 프론트에서 보낸 삭제할 ID 배열 (req.body = { ids: ['H001', 'H002'] })
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
      return res.status(400).send({ message: "삭제할 항목이 없습니다." });
    }
    await matHoldService.deleteHoldMat(ids);
    res.status(200).send({ message: "선택된 항목이 삭제되었습니다." });
  } catch (err) {
    res.status(500).send({ message: "삭제 중 오류 발생" });
  }
});

router.get("/material/inout-list", async (req, res) => {
  try {
    // 나중에 검색 기능을 추가하면 req.query를 서비스로 넘겨줄 수 있음
    // const searchConditions = req.query;
    const result = await matInOutService.getInOutList();
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "입출고 내역 조회 중 오류 발생" });
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

