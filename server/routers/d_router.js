const express = require('express');
const router = express.Router();

 // 해당 라우터를 통해 제공할 서비스를 가져옴
const processService =require('../services/BaseInfo/process_service.js');

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

// 공정흐름름 페이지 라우터 =========================================
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

module.exports = router;