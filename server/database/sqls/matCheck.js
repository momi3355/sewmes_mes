// 자재 수입검사 필요한 목록 조회
const matcheckList = `
  SELECT
    ord.material_order_code,
    mat.material_name,
    mat.material_type,
    ord.order_qty AS inbound_qty,
    com.cp_name,
    ord.material_order_date AS inbound_date
  FROM
    t_material_order AS ord INNER JOIN t_material AS mat 
                            ON ord.material_code = mat.material_code
  INNER JOIN
    t_company AS com ON ord.cp_code = com.cp_code 
`;
// WHERE
//     ord.material_order_code NOT IN (
//     SELECT material_order_code FROM t_matinbound_check)

module.exports = {
  matcheckList,
}