const selectBaseProductList = 
`SELECT prod_code
      ,prod_name
      ,prod_type
      ,category
      ,use_yn
      ,unit
      ,color
      ,size
      ,note
  FROM t_product
  WHERE 1=1
`;

const selectBaseProductListByCode = 
`SELECT prod_code
      ,prod_name
      ,prod_type
      ,category
      ,use_yn
      ,unit
      ,color
      ,size
      ,note
  FROM t_product
  WHERE prod_code = ?`;

const insertBaseProduct = 
`INSERT INTO t_product
  SET ?`;

const updateBaseProduct = 
`UPDATE t_product
  SET ?
  WHERE prod_code = ?`;

module.exports = {
  selectBaseProductList,
  selectBaseProductListByCode,
  insertBaseProduct,
  updateBaseProduct
}