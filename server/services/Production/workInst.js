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

// 작업지시서 저장 (재고 차감 및 상태 업데이트 제외 버전)
const saveWorkInstructions = async (workInstructions) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.beginTransaction(); // 트랜잭션 시작

        const savedResults = [];

        for (const instruction of workInstructions) {
            // 1. 모든 파라미터 추출 및 유효성 검사 (변경 없음)
            const p_work_inst_code_in = instruction.work_inst_code && instruction.work_inst_code.trim() !== '' ? instruction.work_inst_code.trim() : null;
            const p_prod_plan_code = instruction.prod_plan_code && instruction.prod_plan_code.trim() !== '' ? instruction.prod_plan_code.trim() : null;
            const p_prod_code = instruction.prod_code && instruction.prod_code.trim() !== '' ? instruction.prod_code.trim() : null;
            const p_inst_qty = parseFloat(instruction.inst_qty) || 0;

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

                    // 4. BOM_CODE 조회 (업데이트 시에도 최신 BOM 코드를 적용)
                    const bomRows = await conn.query(sqlList['selectBomByProdCode'], [p_prod_code]);
                    if (bomRows && bomRows.length > 0) {
                        current_bom_code = bomRows[0].bom_code;
                    } else {
                        throw new Error(`제품코드 '${p_prod_code}'에 해당하는 BOM 정보를 찾을 수 없어 작업지시를 저장할 수 없습니다.`);
                    }

                    const updateValues = [
                        p_prod_plan_code, p_prod_code, current_bom_code, p_inst_qty,
                        p_inst_state, p_emp_num, p_inst_date, p_inst_date, p_inst_reg_date, p_inst_reg_date, currentWorkInstCode
                    ];
                    const updateResult = await conn.query(sqlList['updateWorkInstList'], updateValues);
                    console.log(`작업지시 ${currentWorkInstCode} 업데이트 성공. Affected rows: ${updateResult.affectedRows}`);

                    // 작업공정 업데이트 (필요시 활성화) - 이 부분은 기존 로직 유지
                    const updateWorkProcessValues = [
                        p_inst_qty,
                        currentWorkInstCode
                    ];
                    // Make sure 'updateWorkProcessByWorkInstCode' is defined in sqlList
                    await conn.query(sqlList['updateWorkProcessByWorkInstCode'], updateWorkProcessValues);
                    console.log(`작업지시 ${currentWorkInstCode} 관련 작업공정 데이터 업데이트 완료.`);

                } else { // 코드값은 넘어왔으나 DB에 없는 경우: 신규 코드 생성 및 INSERT
                    console.warn(`[saveWorkInstructions] Existing work_inst_code '${p_work_inst_code_in}' not found in DB. Treating as new.`);
                    currentWorkInstCode = await generateWorkInstCode(conn);
                    isNewInstruction = true;
                }
            } else { // work_inst_code가 넘어오지 않았거나 빈 문자열인 경우: 신규 INSERT
                currentWorkInstCode = await generateWorkInstCode(conn);
                isNewInstruction = true;
            }

            // 4. 신규 작업지시인 경우에만 t_work_inst 테이블에 INSERT 실행
            if (isNewInstruction) {
                const bomRows = await conn.query(sqlList['selectBomByProdCode'], [p_prod_code]);
                if (bomRows && bomRows.length > 0) {
                    current_bom_code = bomRows[0].bom_code;
                } else {
                    throw new Error(`제품코드 '${p_prod_code}'에 해당하는 BOM 정보를 찾을 수 없어 작업지시를 저장할 수 없습니다.`);
                }

                // Check parameter count for insertWorkInstList. It should be 11.
                const insertValues = [
                    currentWorkInstCode, p_prod_plan_code, p_prod_code, current_bom_code,
                    p_inst_qty, p_inst_state, p_emp_num, p_inst_date, p_inst_date, p_inst_date, p_inst_reg_date
                ];
                console.log('insertWorkInstList parameters:', insertValues);
                const insertResult = await conn.query(sqlList['insertWorkInstList'], insertValues);
                console.log(`작업지시 ${currentWorkInstCode} 신규 삽입 성공. Insert ID: ${insertResult.insertId}`);

                // 작업공정 insert 프로시저 호출
                let procMsg = await conn.query(sqlList['workProcessInsertProced'], [currentWorkInstCode]).catch(err => {
                    console.error("workProcessInsertProced 호출 오류:", err);
                    throw new Error("작업공정 생성 프로시저 호출 중 오류 발생.");
                });
                procMsg = procMsg[1] && procMsg[1][0] ? procMsg[1][0].msg : '메시지 없음';
                console.log(`작업공정 생성 프로시저 메시지: ${procMsg}`);
            }

            // --- 5. 자재 홀드 처리 ---
            // ❗ 변경: 기존 홀드를 먼저 모두 삭제하고, 새로운 지시 수량에 맞춰 재할당하는 전략을 사용합니다.
            // 이렇게 하면 이전 FAB LOT 할당 정보도 초기화되고 새로 할당됩니다.
            await conn.query(sqlList['deleteHoldsByWorkInstCode'], [currentWorkInstCode]);
            console.log(`기존 작업지시 ${currentWorkInstCode} 에 대한 모든 홀드 데이터 삭제 완료.`);

            const bomDetails = await conn.query(sqlList['selectBomDetailsByBomCode'], [current_bom_code]);

            if (bomDetails && bomDetails.length > 0) {
                for (const detail of bomDetails) {
                    const material_code = detail.item_code;
                    const requiredQty = detail.need * p_inst_qty; // 이 자재에 필요한 총 수량

                    // ⭐ FAB 자재인 경우와 아닌 경우를 분리 ⭐
                    if (material_code.startsWith('FAB')) {
                        // FAB 자재 처리: 재고에서 LOT을 할당 (FIFO 방식)
                        console.log(`[FAB 자재 홀드] 작업지시: ${currentWorkInstCode}, 자재: ${material_code}, 필요 수량: ${requiredQty}`);

                        let allocatedQty = 0;
                        let remainingQtyToAllocate = requiredQty;


                        const availableLots = await conn.query(sqlList['selectInboundMaterialsForFab'], [material_code]);

                        if (!availableLots || availableLots.length === 0) {
                            // 실제 재고가 없어도 홀드를 생성하지 못할 수 있으므로, 재고 부족 메시지는 유효합니다.
                            throw new Error(`FAB 자재 '${material_code}'에 대한 유효한 재고가 부족합니다. (재고 없음)`);
                        }

                        for (const lot of availableLots) {
                            if (remainingQtyToAllocate <= 0) break; // 필요한 수량을 모두 할당했으면 종료

                            const lotAvailableQty = lot.inbound_qty; // LOT에 현재 남아있는 사용 가능 수량
                            const qtyToAllocateFromLot = Math.min(remainingQtyToAllocate, lotAvailableQty);

                            if (qtyToAllocateFromLot > 0) {
                                // 새 홀드 ID 생성
                                const holdIdResultRows = await conn.query(sqlList['callCreateCodeProcForHoldId'], []);
                                const newHoldId = holdIdResultRows && holdIdResultRows[1] && holdIdResultRows[1].length > 0
                                    ? holdIdResultRows[1][0].new_hold_id : null;
                                if (!newHoldId) {
                                    throw new Error('새로운 홀드 ID를 생성하지 못했습니다. (DB 프로시저 오류)');
                                }

                                // t_hold 테이블에 삽입 (LOT 코드와 연결)
                                // 실제 재고(t_material_inbound)는 건드리지 않고, t_hold에만 기록합니다.
                                await conn.query(sqlList['insertSingleHold'], [
                                    newHoldId,
                                    material_code,
                                    qtyToAllocateFromLot,
                                    currentWorkInstCode,
                                    '0b2b', // use_yn: '0b2b' (홀드 상태)
                                    lot.lot_code, // FAB 자재는 LOT 코드와 연결
                                    0 // release_qty 초기값 0
                                ]);
                                console.log(`새 FAB 홀드 ${newHoldId} (자재: ${material_code}, LOT: ${lot.lot_code}) 삽입: ${qtyToAllocateFromLot}`);

                                allocatedQty += qtyToAllocateFromLot;
                                remainingQtyToAllocate -= qtyToAllocateFromLot;

                                // ❗ 중요: t_material_inbound 테이블의 재고 수량 및 상태 업데이트 로직은 여기서 제거됩니다.
                                // 재고 차감 및 상태 변경은 나중에 '출고' 또는 '생산 투입' 시점에 별도로 처리해야 합니다.
                            }
                        }

                        if (remainingQtyToAllocate > 0) {
                            // 필요한 수량을 모두 할당하지 못했을 경우 (홀드 부족 메시지)
                            // 실제 재고가 부족한 상황이므로 여전히 오류로 처리해야 합니다.
                            throw new Error(`FAB 자재 '${material_code}'의 재고가 ${remainingQtyToAllocate} 부족하여 홀드할 수 없습니다. (작업지시: ${currentWorkInstCode})`);
                        }

                    } else {
                        // 일반 자재 (부자재) 처리: LOT 할당 없이 수량만 홀드
                        const calculatedHoldQty = requiredQty; // 일반 자재의 필요 수량

                        // 새 홀드 ID 생성
                        const holdIdResultRows = await conn.query(sqlList['callCreateCodeProcForHoldId'], []);
                        const newHoldId = holdIdResultRows && holdIdResultRows[1] && holdIdResultRows[1].length > 0
                            ? holdIdResultRows[1][0].new_hold_id : null;

                        if (!newHoldId) {
                            throw new Error('새로운 홀드 ID를 생성하지 못했습니다. (DB 프로시저 오류)');
                        }

                        // 일반 자재는 lot_code에 NULL 삽입
                        // insertSingleHold 쿼리 인자 순서: hold_id, material_code, hold_qty, work_inst_code, use_yn, lot_code, release_qty
                        await conn.query(sqlList['insertSingleHold'], [
                            newHoldId,
                            material_code,
                            calculatedHoldQty,
                            currentWorkInstCode,
                            '0b2b', // use_yn: '0b2b' (홀드 상태)
                            null, // 일반 자재는 lot_code가 필요 없음
                            0 // release_qty 초기값 0
                        ]);
                        console.log(`새 일반 자재 홀드 ${newHoldId} (자재: ${material_code}) 삽입: ${calculatedHoldQty}`);
                    }
                }
            } else {
                console.warn(`BOM 코드 '${current_bom_code}'에 대한 상세 내역(자재 목록)을 찾을 수 없습니다. 자재 홀드 처리 생략.`);
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
            //t_work_prcess도 삭제
            const deleteWorkProcessResult = await conn.query(sqlList['deleteWorkProcessByworkInstCode'], [code]);
            deletedCount.workProcesses += deleteWorkProcessResult.affectedRows;
            console.log(`작업지시 ${code} 관련 작업 공정 데이터 ${deleteWorkProcessResult.affectedRows}개 삭제.`);

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