const express = require('express');
const router = express.Router();

const orderService = require(`../services/Sales/orderList.js`);
const companyService = require(`../services/Sales/companyList.js`);
const loginService = require(`../services/Sales/login.js`);

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

// const result = await loginService.findAll(req.body.data);
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
router.post('/orderAdd', async(req, res) => {
  const newOrder = await orderService.orderAdd(req.body)
  res.send(newOrder)
})

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

module.exports = router;












// // 로그인 정보
// router.post("/info", (req,res)=>{
//   res.send( {email : req.session.email})
// })

// // 로그인 login?email=aaa = (쿼리) login/??? = (param) ??.post = (body)
// router.post("/login", (req, res)=>{
//   const {email, pw} = req.body
//   // 로그인 처리
//   req.session.email = email;
//   req.session.save(err=>{
//     if(err) throw err;
//     res.send({code: "success"});
//   });
// })

// // 로그아웃
// router.post("/logout", (req,res)=>{
//   req.session.destroy();
//   res.send("logout success");
// })