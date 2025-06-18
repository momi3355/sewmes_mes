const selectBomItemList = 
`SELECT item_code
      ,item_name
      ,item_type
      ,unit
      ,item_info
      ,use_yn
FROM v_bom_item
WHERE 1 = 1
`;

const selectBomDetailList =
`SELECT b.bom_code AS bom_code
	  ,b.prod_code AS prod_code
      ,bd.bom_detail_code AS bom_detail_code
      ,bd.item_code AS item_code
      ,m.material_name AS item_name
      ,m.material_type AS item_type
      ,m.unit AS unit
      ,bd.need AS need
FROM t_bom b
  JOIN t_bom_detail bd ON b.bom_code = bd.bom_code
  JOIN t_material m ON bd.item_code = m.material_code
WHERE b.prod_code = ?
  AND bd.item_type = '0w1w'
UNION ALL
SELECT b.bom_code AS bom_code
	  ,b.prod_code AS prod_code
      ,bd.bom_detail_code AS bom_detail_code
      ,bd.item_code AS item_code
      ,p.prod_name AS item_name
      ,p.prod_type AS item_type
      ,p.unit AS unit
      ,bd.need AS need
FROM t_bom b
  JOIN t_bom_detail bd ON b.bom_code = bd.bom_code
  JOIN t_product p ON bd.item_code = p.prod_code
WHERE b.prod_code = ?
  AND bd.item_type = '0w2w'`;

const insertBomDataWithDetails = 
`CALL insert_bom_data_with_details(?, ?, ?)`;

const upsertBomDetails =
`CALL upsert_bom_detail(?, ?)`;

module.exports = {
  selectBomItemList,
  selectBomDetailList,
  insertBomDataWithDetails,
  upsertBomDetails,
}