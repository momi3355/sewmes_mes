const selectProcessList =
    `SELECT process_code
            , process_name
            , detail
            , equi_type
            , need_time
            , process_type
            , use_yn
    FROM t_process_master
    ORDER BY process_code`;

// 공정 코드 자동 생성용
const getNextProcessCode = `
    CALL createcode_proc('t_process_master', 'process_code', 'PM', @newCode);
    SELECT @newCode AS processCode`;

const processInsert = 
    `INSERT INTO t_process_master (
        process_code,
        process_name,
        detail,
        equi_type,
        need_time,
        process_type,
        use_yn)
    VALUES(?, ?, ?, ?, ?, ?, ?)`;

const processUpdate = `
    UPDATE t_process_master
    SET 
        process_name = ?,
        detail = ?,
        equi_type = ?,
        need_time = ?,
        process_type = ?,
        use_yn = ?
    WHERE process_code = ?`;

const processDelete =`
    DELETE FROM t_process_master
    WHERE process_code = ?`;

const selectProcessByConditions = `
    SELECT 
        process_code,
        process_name,
        detail,
        equi_type,
        need_time,
        process_type,
        use_yn
    FROM t_process_master
    WHERE 1 = 1
        /**조건절**/`;
module.exports = {
    selectProcessList,
    getNextProcessCode,
    processInsert,
    processUpdate,
    processDelete,
    selectProcessByConditions
}
