const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

 // 해당 라우터를 통해 제공할 서비스를 가져옴
const processService =require('../services/BaseInfo/process_service.js');
const outsouService =require('../services/Production/outsou_service.js');
const prodPlanService =require('../services/Production/prodPlan_service.js');
const prdInboundService =require('../services/Production/prdInbound_service.js');
const lotService =require('../services/Production/lot_service.js');

// 공정관리 페이지 라우터 =========================================
router.get('/processList', async (req, res)=>{
  try {
    const { code, name, equi } = req.query;
    const result = await processService.findProcessByConditions(code, name, equi);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "검색 중 오류 발생" });
  }
});
// 신규 공정 데이터 추가
router.post('/processInsert', async (req, res) => {
  try {
    const newCode = await processService.insertProcess(req.body);
    res.send({ success: true, processCode: newCode });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "등록 중 오류 발생" });
  }
});
// processCode 기준 업데이트
router.put('/processUpdate', async (req, res) => {
  try {
    await processService.updateProcess(req.body);
    res.send({ success: true, message: "수정 완료" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "수정 중 오류 발생" });
  }
});
// processCode 기준 삭제
router.delete('/processDelete/:code', async(req, res) => {
    try {
        const processCode = req.params.code;
        await processService.deleteProcess(processCode);
        res.send({ success : true, message : "삭제 완료" });
    } catch (err) {
        console.log(err);
        res.status(500).send({ success : false, message : "삭제 중 오료" })
    }
})
// ==============================================================

// 공정흐름 페이지 라우터 =========================================
router.get('/flowProductList', async (req, res)=>{
  try {
    const { cate, name } = req.query;
    const result = await processService.findProdByConditions(cate, name);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "검색 중 오류 발생" });
  }
});
// Prod_code 기준으로 공정흐름 data가져오기
router.get('/flowList', async (req, res) => {
  try {
    const prodCode = req.query.prodCode;
    if (!prodCode) return res.status(400).send('prodCode is required');

    const result = await processService.getProcessFlowByProdCode(prodCode);
    res.json(result);
  } catch (err) {
    console.error('공정 흐름 조회 오류:', err);
    res.status(500).send('Server Error');
  }
});
// Prod_code 기준으로 공정흐름 저장
router.post('/flowSave', async (req, res) => {
  try {
    const { prodCode, flows } = req.body;
    if (!prodCode || !Array.isArray(flows)) return res.status(400).send('Invalid data');

    await processService.saveProcessFlows(prodCode, flows);
    res.send({ success: true, message: "저장 완료" });
  } catch (err) {
    console.error("flowSave 오류:", err);
    res.status(500).send("저장 실패");
  }
});
// 공정 순서 삭제하기
router.delete('/flowDelete/:flowCode', async (req, res) => {
  const flowCode = req.params.flowCode;
  try {
    await processService.deleteFlowWithAttach(flowCode);
    res.send({ success: true, message: "공정 및 이미지 삭제 완료" });
  } catch (err) {
    console.error("flowDelete 오류:", err);
    res.status(500).send("삭제 실패");
  }
});
// 공정 흐름 이미지 등록
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const newName = `${Date.now()}${ext}`;
    cb(null, newName);
  }
});
const upload = multer({ storage });
// 이미지 등록
router.post('/flowImageUpload', upload.single('image'), async (req, res) => {
  
  const flowCode = req.body.flowCode;
  const file = req.file;

  if (!flowCode || !file) {
    return res.status(400).send('필수 정보 누락');
  }
  const originFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
  try {
    await processService.saveAttachFile({
      flowCode,
      fileName: file.filename,
      originFileName
    });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});
// 저장된 이미지 불러오기
router.get('/flowImage/:flowCode', async (req, res) => {
  const flowCode = req.params.flowCode;

  try {
    const file = await processService.getAttachFileByFlowCode(flowCode);
    if (!file) return res.status(404).send("이미지 없음");

    const imagePath = path.resolve(__dirname, '../uploads', file.file_name);

    // 파일이 존재하는지 명확히 확인
    if (!fs.existsSync(imagePath)) {
      console.error("파일 없음:", imagePath);
      return res.status(404).send("파일 경로 오류");
    }

    res.sendFile(imagePath);
  } catch (err) {
    console.error("파일 전송 실패:", err);
    res.sendStatus(500);
  }
});
// 공정 정보 가져오기
router.get('/processSearch', async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword || keyword.trim() === '') {
      return res.status(400).send({ message: '검색어를 입력해주세요.' });
    }
    const result = await processService.searchProcessByKeyword(keyword);
    res.send(result);
  } catch (err) {
    console.error("제품 검색 오류:", err);
    res.status(500).send({ message: '서버 오류 발생' });
  }
});
// ==============================================================

