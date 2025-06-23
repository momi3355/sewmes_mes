const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

//품질 서비스
const qualityService = require('../services/BaseInfo/quality_service.js');

//설비 서비스
const equipmentService = require('../services/BaseInfo/equimaster_service.js');

//차트 서비스
const chartService = require('../services/BaseInfo/mainChart_service.js');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); 
    const basename = path.basename(file.originalname, ext);
    const safeFilename = Date.now() + '-' + basename.replace(/\s/g, '_') + ext;
    cb(null, safeFilename);
  }
});
const upload = multer({ storage });

// ----------------------------------------------------------품질

//품질 검색 및 전체 조회
router.get('/quality', async (req, res) => {
  let qualitySearch = req.query;
  let qualityList = await qualityService.qualityList(qualitySearch)
                                        .catch(err => console.log(err));

  res.send(qualityList);
});

//품질 단건 조회
router.get('/quality/:code', async(req, res) => {
  let qualityCode = req.params.code;
  let qualityInfo = await qualityService.qualityOneSelect(qualityCode)
                                        .catch(err => console.log(err));
  res.send(qualityInfo);
});

// 이미지 파일 직접 제공???
router.get('/getimgs/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, '../uploads', filename);
  console.log('이미지 요청:', filename);
  if (!fs.existsSync(imagePath)) {
    return res.status(404).send('이미지 파일이 존재하지 않습니다.');
  }
  res.sendFile(imagePath);
});

//품질 등록
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
  console.log(result);
  res.send(result);
});

//품질 수정
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

//품질 갱신
router.put('/quality/renew/:code', upload.none(), async(req, res) => {
  let qualityInfo = req.body;
  let quality_code = req.params.code;
  qualityInfo.quality_code = quality_code
  let result = await qualityService.qualityRenewal(qualityInfo)
                                   .catch(err => console.log(err));
  res.send(result);
});

//품질이력 조회
router.get('/quality/history/:code', async(req, res) => {
  let qualityCode = req.params.code;

  let qualityHistoryList = await qualityService.qualityHistoryList(qualityCode)
                                         .catch(err => console.log(err));
  res.send(qualityHistoryList);
});

// ----------------------------------------------------------공통코드
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

// ----------------------------------------------------------설비

//설비 전체 조회
router.get('/equipment', async(req, res) => {
  const equiSearch = req.query;
  const equiList = await equipmentService.equiList(equiSearch)
                                         .catch(err => console.log(err));
  res.send(equiList);
});

//설비 단건 조회
router.get('/equipment/:code', async(req, res) => {
  let equiCode = req.params.code;
  
  let equiInfo = await equipmentService.equiOneSelect(equiCode).catch(err => console.log(err));
  res.send(equiInfo);
})

//설비 등록
router.post('/equipment', upload.single('image'), async(req, res) => {
  let equiInfo = req.body;
  if(req.file){
    equiInfo.fileName = req.file.filename;
    equiInfo.originalName = req.file.originalname;
    equiInfo.filePath = req.file.filename;
  }
  let result = await equipmentService.equiAdd(equiInfo).catch(err => console.log(err));
  res.send(result);
});

//설비 수정
router.put('/equipment/:code', upload.single('image'), async(req, res) => {
  let equiCode = req.params.code;
  let equiInfo = req.body;
  
  if(req.file){
    equiInfo.fileName = req.file.filename;
    equiInfo.originalName = req.file.originalname;
    equiInfo.filePath = req.file.filename;
  }
  let result = await equipmentService.equiModify(equiCode, equiInfo)
                                   .catch(err => console.log(err));
  res.send(result);
});

//설비 이력 조회
router.get('/equipment/history/:code', async(req, res) => {
  let equiCode = req.params.code;

  let equiHistoryList = equipmentService.equiHistoryList(equiCode).catch(err => console.log(err));
  res.send(equiHistoryList);
})

//설비 점검/수리(하고싶다)

//설비 이력 등록
router.post('/equipment/history', async(req, res) => {
  let equiHistoryInfo = req.body;

  let result = equipmentService.equiHistoryInsert(equiHistoryInfo).catch(err=>console.log(err));
  res.send(result);
})

//설비 고장조회

//-----------------------------------------------------차트

//차트(한달동안 생산계획작업지시공정생산량불량량)
router.get('/mainChart/production', async (req, res) => {
  let productionList = await chartService.processChartList()
                                        .catch(err => console.log(err));
  res.send(productionList);
});

//차트(작업지시별 공정 완료...율?)
router.get('/mainChart/complete', async (req, res) => {
  let processCompleteList = await chartService.workInstToProcessCompleteList()
                                        .catch(err => console.log(err));

  res.send(processCompleteList);
});

//차트(날짜별 생산량 흐름?)
router.get('/mainChart/dateOutput', async (req, res) => {
  let dateOutputList = await chartService.dateOfProdList()
                                        .catch(err => console.log(err));

  res.send(dateOutputList);
});

module.exports = router;