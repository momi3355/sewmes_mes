// C:\2.document\한땀한땀\sewmes_mes\server\services\Production\workInst.js

// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const { query, directQuery,getConnection } = require("../../database/mapper.js");
const { convertObjToAry } = require('../../utils/converts.js');
const sqlList = require("../../database/sqlList.js");

// 작업지시코드 생성 함수 
const generateWorkInstCode = async(conn)=>{
    const prefix='I';
    const rows = await conn.query(sqlList['selectMaxWorkInstCode'], []);
    let maxCode= rows && rows.length > 0 ? rows[0].max_code : null;
    let sequence = 1;
    if (maxCode && maxCode.startsWith(prefix)) {
        const lastSequenceStr = maxCode.substring(prefix.length);
        const parsedSequence = parseInt(lastSequenceStr);
        if (!isNaN(parsedSequence)) {
            sequence = parsedSequence + 1;
        }
    }
    const sequenceStr = String(sequence).padStart(3, '0');
    return `${prefix}${sequenceStr}`;
}




//생산계획목록 
const getProductionPlans=async()=>{
    try {
        const rows = await query('selectProdPlansList', []);
        console.log('Extracted rows (after fix):', rows);
        return rows;
    } catch (error) {
        console.error('생산계획목록 중 문제 발생', error);
        throw error;
    }
};

//작업지시조회 (여기 수정)
const getWorkInstAll= async(searchParams = {}) => { // searchParams를 인자로 받도록 수정
    try{
        let sql = sqlList['allworkInstList']; // sqlList에서 기본 SQL 쿼리 가져옴
        //sql += ` WHERE 1=1 `; // WHERE 절 시작

        const queryParams = [];

        // 프론트엔드에서 넘어온 검색 파라미터들을 구조 분해 할당
        // 이 이름들은 프론트엔드에서 axios.get('/api/allworkInst', { params: validParams })로 보낸 파라미터 이름과 일치해야 합니다.
        const {  prodName, instState, empNum } = searchParams;

       
        // 2. 제품명 (prodName) 검색 조건 추가 (tp.prod_name 컬럼)
        if (prodName) {
            sql += ` AND tp.prod_name LIKE ?`;
            queryParams.push(`%${prodName}%`); // %를 사용하여 부분 일치 검색
        }

        // 3. 지시상태 (instState) 검색 조건 추가 (twi.inst_state 컬럼)
        if (instState) {
            sql += ` AND twi.inst_state = ?`;
            queryParams.push(instState);
        }

        // 4. 담당자 (empNum) 검색 조건 추가 (twi.emp_num 컬럼)
        if (empNum) {
            sql += ` AND twi.emp_num = ?`;
            queryParams.push(empNum);
        }

        //sql += ` ORDER BY twi.inst_reg_date DESC`; // 최신 작업지시가 먼저 오도록 정렬 (선택 사항)

        console.log('백엔드: 최종 SQL 쿼리:', sql); // 최종 SQL 쿼리 로깅
        console.log('백엔드: SQL 쿼리 파라미터:', queryParams);

        // **여기서 중요한 변경: query 함수 대신 directQuery 함수 사용**
        const rows = await directQuery(sql, queryParams);
        console.log('백엔드: DB에서 조회된 레코드 수:', rows.length); // DB에서 실제로 가져온 레코드 개수
        console.log('백엔드: DB에서 조회된 데이터 예시 (첫 3개):', rows.slice(0, 4)); // 데이터의 앞부분 예시
        return rows;
    }catch(error){
        console.error('백엔드: 작업지시목록 조회 중 문제 발생', error);
        throw error;
    }
}

