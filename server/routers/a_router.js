const express = require('express');
const router = express.Router();

const { getOrderList } = require('../services/Sales/orderList.js');
const orderService = require(`../services/Sales/orderList.js`);
const companyService = require(`../services/Sales/companyList.js`);

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

// 로그인


module.exports = router;
