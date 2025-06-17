const express = require('express');
const router = express.Router();

const orderService = require(`../services/Sales/orderList.js`);
const companyService = require(`../services/Sales/companyList.js`);
const loginService = require(`../services/Sales/login.js`);
const outProdCompanyService = require(`../services/Sales/outsouOrderList.js`);

// 주문 전체 조회
router.get('/orderList', async (req, res) => {
  try {
    const orderList = await orderService.findAll();
    res.send(orderList);
  } catch (err) {
    console.error('주문 조회 중 오류 발생:', err);
    res.status(500).send('서버 오류');
  }
});

// 업체 정보
router.get('/companyList', async (req, res) => {
  try {
    const companyOrderList = await companyService.findAll();
    res.send(companyOrderList);
  } catch (err) {
    console.error('주문 조회 중 오류 발생:', err);
    res.status(500).send('서버 오류');
  }
});

// 외주 업체 목록 가지고오기
router.get('/outcompanyList', async (req, res) => {
  try {
    const companyOrderList = await outProdCompanyService.findAll3();
    res.send(companyOrderList);
  } catch (err) {
    console.error('주문 조회 중 오류 발생:', err);
    res.status(500).send('서버 오류');
  }
});

// 외주업체 클릭시 외주가능 제품 출력
router.get('/yesOutProdList', async (req, res) => {
  try {
    const companyOrderList = await outProdCompanyService.yesOutProdList();
    res.send(companyOrderList);
  } catch (err) {
    console.error('주문 조회 중 오류 발생:', err);
    res.status(500).send('서버 오류');
  }
});

// 외주업체 외주가능제품 등록
router.post('/outProdCpInsert', async (req, res) => {
  console.log("넘어온 데이터:", req.body);

  try {
    const result = await outProdCompanyService.outProdCompanyinsert(req.body);
    console.log(result);
    res.send(result);
  } catch (err) {
    res.status(500).send({ success: false, message: "등록 실패" });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  const { emp_num, login_pw } = req.body;

  // 백엔드 기본 유효성 체크
  if (!emp_num || !login_pw) {
    return res.status(400).json({ success: false, message: '필수 입력값이 누락되었습니다.' });
  }

  const result = await loginService.loginCheck(emp_num, login_pw);

  if (result.success) {
    res.json({ success: true, user: result.user });
  } else {
    res.status(401).json({ success: false, message: result.message });
  }
});

// 주문서 등록
router.post('/orderAdd', async (req, res) => {
  console.log("넘어온 데이터:", req.body);

  try {
    const result = await orderService.orderAdd(req.body);
    console.log(result);
    res.send(result);
  } catch (err) {
    res.status(500).send({ success: false, message: "등록 실패" });
  }
});

// 완제품목록 모달
router.get('/productList', async (req, res) => {
  try {
    const productList = await orderService.prodAll();
    res.send(productList);
  } catch (err) {
    console.error('주문 조회 중 오류 발생:', err);
    res.status(500).send('서버 오류');
  }
});
// 업체명 드롭다운
router.get('/companyDropDown', async (req, res) => {
  try {
    const orderList = await companyService.findAll2();
    res.send(orderList);
  } catch (err) {
    console.error('주문 조회 중 오류 발생:', err);
    res.status(500).send('서버 오류');
  }
});
module.exports = router;