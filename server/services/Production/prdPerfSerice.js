// C:\2.document\한땀한땀\sewmes_mes\server\services\Production\workInst.js

// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const { query, directQuery,getConnection } = require("../../database/mapper.js");
const { convertObjToAry } = require('../../utils/converts.js');
const sqlList = require("../../database/sqlList.js");


// 프론트엔드 fetchInitialData -> /api/getprdPrefAll 에 매핑될 함수
// 생산 실적 전체 조회를 위한 함수 (초기 데이터 로딩용)
const getInitialWorkperf = async () => {
    try {
        const sql = sqlList.selectworkProcessPref;
        const result = await directQuery(sql, []); // directQuery가 이제 바로 배열을 반환합니다.

        console.log("DB 쿼리 결과 (result - 서비스 레벨):", result); // 디버그를 위해 추가. 이제 이게 배열이어야 합니다.
        // console.log("DB 쿼리 결과 (result.rows):", result.rows); // 이 줄은 이제 필요 없습니다 (undefined 나올 것)

        // ⭐★★ 이 부분을 수정해야 합니다. result.rows -> result ★★⭐
        return { success: true, data: result }; 
    } catch (error) {
        console.error("Error in getInitialWorkperf:", error);
        return { success: false, message: "초기 생산 실적 조회 실패", error: error.message };
    }
};

//조회
const searchWorkperf = async ({ workDate, processCategory, instructionCode, employee }) => {
    let connection;
    try {
        connection = await getConnection();

        // ⭐ selectworkProcessPref 쿼리를 baseSql로 사용 ⭐
        let sql = sqlList.production.selectworkProcessPref; 

        const params = [];

        // 검색 조건에 따라 WHERE 절 동적으로 추가
        // 프론트엔드에서 넘어오는 파라미터 이름을 그대로 사용합니다.
        if (workDate) {
            // 작업일시 검색 (twp.work_start_date 또는 twp.work_end_date 사용)
            // 보통 날짜 범위 검색이므로, 시작일과 종료일 두 개를 받는 것이 좋습니다.
            // 여기서는 임시로 특정 날짜 일치로 가정합니다.
            sql += ` AND twp.work_start_date = ?`; // 또는 BETWEEN ? AND ?
            params.push(workDate);
        }
        if (processCategory) { // 공정분류 (프론트엔드 searchField2)
            sql += ` AND tp.process_name LIKE ?`;
            params.push(`%${processCategory}%`);
        }
        if (instructionCode) { // 지시코드 (프론트엔드 searchField3)
            sql += ` AND tip.work_inst_code LIKE ?`;
            params.push(`%${instructionCode}%`);
        }
        if (employee) { // 담당자 (프론트엔드 searchField4)
            sql += ` AND tem.emp_name LIKE ?`;
            params.push(`%${employee}%`);
        }

        const result = await query(connection, sql, params); // query 함수 사용
        
        return { success: true, data: result.rows };
    } catch (error) {
        console.error("Error in searchWorkperf:", error);
        return { success: false, message: "생산 실적 검색 실패", error: error.message };
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

//상세보기 서비스 추가
const getWorkPerfDetail = async (work_perf_code) => { // 매개변수: work_inst_code
    let connection;
    try {
        connection = await getConnection();
        console.log("Service: SQL Alias fetched:", "getWorkProcessPrefDetail");
        console.log("Service: Full SQL string:", sql); // SQL 쿼리 내용 확인 (가장 중요)
        console.log("Service: Parameters passed to mapper.query:", [work_perf_code]); 

        // work_inst_code를 파라미터로 전달하여 단일 행 조회
        const result = await connection.query(sqlList['getWorkProcessPrefDetail'], [work_perf_code]); // ✨ 여기가 변경되었습니다.

        // 결과가 배열로 오고, 첫 번째 요소가 실제 상세 데이터라고 가정
        if (result.rows && result.rows.length > 0) {
            return { success: true, data: result.rows[0] };
        } else {
            return { success: false, message: "상세 생산 실적을 찾을 수 없습니다.", data: null };
        }
    } catch (error) {
        console.error("Error in getWorkPerfDetail:", error);
        return { success: false, message: "상세 생산 실적 조회 실패", error: error.message };
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports ={
    getInitialWorkperf,
    searchWorkperf,
    getWorkPerfDetail
};