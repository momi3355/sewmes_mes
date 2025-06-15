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

const insertBomDataWithDetails = 
`CALL insert_bom_data_with_details(?, ?, ?)`;

module.exports = {
  selectBomItemList,
  insertBomDataWithDetails,
}