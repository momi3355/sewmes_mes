// 조회
const orderListCheck = 
`SELECT order_code,
        total_price,
        order_state,
        total_qty
FROM t_order`

// 주문서 조회 그룹바이로 제품당 조회페이지 행 추가 개선
const orderListCheck2 = 
`SELECT 
  a.order_code,
  a.total_qty,
  a.order_state,
  DATE_FORMAT(MAX(b.order_date), '%Y-%m-%d') AS order_date,
  DATE_FORMAT(MAX(b.dead_date), '%Y-%m-%d') AS dead_date,
  c.cp_name
FROM t_order a
JOIN t_order_detail b ON a.order_code = b.order_code
JOIN t_company c ON b.cp_code = c.cp_code
GROUP BY a.order_code, a.total_qty, a.order_state, c.cp_name`

// 주문서 관리(조회) 페이지 주문목록 및 주문상세정보 같이 출력
const orderListCheck3 =
`SELECT 
  prod_code,
  prod_name,
  cp_name,
  total_qty,
  order_date,
  dead_date,
  order_state,
  order_detail_state,
  cp_tel,
  address,
  color,
  size,
  standard,
  note,
  emp_num,
  emp_name,
  emp_tel,
  unit_price,
  sel_price
FROM v_order_detail_list
WHERE order_code = ?`

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
  order_state,
  total_qty
) 
VALUES (?, ?, ?, ?)`

const getNextOrderCode =
`SELECT order_code FROM t_order ORDER BY order_code DESC LIMIT 1`;

const getNextOrderDetailCode = 
`SELECT order_detail_code FROM t_order_detail ORDER BY order_detail_code DESC LIMIT 1`;

// 주문서 조회 필터 검색
const filterSearch =
`SELECT
    od.order_code,
    c.cp_name,
    od.total_qty,
    od.order_date,
    od.dead_date,
    od.order_state
FROM
    t_order_detail od
JOIN
    t_company c ON od.cp_code = c.cp_code
WHERE
    (:cpName IS NULL OR c.cp_name LIKE CONCAT('%', :cpName, '%'))
  AND (:orderDate IS NULL OR od.order_date = :orderDate)
  AND (:deadDate IS NULL OR od.dead_date = :deadDate)
ORDER BY
    od.order_date DESC`;

// 년-월-일 날짜포맷
// DATE_FORMAT((Now), '%Y-%m-%d')

module.exports = {
  orderListCheck,
  orderListCheck2,
  orderAdd,
  productList,
  orderDetailAdd,
  getNextOrderCode,
  getNextOrderDetailCode,
  orderListCheck3,
  filterSearch
}