// 작업지시서 저장 (수정된 핵심 로직 포함)
const saveWorkInstructions= async (workInstructions) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const savedResults = [];

        for (const instruction of workInstructions) {
            // 1. 모든 파라미터 추출 및 유효성 검사 (변경 없음)
            const p_work_inst_code_in = instruction.work_inst_code && instruction.work_inst_code.trim() !== '' ? instruction.work_inst_code.trim() : null;
            const p_prod_plan_code = instruction.prod_plan_code && instruction.prod_plan_code.trim() !== '' ? instruction.prod_plan_code.trim() : null;
            const p_prod_code = instruction.prod_code && instruction.prod_code.trim() !== '' ? instruction.prod_code.trim() : null;
            const p_inst_qty = parseFloat(instruction.inst_qty) || 0;
            const p_dead_date = instruction.dead_date ? new Date(instruction.dead_date) : null;
            const p_inst_state = instruction.inst_state && instruction.inst_state.trim() !== '' ? instruction.inst_state.trim() : '0s1s';
            const p_emp_num = instruction.emp_num && instruction.emp_num.trim() !== '' ? instruction.emp_num.trim() : null;
            const p_inst_date = instruction.inst_date ? new Date(instruction.inst_date) : null;
            const p_inst_reg_date = instruction.inst_reg_date ? new Date(instruction.inst_reg_date) : new Date();

            if (!p_prod_code || p_inst_qty <= 0) {
                throw new Error(`[작업지시 ${instruction.NO || ''}] 필수 필드(제품코드, 지시수량)가 누락되었거나 유효하지 않습니다.`);
            }

            let currentWorkInstCode;
            let current_bom_code = null;
            let isNewInstruction = false;

            // 3. 기존 작업지시 코드 존재 여부 확인 및 처리 
            if (p_work_inst_code_in) {
                const checkExistsResult = await conn.query(sqlList['checkWorkInstCode'], [p_work_inst_code_in]);
                const exists = checkExistsResult && checkExistsResult.length > 0 && checkExistsResult[0].count > 0;

                if (exists) { // 기존 작업지시인 경우 UPDATE
                    console.log(`[saveWorkInstructions] Updating existing work instruction: ${p_work_inst_code_in}`);
                    currentWorkInstCode = p_work_inst_code_in;

                    // 4. BOM_CODE 조회 로직 
                    const bomRows = await conn.query(sqlList['selectBomByProdCode'], [p_prod_code]);
                    if (bomRows && bomRows.length > 0) {
                        current_bom_code = bomRows[0].bom_code;
                    } else {
                        throw new Error(`제품코드 '${p_prod_code}'에 해당하는 BOM 정보를 찾을 수 없어 작업지시를 저장할 수 없습니다.`);
                    }

                    const UpdateValues = [
                        p_prod_plan_code, p_prod_code, current_bom_code, p_inst_qty, p_dead_date,
                        p_inst_state, p_emp_num, p_inst_date, p_inst_reg_date, currentWorkInstCode
                    ];
                    const updateResult = await conn.query(sqlList['updateWorkInstList'], UpdateValues);
                    console.log(`작업지시 ${currentWorkInstCode} 업데이트 성공. Affected rows: ${updateResult.affectedRows}`);
                    
                } else { // 코드값은 넘어왔으나 DB에 없는 경우: 신규 코드 생성 및 INSERT
                    console.warn(`[saveWorkInstructions] Existing work_inst_code '${p_work_inst_code_in}' not found in DB. Treating as new.`);
                    currentWorkInstCode = await generateWorkInstCode(conn);
                    isNewInstruction = true;
                }
            } else { // work_inst_code가 넘어오지 않았거나 빈 문자열인 경우: 신규 INSERT
                currentWorkInstCode = await generateWorkInstCode(conn);
                isNewInstruction = true;
            }

            // 4. 신규 작업지시인 경우만 t_work_inst 테이블에 INSERT 실행 
            if (isNewInstruction) {
                const bomRows = await conn.query(sqlList['selectBomByProdCode'], [p_prod_code]);
                if (bomRows && bomRows.length > 0) {
                    current_bom_code = bomRows[0].bom_code;
                } else {
                    throw new Error(`제품코드 '${p_prod_code}'에 해당하는 BOM 정보를 찾을 수 없어 작업지시를 저장할 수 없습니다.`);
                }

                const insertValues = [
                    currentWorkInstCode, p_prod_plan_code, p_prod_code, current_bom_code,
                    p_inst_qty, p_inst_state, p_emp_num, p_inst_date, p_inst_reg_date
                ];
                console.log('insertWorkInstList parameters:', insertValues);
                const insertResult = await conn.query(sqlList['insertWorkInstList'], insertValues);
                console.log(`작업지시 ${currentWorkInstCode} 신규 삽입 성공. Insert ID: ${insertResult.insertId}`);
            }

            //  5. 자재 홀드 처리  
            const bomDetails = await conn.query(sqlList['selectBomDetailsByBomCode'], [current_bom_code]);
            const existingHolds = await conn.query(sqlList['selectHoldsByWorkInstCode'], [currentWorkInstCode]);
            const existingHoldsMap = new Map();
            for (const hold of existingHolds) {
                existingHoldsMap.set(hold.material_code, hold);
            }

            const materialCodesToKeep = new Set(); 

            if (bomDetails && bomDetails.length > 0) {
                for (const detail of bomDetails) {
                    const material_code = detail.item_code;
                    const calculatedHoldQty = detail.need * p_inst_qty; 
                    
                    materialCodesToKeep.add(material_code);

                    if (existingHoldsMap.has(material_code)) {
                        // 5-4-1. 기존 홀드 데이터가 있는 경우: UPDATE
                        const existingHold = existingHoldsMap.get(material_code);
                        if (existingHold.hold_qty !== calculatedHoldQty) {
                            await conn.query(sqlList['updateHold'], [calculatedHoldQty, existingHold.hold_id, material_code]);
                            console.log(`홀드 ${existingHold.hold_id} (자재: ${material_code}) 수량 업데이트: ${calculatedHoldQty}`);
                        } else {
                            console.log(`홀드 ${existingHold.hold_id} (자재: ${material_code}) 수량 변동 없음.`);
                        }
                    } else {
                        // 5-4-2. 기존 홀드 데이터가 없는 경우: INSERT (DB 프로시저를 통해 홀드 ID 생성)
                        //  스토어드 프로시저 호출로 ID 얻기 
                        const holdIdResultRows = await conn.query(sqlList['callCreateCodeProcForHoldId'], []);
                        const newHoldId = holdIdResultRows && holdIdResultRows.length > 1 && holdIdResultRows[1].length > 0
                            ? holdIdResultRows[1][0].new_hold_id : null;

                        if (!newHoldId) {
                            throw new Error('새로운 홀드 ID를 생성하지 못했습니다. (DB 프로시저 오류 또는 타임아웃)');
                        }

                        await conn.query(sqlList['insertSingleHold'], [newHoldId, material_code, calculatedHoldQty, currentWorkInstCode]);
                        console.log(`새 홀드 ${newHoldId} (자재: ${material_code}) 삽입: ${calculatedHoldQty}`);
                    }
                }
            } else {
                console.warn(`BOM 코드 '${current_bom_code}'에 대한 상세 내역(자재 목록)을 찾을 수 없습니다. 자재 홀드 처리 생략.`);
            }

            // 5-5. 더 이상 필요 없는 기존 홀드 데이터 삭제 (DELETE)
            for (const existingHold of existingHolds) {
                if (!materialCodesToKeep.has(existingHold.material_code)) {
                    await conn.query(sqlList['deleteHoldById'], [existingHold.hold_id]);
                    console.log(`더 이상 필요 없는 홀드 ${existingHold.hold_id} (자재: ${existingHold.material_code}) 삭제.`);
                }
            }

            // 6. 응답을 위한 결과 저장 (변경 없음)
            savedResults.push({
                ...instruction,
                work_inst_code: currentWorkInstCode,
                emp_num: p_emp_num,
                inst_reg_date: p_inst_reg_date
            });
        }

        // 모든 작업 성공 시 커밋 (변경 없음)
        await conn.commit();
        console.log('모든 작업지시 및 관련 자재 홀드 성공적으로 커밋됨.');
        return { success: true, message: '모든 작업지시가 성공적으로 저장되었습니다.', data: savedResults };

    } catch (error) {
        // 오류 발생 시 롤백 (변경 없음)
        if (conn) {
            await conn.rollback();
        }
        console.error('작업지시 저장 중 오류 발생 및 롤백됨. 오류 상세:', error);
        throw new Error('작업지시 저장 중 오류가 발생했습니다: ' + error.message);
    } finally {
        // 연결 해제 (변경 없음)
        if (conn) {
            conn.release();
        }
    }
};

