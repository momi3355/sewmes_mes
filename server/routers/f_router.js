const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const qualityService = require('../services/BaseInfo/quality_service');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage : storage });

//검색 및 전체 조회
router.get('/quality', async (req, res) => {
  let qualityList = await qualityService.qualityList(req.query)
                                        .catch(err => console.log(err));

  res.send(qualityList);
});

//단건 조회
router.get('/quality/:code', async(req, res) => {
  let qualityCode = req.params.code;
  let qualityInfo = await qualityService.qualityOneSelect(qualityCode)
                                        .catch(err => console.log(err));
  res.send(qualityInfo);
});

// 이미지 파일 직접 제공???
router.get('/quality/img/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, '../uploads', filename);

  if (!fs.existsSync(imagePath)) {
    return res.send('이미지 파일이 존재하지 않습니다.');
  }
  res.sendFile(imagePath);
});

//등록
router.post('/quality', upload.single('image'), async(req, res) => {
  let qualityInfo = req.body;
  console.log('insert router', qualityInfo);
  if(req.file){
    qualityInfo.fileName = req.file.filename;
    qualityInfo.originalName = req.file.originalname;
    qualityInfo.filePath = req.file.filename;
  }
  let result = await qualityService.qualityAdd(qualityInfo)
                                   .catch(err => console.log(err));
  res.send(result);
});

//수정
router.put('/quality/:code', upload.single('image'), async(req, res) => {
  let qualityCode = req.params.code;
  let qualityInfo = req.body;
  
  if(req.file){
    qualityInfo.fileName = req.file.filename;
    qualityInfo.originalName = req.file.originalname;
    qualityInfo.filePath = req.file.filename;
  }
  let result = await qualityService.qualityModify(qualityCode, qualityInfo)
                                   .catch(err => console.log(err));
  res.send(result);
});

//갱신
router.put('/quality/renew/:code', async(req, res) => {
  let qualityInfo = req.body;

  let result = await qualityService.qualityRenewal(qualityInfo)
                                   .catch(err => console.log(err));
  res.send(result);
});

//이력 조회
router.get('/quality/history/:code', async(req, res) => {
  let qualityCode = req.params.code;

  let qualityHistoryList = await qualityService.qualityHistoryList(qualityCode)
                                         .catch(err => console.log(err));
  res.send(qualityHistoryList);
});

//그룹코드 전체조회
router.get('/groupCode/gc/:code', async(req, res) => {
  let groupCode = req.params.code;

  let groupCodeList = await qualityService.groupCodeSearchList(groupCode).catch(err => console.log(err));
  res.send(groupCodeList);
})

//그룹코드 상세조회
router.get('/groupCode/dc/:code', async(req, res) => {
  let detailCode = req.params.code;
  let detailCodeInfo = await qualityService.groupCodeDetailInfo(detailCode).catch(err => console.log(err));
  res.send(detailCodeInfo);
})

//multiplestatements test
// router.get('/procedure', async(req, res) => {
//   let newCode = await qualityService.testproc().catch(err => console.log('router: ', err));
//   console.log('router', newCode);
//   res.send(newCode);
// })

module.exports = router;