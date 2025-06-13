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

// 주문서 등록
const orderAdd =
`INSERT INTO t_order_detail (
  order_detail_code, 
  order_code,
  prod_code,
  standard,
  qty,
  unit_price,
  total_price,
  state, 
  emp_num, 
  note, 
  order_date, 
  dead_date, 
  cp_code, 
  sel_price
) VALUES (ord1,or1,?,?,?,?,?,?,?,?,?,?,?,?,?)`

// 주문서등록 / 제품모달
const productList =
`SELECT a.prod_code,
        a.prod_name,
        a.category,
        a.color,
        a.size,
        b.standard
FROM t_product a JOIN t_order_detail b
     ON (a.prod_code = b.prod_code)
WHERE a.prod_type = '0k2k'
AND a.use_yn = '0b1b'`


// 년-월-일 날짜포맷
// DATE_FORMAT((Now), '%Y-%m-%d')

module.exports = {
  orderListCheck,
  orderListCheck2,
  orderAdd,
  productList,
}