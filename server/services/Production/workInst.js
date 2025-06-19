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

//작업지시조회 
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
// 작업지시서 저장 (재고 부족 시에도 홀드 기록, use_yn 고정, 수량은 필요량으로)
// 작업지시서 저장 (재고 부족 시에도 홀드 기록, use_yn 고정, 수량은 필요량으로)
const saveWorkInstructions = async (workInstructions) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.beginTransaction(); // 트랜잭션 시작

        const savedResults = [];

        for (const instruction of workInstructions) {
            // 1. 모든 파라미터 추출 및 유효성 검사
            const p_work_inst_code_in = instruction.work_inst_code && instruction.work_inst_code.trim() !== '' ? instruction.work_inst_code.trim() : null;
            const p_prod_plan_code = instruction.prod_plan_code && instruction.prod_plan_code.trim() !== '' ? instruction.prod_plan_code.trim() : null;
            const p_prod_code = instruction.prod_code && instruction.prod_code.trim() !== '' ? instruction.prod_code.trim() : null;
            const p_inst_qty = parseFloat(instruction.inst_qty) || 0;

            const p_inst_state = instruction.inst_state && instruction.inst_state.trim() !== '' ? instruction.inst_state.trim() : '0s1s'; // 기본값 '0s1s' (생산 전)
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
                    // conn.query의 반환값 형태에 따라 'rows' 배열을 올바르게 추출
                    let bomRowsResult = await conn.query(sqlList['selectBomByProdCode'], [p_prod_code]);
                    let bomRows;
                    if (Array.isArray(bomRowsResult) && Array.isArray(bomRowsResult[0])) {
                        bomRows = bomRowsResult[0];
                    } else if (Array.isArray(bomRowsResult)) {
                        bomRows = bomRowsResult;
                    } else if (typeof bomRowsResult === 'object' && bomRowsResult !== null && 'bom_code' in bomRowsResult) {
                        bomRows = [bomRowsResult];
                    } else {
                        console.warn(`경고: 제품코드 [${p_prod_code}]에 대한 t_bom 쿼리 결과 형태가 예상과 다릅니다.`, bomRowsResult);
                        bomRows = [];
                    }

                    if (bomRows && bomRows.length > 0) {
                        current_bom_code = bomRows[0].bom_code;
                    } else {
                        throw new Error(`제품코드 '${p_prod_code}'에 해당하는 BOM 정보를 찾을 수 없어 작업지시를 저장할 수 없습니다.`);
                    }

                    const updateValues = [
                        p_prod_plan_code, p_prod_code, current_bom_code, p_inst_qty,
                        p_inst_state, p_emp_num, p_inst_date, p_inst_date, p_inst_date, p_inst_reg_date, currentWorkInstCode
                    ];
                    const updateResult = await conn.query(sqlList['updateWorkInstList'], updateValues);
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

            // 4. 신규 작업지시인 경우에만 t_work_inst 테이블에 INSERT 실행 및 작업공정 생성
            if (isNewInstruction) {
                // conn.query의 반환값 형태에 따라 'rows' 배열을 올바르게 추출
                let bomRowsResult = await conn.query(sqlList['selectBomByProdCode'], [p_prod_code]);
                let bomRows;
                if (Array.isArray(bomRowsResult) && Array.isArray(bomRowsResult[0])) {
                    bomRows = bomRowsResult[0];
                } else if (Array.isArray(bomRowsResult)) {
                    bomRows = bomRowsResult;
                } else if (typeof bomRowsResult === 'object' && bomRowsResult !== null && 'bom_code' in bomRowsResult) {
                    bomRows = [bomRowsResult];
                } else {
                    console.warn(`경고: 제품코드 [${p_prod_code}]에 대한 t_bom 쿼리 결과 형태가 예상과 다릅니다.`, bomRowsResult);
                    bomRows = [];
                }

                if (bomRows && bomRows.length > 0) {
                    current_bom_code = bomRows[0].bom_code;
                } else {
                    throw new Error(`제품코드 '${p_prod_code}'에 해당하는 BOM 정보를 찾을 수 없어 작업지시를 저장할 수 없습니다.`);
                }

                const insertValues = [
                    currentWorkInstCode, p_prod_plan_code, p_prod_code, current_bom_code,
                    p_inst_qty, p_inst_state, p_emp_num, p_inst_date, p_inst_date, p_inst_date, p_inst_reg_date
                ];
                console.log('insertWorkInstList parameters:', insertValues);
                const insertResult = await conn.query(sqlList['insertWorkInstList'], insertValues);
                console.log(`작업지시 ${currentWorkInstCode} 신규 삽입 성공. Insert ID: ${insertResult.insertId}`);

                // 작업공정 insert 프로시저 호출 (SQL List에 정의되어 있다고 가정)
                let procMsg = await conn.query(sqlList['workProcessInsertProced'], [currentWorkInstCode]).catch(err => {
                    console.error("workProcessInsertProced 호출 오류:", err);
                    throw new Error("작업공정 생성 프로시저 호출 중 오류 발생. 상세: " + err.message);
                });
                // MySQL 드라이버에 따라 프로시저 결과가 다르게 반환될 수 있으므로, 정확한 인덱스 확인 필요
                procMsg = procMsg[1] && procMsg[1][0] && procMsg[1][0].msg ? procMsg[1][0].msg : '메시지 없음';
                console.log(`작업공정 생성 프로시저 메시지: ${procMsg}`);
            }

            // 5. 자재 홀드 처리 (재귀 함수 방식)

            // 기존에 이 작업지시 코드에 할당된 모든 홀드 데이터를 삭제합니다.
            // 이는 작업지시가 업데이트될 때 필요한 자재의 종류나 수량이 변경될 수 있기 때문입니다.
            await conn.query(sqlList['deleteHoldsByWorkInstCode'], [currentWorkInstCode]);
            console.log(`작업지시 ${currentWorkInstCode}에 대한 기존 홀드 데이터 삭제 완료.`);

            // 재료 소요량을 저장할 맵 (최종 자재 코드 -> {필요 수량, 실제 유형})
            const materialRequirements = new Map();

            // 재귀적으로 BOM을 탐색하고 최종 자재 소요량을 계산하는 함수
            // currentBomCode: 현재 탐색 중인 BOM의 코드
            // currentMultiplier: 현재 단계까지 곱해진 소요량 배수
            async function calculateMaterialNeeds(currentBomCode, currentMultiplier) {
                // 현재 BOM 코드에 직접 연결된 하위 품목들을 조회
                const directDetails = await conn.query(sqlList['selectDirectBomDetails'], [currentBomCode]);

                for (const detail of directDetails) {
                    const itemCode = detail.item_code;
                    const itemType = detail.item_type; // t_bom_detail의 item_type 컬럼 값
                    const need = parseFloat(detail.need); // 해당 품목의 소요량

                    const nextMultiplier = currentMultiplier * need;

                    // 품목 유형이 '0w1w' (자재)이면 최종 소요량에 합산
                    if (itemType === '0w1w') { // '0w1w'는 자재라고 하셨습니다.
                        if (materialRequirements.has(itemCode)) {
                            materialRequirements.get(itemCode).required_qty += nextMultiplier;
                        } else {
                            materialRequirements.set(itemCode, {
                                required_qty: nextMultiplier,
                                item_actual_type: detail.actual_item_type
                            });
                        }
                    }
                    // 품목 유형이 '0w2w' (반제품)이면 t_bom에서 해당 반제품의 BOM 코드를 찾아 재귀 호출
                    else if (itemType === '0w2w') { // '0w2w'는 반제품
                        const bomForSubProductQuery = `
                            SELECT bom_code
                            FROM t_bom
                            WHERE prod_code = ?;
                        `;
                        console.log(`[DEBUG] Querying t_bom for prod_code: ${itemCode}`);

                        let queryResult;
                        try {
                            queryResult = await conn.query(bomForSubProductQuery, [itemCode]);
                        } catch (error) { // 'error' 변수 선언
                            console.error(`ERROR: Query failed for prod_code ${itemCode}:`, error);
                            console.warn(`경고: 반제품 [${itemCode}]에 대한 BOM 코드 조회 중 오류 발생. 하위 자재 홀드 처리 생략.`);
                            continue; // 오류 발생 시 해당 품목 건너뛰고 다음 detail 처리
                        }
                        
                        let actualRows;
                        if (Array.isArray(queryResult) && Array.isArray(queryResult[0])) {
                            actualRows = queryResult[0];
                        } else if (Array.isArray(queryResult)) {
                            actualRows = queryResult;
                        } else if (typeof queryResult === 'object' && queryResult !== null && 'bom_code' in queryResult) {
                            actualRows = [queryResult];
                        } else {
                            console.warn(`경고: 반제품 [${itemCode}]에 대한 t_bom 쿼리 결과 형태가 예상과 다릅니다.`, queryResult);
                            actualRows = [];
                        }
                        
                        console.log(`[DEBUG] t_bom query processed result for ${itemCode}:`, actualRows);

                        if (actualRows && actualRows.length > 0) {
                            const actualSubBomCode = actualRows[0].bom_code;
                            console.log(`[DEBUG] Found BOM code for ${itemCode}: ${actualSubBomCode}`);
                            await calculateMaterialNeeds(actualSubBomCode, nextMultiplier);
                        } else {
                            // 이 경고는 이제 t_bom에 해당 prod_code가 없는 경우에만 발생해야 합니다.
                            console.warn(`경고: 반제품 [${itemCode}]에 대한 BOM 코드를 t_bom에서 찾을 수 없습니다. 하위 자재 홀드 처리 생략.`);
                        }
                    }
                }
            }
            // BOM 탐색 프로세스 시작: 완제품의 BOM 코드와 작업 지시 수량을 초기 값으로 전달
            await calculateMaterialNeeds(current_bom_code, p_inst_qty); // p_inst_qty가 여기로 들어갑니다.

            // 계산된 최종 자재 소요량을 사용하여 t_hold 테이블에 삽입
            if (materialRequirements.size > 0) {
                for (const [materialCode, data] of materialRequirements.entries()) {
                    const requiredQty = data.required_qty;
                    console.log(`[자재 홀드 처리] 작업지시: ${currentWorkInstCode}, 자재: ${materialCode}, 총 필요 수량: ${requiredQty}`);

                    let remainingQtyToHold = requiredQty; // 't_hold'에 기록해야 할 남은 총 수량

                    // 1단계: 가용 재고 LOT에 실제 할당 시도 (lot_code와 함께 기록)
                    const availableMaterialLots = await conn.query(sqlList['selectInboundMaterialsWithLot'], [materialCode]);

                    for (const lotEntry of availableMaterialLots) {
                        if (remainingQtyToHold <= 0) break; // 필요한 수량을 모두 't_hold'에 기록했으면 종료

                        const lotAvailableQty = lotEntry.available_qty;
                        const qtyToAllocateFromLot = Math.min(remainingQtyToHold, lotAvailableQty);

                        if (qtyToAllocateFromLot > 0) {
                            // 새 홀드 ID 생성 (SQL 프로시저 사용)
                            const holdIdResultRows = await conn.query(sqlList['callCreateCodeProcForHoldId'], []);
                            // 프로시저 결과도 conn.query의 반환값 형태에 따라 처리
                            let newHoldIdResult;
                            if (Array.isArray(holdIdResultRows) && Array.isArray(holdIdResultRows[1])) {
                                newHoldIdResult = holdIdResultRows[1];
                            } else if (Array.isArray(holdIdResultRows)) {
                                newHoldIdResult = holdIdResultRows; // 또는 holdIdResultRows[0]
                            } else {
                                newHoldIdResult = [holdIdResultRows];
                            }

                            const newHoldId = newHoldIdResult && newHoldIdResult.length > 0 && newHoldIdResult[0].new_hold_id
                                ? newHoldIdResult[0].new_hold_id : null;
                            
                            if (!newHoldId) throw new Error('새로운 홀드 ID를 생성하지 못했습니다. (DB 프로시저 오류)');

                            await conn.query(sqlList['insertSingleHold'], [
                                newHoldId,
                                materialCode,
                                qtyToAllocateFromLot, // 이 LOT에서 할당된 수량
                                currentWorkInstCode,
                                lotEntry.lot_code // 해당 LOT 코드
                            ]);
                            console.log(`새 자재 홀드 ${newHoldId} (자재: ${materialCode}, LOT: ${lotEntry.lot_code}) 삽입: ${qtyToAllocateFromLot} (재고 할당)`);

                            remainingQtyToHold -= qtyToAllocateFromLot; // 't_hold'에 기록해야 할 남은 수량 갱신

                            // t_material_inbound 의 total_hold_qty 업데이트 (실제 할당된 수량만 증가)
                            await conn.query(sqlList['updateMaterialInboundHoldQty'], [
                                qtyToAllocateFromLot,
                                lotEntry.inbound_code
                            ]);
                            console.log(`t_material_inbound ${lotEntry.inbound_code} 의 total_hold_qty 업데이트: ${qtyToAllocateFromLot}`);
                        }
                    }

                    // 2단계: 't_hold'에 기록해야 할 수량이 남아있고 (즉, 재고 부족), 아직 0이 아니라면, LOT 할당 없는 홀드 레코드 생성
                    if (remainingQtyToHold > 0) {
                        const holdIdResultRows = await conn.query(sqlList['callCreateCodeProcForHoldId'], []);
                         // 프로시저 결과도 conn.query의 반환값 형태에 따라 처리
                        let newHoldIdResult;
                        if (Array.isArray(holdIdResultRows) && Array.isArray(holdIdResultRows[1])) {
                            newHoldIdResult = holdIdResultRows[1];
                        } else if (Array.isArray(holdIdResultRows)) {
                            newHoldIdResult = holdIdResultRows; // 또는 holdIdResultRows[0]
                        } else {
                            newHoldIdResult = [holdIdResultRows];
                        }

                        const newHoldId = newHoldIdResult && newHoldIdResult.length > 0 && newHoldIdResult[0].new_hold_id
                            ? newHoldIdResult[0].new_hold_id : null;

                        if (!newHoldId) throw new Error('새로운 홀드 ID를 생성하지 못했습니다. (DB 프로시저 오류)');

                        await conn.query(sqlList['insertSingleHold'], [
                            newHoldId,
                            materialCode,
                            remainingQtyToHold, // ❗ 남은 필요한 수량(부족분)을 이 홀드 레코드에 기록
                            currentWorkInstCode,
                            null // LOT 할당 실패 (특정 LOT에 할당되지 않았으므로 NULL)
                        ]);
                        console.warn(`자재 '${materialCode}' 재고 부족. ${remainingQtyToHold} 만큼 할당 실패. 홀드 ${newHoldId} (수량: ${remainingQtyToHold}, LOT: NULL) 생성.`);
                    }
                }
            } else {
                console.warn(`BOM 코드 '${current_bom_code}'에 대한 최종 자재 내역을 찾을 수 없습니다. 자재 홀드 처리 생략.`);
            }

            // 6. 응답을 위한 결과 저장
            savedResults.push({
                ...instruction,
                work_inst_code: currentWorkInstCode,
                emp_num: p_emp_num, // 프론트엔드에서 넘어온 담당자 정보 반영
                inst_reg_date: p_inst_reg_date
            });
        }

        // 모든 작업 성공 시 커밋
        await conn.commit();
        console.log('모든 작업지시 및 관련 자재 홀드 성공적으로 커밋됨.');
        return { success: true, message: '모든 작업지시가 성공적으로 저장되었습니다.', data: savedResults };

    } catch (error) {
        // 오류 발생 시 롤백
        if (conn) {
            await conn.rollback();
        }
        console.error('작업지시 저장 중 오류 발생 및 롤백됨. 오류 상세:', error);
        throw new Error('작업지시 저장 중 오류가 발생했습니다: ' + error.message);
    } finally {
        // 연결 해제
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