// 작업지시서 삭제
const deleteWorkInstructions = async (workInstCodes) => {
    let conn; // 데이터베이스 연결 변수
    try {
        conn = await getConnection(); // 연결 획득
        await conn.beginTransaction(); // 트랜잭션 시작

        // 1. 입력 유효성 검사
        if (!workInstCodes || !Array.isArray(workInstCodes) || workInstCodes.length === 0) {
            throw new Error('삭제할 작업지시 코드가 제공되지 않았습니다.');
        }

        const deletedCount = { workInstructions: 0, materialHolds: 0 }; // 삭제된 개수 추적

        // 각 작업지시 코드에 대해 반복 처리
        for (const code of workInstCodes) {
            // 2. 작업지시 상태 재확인 (백엔드에서 다시 검증)
            
            const checkStatusResult = await conn.query(sqlList['selectWorkInstState'], [code]);
            if (!checkStatusResult || checkStatusResult.length === 0 || checkStatusResult[0].inst_state !== '0s1s') {
                // '생산 전' 상태가 아니면 롤백하고 오류 메시지 반환
                await conn.rollback();
                throw new Error(`작업지시코드 '${code}'는 '생산 전' 상태가 아니므로 삭제할 수 없습니다.`);
            }

            // 3. 해당 작업지시와 관련된 자재 홀드 먼저 삭제
            
            const deleteHoldsResult = await conn.query(sqlList['deleteHoldsByWorkInstCode'], [code]);
            deletedCount.materialHolds += deleteHoldsResult.affectedRows;
            console.log(`작업지시 ${code} 관련 자재 홀드 ${deleteHoldsResult.affectedRows}개 삭제.`);

            // 4. 작업지시 삭제
            
            const deleteInstResult = await conn.query(sqlList['deleteWorkInst'], [code]);
            if (deleteInstResult.affectedRows === 0) {
                console.warn(`작업지시코드 '${code}'를 찾을 수 없거나 이미 삭제되었습니다.`);
            } else {
                deletedCount.workInstructions += deleteInstResult.affectedRows;
                console.log(`작업지시 ${code} 삭제 성공.`);
            }
        }

        await conn.commit(); // 모든 작업 성공 시 커밋
        console.log(`총 ${deletedCount.workInstructions}개의 작업지시와 ${deletedCount.materialHolds}개의 자재 홀드 삭제 완료.`);
        return { success: true, message: '선택된 작업지시가 성공적으로 삭제되었습니다.', data: deletedCount };

    } catch (error) {
        // 오류 발생 시 롤백
        if (conn) {
            await conn.rollback();
        }
        console.error('작업지시 삭제 중 오류 발생 및 롤백됨. 오류 상세:', error);
        throw new Error('작업지시 삭제 중 오류가 발생했습니다: ' + error.message);
    } finally {
        // 연결 해제
        if (conn) {
            conn.release();
        }
    }
};


module.exports ={
    getProductionPlans,
    saveWorkInstructions,
    getWorkInstAll,
    generateWorkInstCode,
    deleteWorkInstructions,
};