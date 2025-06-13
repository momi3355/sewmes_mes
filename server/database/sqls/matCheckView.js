// 파일 경로: sqls/matCheckView.js

const checkedMaterialList = `
  SELECT
    tmc.inbound_check_code,
    tm.material_name,
    tm.material_code,
    tmc.pass_qty,
    tmc.check_qty,
    (tmc.check_qty - tmc.pass_qty) AS total_nopass_qty,
    
    DATE_FORMAT(tmc.inbound_date, '%Y-%m-%d') AS inbound_date, -- 수입일자
    DATE_FORMAT(tmc.check_date, '%Y-%m-%d') AS check_date,     -- 검사일자 (입고일자)

    tmo.material_order_code,
    CASE
      WHEN tmc.pass_qty = tmc.check_qty THEN '합격'
      WHEN tmc.pass_qty = 0 THEN '전량 불합격'
      ELSE '부분 합격'
    END AS check_status
  FROM
    t_matinbound_check AS tmc
  JOIN
    t_material_order AS tmo ON tmc.material_order_code = tmo.material_order_code
  JOIN
    t_material AS tm ON tmo.material_code = tm.material_code
  ORDER BY
    tmc.check_date DESC
`;

const checkedMaterialDetail = `
  SELECT
    t_detail.mat_check_detail,
    t_q.test_name,
    t_detail.defect_qty
  FROM
    t_matcheck_detail AS t_detail
  JOIN
    t_quality AS t_q ON t_detail.quality_code = t_q.quality_code
  WHERE
    t_detail.inbound_check_code = ?;
`;

module.exports = {
  checkedMaterialList,
  checkedMaterialDetail
};