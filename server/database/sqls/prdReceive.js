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

const insertReleaseDataWithDetails = 
`CALL product_release_process(?, ?, ?)`;

module.exports = {
  selectPrdReceive,
  selectReleaseLotList,
  insertReleaseDataWithDetails
};