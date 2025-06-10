const express = require('express');
const multer = require('multer');
const path = require('path');
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
})

//단건 조회
router.get('/quality/:code', async(req, res) => {
  let qualityCode = req.params.code;
  let qualityInfo = await qualityService.qualityOneSelect(qualityCode)
                                        .catch(err => console.log(err));
  res.send(qualityInfo);
})

//등록
router.put('/quality', upload.single('image'), async(req, res) => {
  let qualityInfo = req.body;
  let result = await qualityService.qualityAdd(qualityInfo)
                                   .catch(err => console.log(err));
  res.send(result);
})

//수정
router.put('/quality/:code', async(req, res) => {
  let qualityCode = req.params.code;
  let qualityInfo = req.body;

  let result = await qualityService.qualityModify(qualityCode, qualityInfo)
                                   .catch(err => console.log(err));
  res.send(result);
})

//갱신
router.put('/quality/renew/:code', async(req, res) => {
  let qualityInfo = req.body;

  let result = await qualityService.qualityRenewal(qualityInfo)
                                   .catch(err => console.log(err));
  res.send(result);
})

//이력 조회
router.get('/quality/history/:code', async(req, res) => {
  let qualityCode = req.params.code;

  let qualityHistoryList = qualityService.qualityHistoryList(qualityCode)
                                         .catch(err => console.log(err));
  res.send(qualityHistoryList);
})

module.exports = router;