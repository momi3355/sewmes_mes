// 조회
const orderListCheck = 
`SELECT order_code,
        total_price,
        state,
        total_qty
FROM t_order`

const orderListCheck2 = 
`SELECT a.order_code,
        a.qty,
        a.state,
        DATE_FORMAT(a.order_date, '%Y-%m-%d') AS order_date,
        DATE_FORMAT(a.dead_date, '%Y-%m-%d') AS dead_date, 
        a.note,
        b.cp_name,
        b.cp_tel,
        b.address
FROM t_order_detail a JOIN t_company b
     ON(a.cp_code = b.cp_code)`

// 완제품출력 모달 (주문서등록)
const productList =
`SELECT prod_code,
        prod_name,
        category,
        color,
        size
FROM t_product
WHERE prod_type = '0k2k'
AND use_yn = '0b1b'`

// 반제품출력 모달 (외주업체 외주가능제품)
const productList2 =
`SELECT prod_code,
        prod_name,
        category,
        color,
        size
FROM t_product
WHERE prod_type = '0k1k'
AND use_yn = '0b1b'`

const orderDetailAdd = `
INSERT INTO t_order_detail (
  order_detail_code, 
  order_code, 
  prod_code, 
  standard, 
  total_qty, 
  unit_price, 
  total_price,
  emp_num,
  note,
  order_date, 
  dead_date,
  cp_code,
  sel_price
) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;
// 주문서 등록
const orderAdd =
`INSERT INTO t_order(
  order_code,
  total_price,
  state,
  total_qty
) 
VALUES (?, ?, ?, ?)`

const getNextOrderCode =
`SELECT order_code FROM t_order ORDER BY order_code DESC LIMIT 1`;

const getNextOrderDetailCode = 
`SELECT order_detail_code FROM t_order_detail ORDER BY order_detail_code DESC LIMIT 1`;

// 년-월-일 날짜포맷
// DATE_FORMAT((Now), '%Y-%m-%d')

module.exports = {
  orderListCheck,
  orderListCheck2,
  orderAdd,
  productList,
  orderDetailAdd,
  getNextOrderCode,
  getNextOrderDetailCode
}