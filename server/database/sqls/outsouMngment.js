// 외주발주 건 조건 검색
const selectOutsouOrderByConditions = `
  SELECT
    o.outsou_order_code,
    o.work_process_code,
    o.prod_code,
    p.prod_name,
    o.order_qty,
    o.dead_date,
    o.release_state,
    o.reg_date,
    o.cp_code,
    c.cp_name
  FROM t_outsou_order o
  LEFT JOIN t_product p ON o.prod_code = p.prod_code
  LEFT JOIN t_company c ON o.cp_code = c.cp_code
  WHERE o.dead_date IS NOT NULL
        /**조건절**/
  ORDER BY o.reg_date DESC`;

// 납기일자 미등록 외주발주 건 수 조회
const selectOutsouOrderNullDeadCount = `
  SELECT COUNT(*) FROM t_outsou_order WHERE dead_date IS NULL`;

// 외주발주 납기 미등록 검색
const selectOutsouOrderNotDeadList =`
  SELECT
    o.outsou_order_code,
    o.work_process_code,
    o.prod_code,
    p.prod_name,
    o.order_qty,
    o.dead_date,
    o.release_state,
    o.reg_date,
    c.cp_name
  FROM t_outsou_order o
  LEFT JOIN t_product p ON o.prod_code = p.prod_code
  LEFT JOIN t_company c ON o.cp_code = c.cp_code
  WHERE o.dead_date IS NULL
  ORDER BY o.reg_date DESC`; 

// 납기일자 등록
const updateOutsouDeadDate = `
  UPDATE t_outsou_order
  SET dead_date = ?, cp_code = ?
  WHERE outsou_order_code = ?`;

// 외주물품별 외주처 정보 가져오기
const getCpListByProdCodeSql = `
  SELECT 
    l.cp_code,
    c.cp_name
  FROM t_outsou_order_list l
  LEFT JOIN t_company c ON l.cp_code = c.cp_code
  WHERE l.prod_code = ?`;
 
// 출고자재 등록 프로시저 호출
const callRegOutsouMaterial = `CALL auto_reg_outsou_material(?)`;

// 출고자재 등록 SQL문 집합 ========================================
const getOutsouOrderInfo = `
  SELECT prod_code, work_process_code, order_qty
  FROM t_outsou_order
  WHERE outsou_order_code = ?`;

const getWorkInstCode = `
  SELECT work_inst_code
  FROM t_work_process
  WHERE work_process_code = ?`;

const getBomCode = `
  SELECT bom_code
  FROM t_bom
  WHERE prod_code = ?`;

const getBomMaterials = `
  SELECT item_code, need
  FROM t_bom_detail
  WHERE bom_code = ?`;

const getHoldId = `
  SELECT hold_id
  FROM t_hold
  WHERE work_inst_code = ? AND material_code = ?
  LIMIT 1`;

const getMaxListCode = `
  SELECT IFNULL(MAX(CAST(SUBSTRING(list_code, 4) AS UNSIGNED)), 0)
  AS max_num FROM t_outsou_order_material`;

const insertOutsouOrderMaterial = `
  INSERT INTO t_outsou_order_material (
    list_code, outsou_order_code, hold_id, release_qty, material_code
  ) VALUES (?, ?, ?, ?, ?)`;
// =====================================


module.exports ={
  selectOutsouOrderByConditions,
  selectOutsouOrderNullDeadCount,
  selectOutsouOrderNotDeadList,
  updateOutsouDeadDate,
  getCpListByProdCodeSql,
  callRegOutsouMaterial,
  // 외주자재 납품 등록 SQL문
  getOutsouOrderInfo,
  getWorkInstCode,
  getBomCode,
  getBomMaterials,
  getHoldId,
  getMaxListCode,
  insertOutsouOrderMaterial
};