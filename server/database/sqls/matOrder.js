// 자재 발주 필요한 목록 조회
const matorderList = `
  SELECT material_code
        ,material_name
        ,material_type
        ,stock
  FROM t_material_order
  WHERE (( ? IS NULL OR ? = '') OR material_name LIKE CONCAT('%', ?, '%'))
  AND (( ? IS NULL OR ? = '') OR material_code LIKE CONCAT('%', ?, '%'))
`;

const matorderDetail = `
  SELECT 
`

// 자재 발주 요청
// const selectMaterialList = `
//   SELECT material_code
//         ,material_name
//         ,material_type
//         ,standard
//         ,unit
//         ,unit_price
//         ,safe_stock
//         ,color
//   FROM t_material
// `;

module.exports = {
  matorderList,
}