// 제품 조건 검색
const selectProductByConditions = `
    SELECT 
        prod_code,
        prod_name,
        prod_type,
        category,
        use_yn,
        unit,
        color,
        size,
        note
    FROM t_product
    WHERE prod_type = '0k2k'
        /**조건절**/
    ORDER BY CAST(SUBSTRING(prod_code, 2) AS UNSIGNED)`;
// Prod_code를 기준으로 공정흐름 data 가져오기
const getProcessFlow = `
  SELECT 
    f.flow_code,
    f.process_code,
    f.process_seq,
    m.process_name,
    m.detail
  FROM t_process_flow f
  LEFT JOIN t_process_master m ON f.process_code = m.process_code
  WHERE f.prod_code = ?
  ORDER BY f.process_seq ASC`;
const deleteProcessFlowsByProdCode = `
    DELETE FROM t_process_flow
    WHERE prod_code = ?`;
const getNextFlowCode = `
    CALL createcode_proc('t_process_flow', 'flow_code', 'PF', @newCode);
    SELECT @newCode AS code`;
const insertProcessFlow = `
    INSERT INTO t_process_flow (flow_code, process_code, process_seq, prod_code)
    VALUES (?, ?, ?, ?)`;
const updateProcessFlow = `
    UPDATE t_process_flow
    SET process_code = ?, process_seq = ?
    WHERE flow_code = ?`;

// 공정흐름 부가 PK값 숫자만 가져오기
const getNextAttachCode  = `
    CALL createcode_proc('t_process_flow_attach', 'attach_code', 'PFA', @code);
    SELECT @code AS attachCode`;
// 공정흐름 이미지 저장
const insertAttachFile = `
    INSERT INTO t_process_flow_attach (attach_code, flow_code, file_name, origin_file_name)
    VALUES (?, ?, ?, ?)`;
// flow_code 기준 저장된 이미지 가져오기기
const getAttachFile = `
    SELECT file_name, origin_file_name
    FROM t_process_flow_attach
    WHERE flow_code = ?
    ORDER BY CAST(SUBSTRING(attach_code, 4) AS UNSIGNED) DESC
    LIMIT 1`;
// 키워드를 통한 공정 정보 조회
const selectProcessByKeyword  = `
  SELECT
    process_code AS processCode,
    process_name AS processName,
    detail
  FROM t_process_master
  WHERE process_name LIKE CONCAT('%', ?, '%')`;

module.exports = {
    selectProductByConditions,
    getProcessFlow,
    deleteProcessFlowsByProdCode,
    getNextFlowCode,
    insertProcessFlow,
    updateProcessFlow,
    // 공정 흐름 이미지
    getNextAttachCode,
    insertAttachFile,
    getAttachFile,
    selectProcessByKeyword
}
