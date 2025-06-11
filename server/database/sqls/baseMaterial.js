const selectBaseMaterialList = 
`SELECT material_code
     ,material_name
     ,material_type
     ,standard
     ,unit
     ,unit_price
     ,safe_stock
     ,color
     ,use_yn
  FROM t_material
 WHERE 1=1
 `;

const insertBaseMaterial = 
`INSERT INTO t_material
  SET ?`;

const updateBaseMaterial = 
`UPDATE t_material
  SET ?
  WHERE material_code = ?`;

module.exports = {
  selectBaseMaterialList,
  insertBaseMaterial,
  updateBaseMaterial
}