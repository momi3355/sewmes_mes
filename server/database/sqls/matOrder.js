// 자재 발주 필요한 목록 조회
const matorderList = `
  SELECT
    material_code,     
    material_name,     
    material_type,      
    stock
  FROM
    v_material_order
`;

const creatematorder = `
  INSERT INTO t_material_order(
    material_order_code,
    cp_code,
    material_order_date,
    deadline,
    total_price)
  VALUES
    (?, ?, NOW(), ?, ?)
`;


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