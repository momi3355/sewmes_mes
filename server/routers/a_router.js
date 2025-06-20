const express = require('express');
const router = express.Router();

const orderService = require(`../services/Sales/orderList.js`);
const companyService = require(`../services/Sales/companyList.js`);
const loginService = require(`../services/Sales/login.js`);
const outProdCompanyService = require(`../services/Sales/outsouOrderList.js`);

// 주문서 관리(조회) 목록 출력 라우터
router.get('/orderList', async (req, res) => {
  try {
    const orderList = await orderService.findAll();
    res.send(orderList);
  } catch (err) {
    console.error('주문 조회 중 오류 발생:', err);
    res.status(500).send('서버 오류');
  }
});

// 주문서 관리(조회) 단건 상세조회 라우터
router.get('/orderDetailList/:code', async (req, res) => {
  try {
    let order_code = req.params.code;
    const orderList = await orderService.findOrderInfo(order_code);
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
  const cp_code = req.query.cpcode;
  try {
    const companyOrderList = await outProdCompanyService.yesOutProdList(cp_code);
    res.send(companyOrderList);
  } catch (err) {
    console.error('주문 조회 중 오류 발생:', err);
    res.status(500).send('서버 오류');
  }
});

// 외주업체 외주가능제품 등록
router.post('/outProdCpInsert', async (req, res) => {
  console.log("넘어온 데이터:", req.body);
  const { cp_code, prod_code } = req.body;

  try {
    const result = await outProdCompanyService.outProdCompanyinsert(prod_code, cp_code);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "등록 실패" });
  }
});
// 외주업체 외주가능제품 삭제
router.delete('/outProdDelete', async (req, res) => {
  const { cp_code, prod_code } = req.body;

  try {
    const result = await outProdCompanyService.deleteProcess(cp_code, prod_code);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "삭제 완료" });
    } else {
      res.json({ success: false, message: "삭제할 데이터가 없습니다." });
    }
  } catch (err) {
    console.error('삭제 오류:', err);
    res.status(500).json({ success: false, message: "삭제 중 오류" });
  }
});

// router.delete('/processDelete/:code', async(req, res) => {
//     try {
//         const processCode = req.params.code;
//         await outProdCompanyService.deleteProcess(processCode);
//         res.send({ success : true, message : "삭제 완료" });
//     } catch (err) {
//         console.log(err);
//         res.status(500).send({ success : false, message : "삭제 중 오료" })
//     }
// })


// 봉제제품 만 출력 (모달) bongJaeProd
router.get('/bongJaeProdModal', async (req, res) => {
  const cp_code = req.query.cpcode;
  try {
    const companyOrderList = await outProdCompanyService.bongJaeProd();
    res.send(companyOrderList);
  } catch (err) {
    console.error('주문 조회 중 오류 발생:', err);
    res.status(500).send('서버 오류');
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
// 주문서 모달창 에서 등록한 제품 삭제
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