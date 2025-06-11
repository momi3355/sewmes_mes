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
// `INSERT INTO t_order_detail (
//   order_detail_code, 
//   order_code, 
//   prod_code,
//   standard, 
//   qty, 
//   unit_price,
//   total_price, 
//   img, 
//   state, 
//   emp_num, 
//   note, 
//   order_date, 
//   dead_date, 
//   cp_code, 
//   sel_price
// ) VALUES (?,?,?,?,?,?,?,?,?,?)`

// DATE_FORMAT((Now), '%Y-%m-%d')

module.exports = {
  orderListCheck,
  orderListCheck2
}