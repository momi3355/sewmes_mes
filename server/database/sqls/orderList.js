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
        a.order_date,
        a.dead_date,
        a.note,
        b.cp_name,
        b.cp_tel,
        b.address
FROM t_order_detail a JOIN t_company b
     ON(a.cp_code = b.cp_code)`

module.exports = {
  orderListCheck,
  orderListCheck2
}