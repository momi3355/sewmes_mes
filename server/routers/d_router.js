const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

 // 해당 라우터를 통해 제공할 서비스를 가져옴
const processService =require('../services/BaseInfo/process_service.js');
const outsouService =require('../services/Production/outsou_service.js');
const prodPlanService =require('../services/Production/prodPlan_service.js');

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
// 신규데이터 추가
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
router.get('/productList', async (req, res)=>{
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
// ==============================================================

// 외주입고 페이지 라우터 =========================================
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

module.exports = router;