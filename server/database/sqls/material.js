const selectMaterialList = `
  SELECT material_code
        ,material_name
        ,material_type
        ,standard
        ,unit
        ,unit_price
        ,safe_stock
        ,color
  FROM t_material
`;

module.exports = {
  selectMaterialList
}