// 생산계획관리 페이지 라우터 =========================================
router.get('/prodPlanList', async (req, res)=>{
  try {
    const {
      prodCode, prodName, orderCode, complete, startDateStart,
      startDateEnd, endDateStart, endDateEnd
    } = req.query;
    const result = await prodPlanService.findProdPlanByConditions({
      prodCode, prodName, orderCode, complete, startDateStart,
      startDateEnd, endDateStart, endDateEnd
    });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "검색 중 오류 발생" });
  }
});
// 생산계획 저장
router.post('/saveProdPlans', async (req, res) => {
  try {
    const plans = req.body.plans;
    const result = await prodPlanService.saveProdPlans(plans);
    res.send({ message: '저장 성공', result });
  } catch (err) {
    console.error("저장 중 오류:", err);
    res.status(500).send({ message: '저장 실패', error: err.message });
  }
});
// 제품 정보 가져오기
router.get('/productSearch', async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword || keyword.trim() === '') {
      return res.status(400).send({ message: '검색어를 입력해주세요.' });
    }
    const result = await prodPlanService.searchProductByKeyword(keyword);
    res.send(result);
  } catch (err) {
    console.error("제품 검색 오류:", err);
    res.status(500).send({ message: '서버 오류 발생' });
  }
});
// prodPlanCode 기준 삭제
router.post('/prodPlanDelete', async(req, res) => {
  try {
    const plans = req.body.plans;
    await prodPlanService.deleteProdPlan(plans);
    res.send({ success : true, message : "삭제 완료" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ success : false, message : "삭제 중 오료" })
  }
});

// ==============================================================

// 주문제품목록 모달 라우터 =========================================
router.get('/orderProdList', async (req, res)=>{
  try {
    const {
      order_state
    } = req.query;
    const result = await prodPlanService.findOrderProdList({
      order_state
    });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "검색 중 오류 발생" });
  }
});




// ==============================================================

// 외주발주 페이지 라우터 =========================================
router.get('/outsouOrderList', async (req, res)=>{
  try {
    const {
      outsouOrderCode, prodName, cpName, releaseState, regStartDate,
      regEndDate, deadStartDate, deadEndDate
    } = req.query;
    const result = await outsouService.findOutsouOrderByConditions({
      outsouOrderCode, prodName, cpName, releaseState, regStartDate,
      regEndDate, deadStartDate, deadEndDate
    });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "검색 중 오류 발생" });
  }
});

// 납기일자 미등록 외주발주 건 수 조회
router.get('/outsouOrderNullDeadCount', async (req, res) => {
  try {
    const result = await outsouService.findOutsouOrderNullDeadCount();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "검색 중 오류 발생" });
  }
});

// ==============================================================

