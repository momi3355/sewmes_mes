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
const selectMaxCode = `
    SELECT MAX(CAST(SUBSTRING(process_code, 3) AS UNSIGNED)) AS maxCode 
    FROM t_process_master`;

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
        /**조건절**/
    ORDER BY CAST(SUBSTRING(process_code, 3) AS UNSIGNED)
`;
module.exports = {
    selectProcessList,
    selectMaxCode,
    processInsert,
    processUpdate,
    processDelete,
    selectProcessByConditions
}
