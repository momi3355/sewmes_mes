const selectPrdReceive = 
`SELECT prod_code,
       prod_name,
       total_stock_qty,
       standard,
       qty,
       dead_date,
       cp_code,
       cp_name,
       cls,
       address,
       order_detail_code
FROM v_product_receive
WHERE 1 = 1
`;

const selectReleaseLotList = 
`SELECT lot
      ,inbound_qty
      ,unit
      ,inbound_date
      ,stock_qty
      ,release_qty
FROM t_prod_receive
WHERE stock_qty > 0
AND prod_code = ?
ORDER BY inbound_date DESC`;

const selectReleaseList = 
`SELECT prd.lot
      ,p.category
      ,p.prod_name
      ,od.standard
      ,prd.release_qty
      ,p.unit
      ,c.cp_name
      ,pr.release_date
      ,e.emp_name
FROM t_product_release_detail prd
  JOIN t_product_release pr ON pr.release_code = prd.release_code
  JOIN t_order_detail od ON od.order_detail_code = pr.order_detail_code
  JOIN t_product p ON p.prod_code = od.prod_code
  JOIN t_company c ON c.cp_code = pr.cp_code
  JOIN t_employees e ON e.emp_num = pr.emp_num
WHERE 1 = 1
`;

const insertReleaseDataWithDetails = 
`CALL product_release_process(?, ?, ?)`;

module.exports = {
  selectPrdReceive,
  selectReleaseLotList,
  selectReleaseList,
  insertReleaseDataWithDetails
};