// 외주발주 모달 라우터 =========================================
router.get('/outsouOrderNotDeadList', async (req, res)=>{
  try {
    const result = await outsouService.findOutsouOrderNotDeadList();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "검색 중 오류 발생" });
  }
});
// 납기일자 등록
router.put('/updateOutsouDeadDate', async (req, res) => {
  try {
    const updates = req.body;
    await outsouService.updateOutsouDeadDate(updates);
    res.send({ message: '업데이트 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: '업데이트 실패' });
  }
});
// 외주물품별 외주처 모달 정보 가져오기
router.get('/getCpListByProdCode', async (req, res) => {
  try {
    const { prodCode } = req.query;
    const result = await outsouService.getCpListByProdCode(prodCode);
    res.send(result);
  } catch (err) {
    console.error("업체 리스트 조회 오류:", err);
    res.status(500).send({ message: '서버 오류 발생' });
  }
});

// ==============================================================

// 외주자재출고 페이지 라우터 =========================================
router.get('/outsouReleaseMaterialList', async (req, res)=>{
  try {
    const {
      outsouOrderCode, materialName, cpName, releaseState, regStartDate,
      regEndDate, deadStartDate, deadEndDate
    } = req.query;
    const result = await outsouService.findOutsouReleaseMaterialByConditions({
      outsouOrderCode, materialName, cpName, releaseState, regStartDate,
      regEndDate, deadStartDate, deadEndDate
    });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "검색 중 오류 발생" });
  }
});
// outsou_order_code 기준으로 외주자재출고 목록 가져오기
router.get('/releaseMaterialList', async (req, res) => {
  try {
    const outsouOrderCode = req.query.outsouOrderCode;
    if (!outsouOrderCode) return res.status(400).send('outsouOrderCode is required');

    const result = await outsouService.getReleaseMaterialByOutsouOrderCode(outsouOrderCode);
    res.json(result);
  } catch (err) {
    console.error('공정 흐름 조회 오류:', err);
    res.status(500).send('Server Error');
  }
});
// 외주발주 출고 처리
router.post('/outsouReleaseProc', async (req, res) => {
  try {
    const updates = req.body;
    await outsouService.callOutsouRelease(updates);  // 배열이든 단일값이든 처리 가능
    res.send({ message: '출고처리 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: '출고처리 실패' });
  }
});
// 외주입고 등록 처리
router.post('/outsouInboundAutoInsert', async (req, res) => {
  try {
    const { outsouOrderCode, orderQty, deadDate, prodCode, cpCode } = req.body;
    await outsouService.autoInsertOutsouInbound({
      outsouOrderCode,
      inboundQty: orderQty,
      regDate: deadDate,
      prodCode,
      cpCode
    });
    res.send({ message: '입고 등록 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: '입고 등록 실패' });
  }
});
// ==============================================================

// 외주입고 페이지 라우터 =========================================
// 외주입고 목록 조건에 따라 가져오기
router.get('/outsouInboundReceiveList', async (req, res)=>{
  try {
    const {
      regStart, regEnd, inboundStart, inboundEnd,
      cpName, prodName, testState
    } = req.query;
    const result = await outsouService.findInboundReceiveByConditions({
      regStart, regEnd, inboundStart, inboundEnd,
      cpName, prodName, testState
    });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "검색 중 오류 발생" });
  }
});
// 외주입고 품질 검사 목록 가져오기
router.get('/semiProductQualityTest', async (req, res) => {
  try {
    const result = await outsouService.getSemiProductQualityTest();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
});
// 외주입고 품질 검사 기존 정보 가져오기(지금 사용X)
router.get('/defectDetail/:inboundCode', async (req, res) => {
  try {
    const result = await outsouService.getDefectDetailByInboundCode(req.params.inboundCode);
    res.json(result);
  } catch (err) {
    console.error('검사상세 조회 실패:', err);
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
});
// ==============================================================

// 외주입고불량내역 페이지 라우터 =========================================
router.get('/outsouInboundDefectList', async (req, res)=>{
  try {
    const {
      regStart, regEnd, inboundStart, inboundEnd,
      cpName, prodName, inboundCode
    } = req.query;
    const result = await outsouService.findInboundDefectByConditions({
      regStart, regEnd, inboundStart, inboundEnd,
      cpName, prodName, inboundCode
    });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "검색 중 오류 발생" });
  }
});
// 외주입고 검사 완료 시 저장
router.post("/saveInboundInspection", async (req, res) => {
  try {
    const { outsouInboundCode, userCode, passQty, defectList } = req.body;
    await outsouService.callSaveOutsouInboundInspection({
      outsouInboundCode,
      userCode,
      passQty,
      defectList
    });
    res.send({ message: "저장 완료" });
  } catch (err) {
    console.error("입고검사 저장 실패:", err);
    res.status(500).send({ message: "입고검사 저장 실패" });
  }
});
// ==============================================================

// 완제품 입고 검수 페이지 라우터 =========================================
router.get('/productTestList', async (req, res)=>{
  try {
    const {
      regStart, regEnd, checkStart, checkEnd, prodName, testState
    } = req.query;
    const result = await prdInboundService.findProdInboundTestByConditions({
      regStart, regEnd, checkStart, checkEnd, prodName, testState
    });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "검색 중 오류 발생" });
  }
});
// 완제품 품질 검사 목록 가져오기
router.get('/productQualityTest', async (req, res) => {
  try {
    const result = await prdInboundService.getProductQualityTest();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
});
// 완제품 입고 검사 프로시저 불러오기
router.post('/saveProdInboundInspection', async (req, res) => {
  try {
    const { workPerfCode, userCode, passQty, defectList } = req.body;
    await prdInboundService.saveInboundInspection(workPerfCode, userCode, passQty, defectList);
    res.status(200).send({ message: '입고검사 저장 완료' });
  } catch (err) {
    console.error('입고검사 저장 실패:', err);
    res.status(500).send({ message: '입고검사 저장 실패' });
  }
});
// work_perf_code 기준으로 완제품 입고 검사 내역 가져오기
router.get('/inboundTestHistory', async (req, res) => {
  try {
    const inboundCheckCode = req.query.inboundCheckCode;
    if (!inboundCheckCode) return res.status(400).send('inboundCheckCode is required');

    const result = await prdInboundService.getTestHistoryByOutsouOrderCode(inboundCheckCode);
    res.json(result);
  } catch (err) {
    console.error('공정 흐름 조회 오류:', err);
    res.status(500).send('Server Error');
  }
});
// Lot 이력 검색
router.get('/lotHistoryList', async (req, res)=>{
  try {
    const {
      releaseCode, lotCode, prodName
    } = req.query;
    const result = await lotService.findLotListByConditions({
      releaseCode, lotCode, prodName
    });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "검색 중 오류 발생" });
  }
});


module.exports = router;