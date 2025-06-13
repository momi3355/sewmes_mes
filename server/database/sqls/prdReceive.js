const selectPrdReceive = 
`SELECT prod_code,
       lots,
       prod_name,
       total_stock_qty,
       standard,
       qty,
       dead_date,
       cp_code,
       cp_name,
       cls,
       address
FROM v_product_receive`;

module.exports = {
  selectPrdReceive,
};