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

const insertMaterial = `
  INSERT INTO t_material
  SET ?
`;

const updateMaterial = `
  UPDATE t_material
  SET ?
  WHERE material_code = ?
`;

module.exports = {
  selectMaterialList,
  insertMaterial,
  updateMaterial
}