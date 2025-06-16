// 외주입고 조건 검색 ========================
const selectOutsouInboundByConditions = `
  SELECT
    r.outsou_inbound_code,
    r.outsou_order_code,
    r.prod_code,
    r.prod_name,
    r.reg_date,
    r.inbound_date,
    r.cp_code,
    r.cp_name,
    r.inbound_qty,
    r.defect_qty,
    r.pass_qty,
    r.emp_num,
    r.emp_name
  FROM v_outsou_receive_summary r
  WHERE 1 = 1
    /**조건절**/
  ORDER BY r.reg_date DESC`;
// 외주입고검사 모달 품질 검사 리스트 불러오기
const getSemiProductQualityTest = `
  SELECT quality_code, test_name, test_method
  FROM t_quality
  WHERE test_target = '1b3b' AND use_yn = '0b1b'`;
// 외주입고 기존 검사이력 정보 가져오기
const getSemiProductQualityTestHistory = `
  SELECT 
    q.quality_code,
    q.test_name,
    q.test_method,
    d.defect_qty
  FROM t_outsou_defect_detail d
  JOIN t_quality q ON d.quality_code = q.quality_code
  WHERE d.outsou_inbound_code = ?`;

// =========================================

// 외주입고불량내역 조건 검색 ========================
const selectInboundDefectByConditions = `
  SELECT
    od.defect_history_code,
    oi.outsou_inbound_code,
    p.prod_name,
    oi.reg_date,
    oi.inbound_date,
    c.cp_name,
    od.defect_qty,
    e.emp_name
  FROM t_outsou_defect_detail od
  LEFT JOIN t_outsou_receive oi ON od.outsou_inbound_code = oi.outsou_inbound_code
  LEFT JOIN t_product p ON oi.prod_code = p.prod_code
  LEFT JOIN t_company c ON oi.cp_code = c.cp_code
  LEFT JOIN t_employees e ON oi.emp_num = e.emp_num
  WHERE 1 = 1
    /**조건절**/
  ORDER BY CAST(SUBSTRING(od.defect_history_code, 4) AS UNSIGNED) DESC`;
// 외주입고 검사 완료 시 작동 프로시저
const callSaveOutsouInboundInspection =`
CALL proc_save_outsou_inbound_inspection(?, ?, ?, ?)`;

module.exports ={
  selectOutsouInboundByConditions,
  getSemiProductQualityTest,
  getSemiProductQualityTestHistory,
  selectInboundDefectByConditions,
  callSaveOutsouInboundInspection
};