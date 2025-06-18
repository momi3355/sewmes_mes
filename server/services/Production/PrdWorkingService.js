const { query, directQuery,getConnection } = require("../../database/mapper.js");
const { convertObjToAry } = require('../../utils/converts.js');
const sqlList = require("../../database/sqlList.js");


// 특정 작업 지시의 공정 흐름도를 가져오는 서비스 함수
const getProcessFlowByWorkInst = async (workInstCode) => {
    try {
        console.log('Calling SQL with workInstCode:', workInstCode); 
      
        const rows = await query('getProcessFlowByWorkInst', [workInstCode]);
        return rows;
    } catch (error) {
        console.error(`Error in getProcessFlowByWorkInst for workInst ${workInstCode}:`, error);
        throw error;
    }
};

const getEquipmentByProcess = async (processCode) => {
    try {
        console.log('Calling SQL for equipment with processCode:', processCode);
        
        const rows = await query('getEquipmentByProcess', [processCode]);
        return rows;
    } catch (error) {
        console.error(`Error in ProductionService.getEquipmentByProcess for processCode ${processCode}:`, error);
    
    }
};
const getWorkInstDetails = async (workInstCode) => {
    try {
        console.log('Calling SQL for getWorkInstDetails with workInstCode:', workInstCode);
        const rows = await query('getWorkInstDetails', [workInstCode]);

        if (rows.length === 0) {
            return null; // 데이터가 없는 경우
        }

        // 쿼리 결과(여러 행)를 프론트엔드가 원하는 단일 객체 + materials 배열 형태로 가공
        const firstRow = rows[0];
        const details = {
            work_inst_code: firstRow.work_inst_code,
            prod_name: firstRow.prod_name,
            inst_qty: firstRow.inst_qty,
            inst_date: firstRow.inst_date,
            inst_state: firstRow.inst_state,
            prod_code: firstRow.prod_code,
            prod_type: firstRow.prod_type,
            category: firstRow.category,

            color: firstRow.color,
            
            size: firstRow.size,
 
            work_start_date: firstRow.overall_work_start_date || '',
            work_end_date: firstRow.overall_work_end_date || '',
            materials: [] // 자재 정보를 담을 배열 초기화
        };

        const materials = [];
        rows.forEach(row => {
            // item_code가 있는 경우 (즉, 유효한 자재 정보가 있는 행)에만 추가
            if (row.item_code) {
                materials.push({
                    item_code: row.item_code,
                    required_quantity: row.required_quantity,
                    material_name: row.material_name,
                    material_unit: row.material_unit,
                    material_standard: row.material_standard,
                    material_type: row.material_type, // SQL 쿼리에 vw.material_type 추가했다면
                    // ⭐⭐⭐ 새로 추가된 필드들 ⭐⭐⭐
                    lot_number: row.lot_number,             // SQL 쿼리에서 가져온 lot_number
                    total_current_hold_qty: row.total_current_hold_qty // SQL 쿼리에서 가져온 total_current_hold_qty
                });
            }
        });
        details.materials = materials;

        return details;

    } catch (error) {
        console.error(`Error in getWorkInstDetails for workInst ${workInstCode}:`, error);
        throw error; // 오류를 상위 호출자로 다시 던짐
    }
};

const startWorkProcess = async (workInstCode, processCode, equiCode, startDate) => {
    const connection = await getConnection(); // 트랜잭션을 위해 커넥션을 가져옴
    try {
        await connection.beginTransaction(); // 트랜잭션 시작

        // 1. t_work_process 테이블 업데이트 (해당 공정의 시작일자, 설비 업데이트)
        // 쿼리 이름은 'updateProcessStartDate'로 가정하며, 파라미터는 쿼리에 맞춰 조정
        const updateProcessResult = await connection.query(sqlList['updateProcessStartDate'], [
            equiCode,       // 첫 번째 ? 에 매핑
            // 만약 sqlList.js의 updateProcessStartDate 쿼리에 work_start_worker_code가 있다면 여기에 userCode 추가:
            // userCode,
            workInstCode,  
            processCode     // 세 번째 ? 에 매핑
        ]);

        if (updateProcessResult.affectedRows === 0) {
            throw new Error(`해당 작업지시(${workInstCode})의 공정(${processCode})을 찾을 수 없거나 업데이트에 실패했습니다.`);
        }

        // 2. t_work_inst 테이블 상태 업데이트 (작업지시 전체 상태를 '생산중'으로 변경)
        // 이 쿼리를 다시 포함해야 프론트엔드와 백엔드 상태가 일치합니다.
        const updateInstStateResult = await connection.query(sqlList[ 'updateWorkInstStateToInProgress'], [
            '0s2s', // '생산중' 상태 코드
            workInstCode
        ]);

        if (updateInstStateResult.affectedRows === 0) {
            console.warn(`[PrdWorkingService] 작업지시(${workInstCode}) 상태를 '생산중'으로 업데이트하는 데 영향을 받은 행이 없습니다. (이미 '0s2s'일 수 있음)`);
            // throw new Error(`작업지시(${workInstCode})의 상태 업데이트에 실패했습니다.`); // 치명적인 오류가 아니라면 주석 처리 가능
        }

        await connection.commit(); // 모든 업데이트 성공 시 커밋

        console.log(`[PrdWorkingService] 작업 시작 성공: 작업지시=${workInstCode}, 공정=${processCode}`);
        return { success: true, message: '작업이 성공적으로 시작되었습니다.' };

    } catch (error) {
        await connection.rollback(); // 오류 발생 시 롤백
        console.error(`[PrdWorkingService] startWorkProcess 오류:`, error);
        throw error; // 라우터로 오류 다시 던짐
    } finally {
        connection.release(); // 커넥션 반환
    }
};


const endWorkProcess = async (workInstCode, processCode) => { // endDate 파라미터 제거
    const connection = await getConnection();
    try {
        await connection.beginTransaction();

        // 1. t_work_process 테이블 업데이트 (종료일자만 NOW()로 업데이트)
        // 쿼리가 NOW()를 사용하므로 endDate 파라미터는 여기서는 불필요.
        const updateProcessResult = await connection.query(sqlList['updateEndWorkTime'], [
            workInstCode, // 첫 번째 ? 에 매핑
            processCode   // 두 번째 ? 에 매핑
        ]);

        if (updateProcessResult.affectedRows === 0) {
            throw new Error(`해당 작업지시(${workInstCode})의 공정(${processCode})을 찾을 수 없거나 종료 업데이트에 실패했습니다.`);
        }



        await connection.commit();

        console.log(`[PrdWorkingService] 작업 종료 성공: 작업지시=${workInstCode}, 공정=${processCode}`);
        return { success: true, message: '작업이 성공적으로 종료되었습니다.' };

    } catch (error) {
        await connection.rollback();
        console.error(`[PrdWorkingService] endWorkProcess 오류:`, error);
        throw error;
    } finally {
        connection.release();
    }
};

const insertPrdPref = async (details) => {
    // 새로운 실적 코드 생성 (트랜잭션 외부)
    let creCodeResult = await query("createCodeProc", ['t_inst_perf', 'work_perf_code', 'WPC']);
    
    let newPerfCode = creCodeResult[1][0].newCode; // 프로시저 반환 값 형태에 따라 조정될 수 있음

    const connection = await getConnection(); // DB 커넥션 가져오기
    try {
        await connection.beginTransaction(); // 트랜잭션 시작

        // ------------------------------------------------------------------
        // 1. 해당 작업지시의 모든 공정 정보 조회 (t_work_process) 그전에 splilce로 insert한게 라우터에서 배열로 
        // ------------------------------------------------------------------
        try {
            const queryResult = await connection.query(sqlList['selectWorkProcess'], [details.work_inst_code]);
            
            console.log('[DEBUG] selectWorkProcess raw queryResult:', queryResult); 
            
            // 대부분의 mysql (특히 mysql2) 라이브러리는 [rows, fields] 형태로 반환합니다.
            if (Array.isArray(queryResult) && queryResult.length > 0 && Array.isArray(queryResult[0])) {
                allWorkProcesses = queryResult[0]; // 첫 번째 요소가 실제 데이터 배열
            } else if (Array.isArray(queryResult)) { // queryResult가 이미 데이터 배열인 경우 (라이브러리에 따라 다름)
                allWorkProcesses = queryResult;
            } else {
                console.error('[ERROR] Unexpected queryResult format:', queryResult);
                throw new Error('데이터베이스 쿼리 결과 형식이 예상과 다릅니다.');
            }
            
        } catch (err) {
            console.error("selectWorkProcess 쿼리 실행 중 실제 DB 오류:", err); // 실제 DB 오류 메시지 확인
            throw new Error(`작업지시(${details.work_inst_code})의 공정 정보를 조회하는 중 오류 발생: ${err.message}`);
        }
         // allWorkProcesses가 비어있을 경우 처리
        if (!allWorkProcesses || allWorkProcesses.length === 0) { 
            throw new Error(`작업지시(${details.work_inst_code})에 해당하는 공정 정보를 찾을 수 없습니다.`);
        }

        let currentProcessRow = null; 
        // ------------------------------------------------------------------
        // 2. for 루프 시작: t_work_process 업데이트 및 공정별 추가 로직 처리
        // ------------------------------------------------------------------
        for (let process of allWorkProcesses) {
            console.log(`[DEBUG] Comparing: process.work_process_code=${process.work_process_code}, details.work_process_code=${details.work_process_code}`); 
            if (process.work_process_code === details.work_process_code) {
                console.log(`[DEBUG] Match found for work_process_code: ${process.work_process_code}`);
                currentProcessRow = process; 

                // 누적 실적 계산
                let newInputQtyAccumulated = details.input_qty + (process.input_qty || 0);
                let newDefectQtyAccumulated = (process.defect_qty || 0) + details.defect_qty;
                let newProdQtyAccumulated = (process.prod_qty || 0) + details.prod_qty;

                let updateParmas = {
                    input_qty: newInputQtyAccumulated,
                    defect_qty: newDefectQtyAccumulated,
                    prod_qty: newProdQtyAccumulated
                };
                
                //공통로직 1

                // 1-1 공정순서3부터 실적등록되면 합격량은 지시량으로

                if (process.process_seq >= 3) {
                    updateParmas.prod_qty = process.inst_qty; 
                }

                let isProcessCompleted = false;
                // 1-2 공정완료여부 조건부 업데이트
                if (process.inst_qty == newInputQtyAccumulated) {
                    updateParmas.complete = '1a1a'; 
                    isProcessCompleted = true; // 공정 완료 플래그 설정
                }
                
                const updateWorkProcState = await connection.query(
                    sqlList['updateWorkProcess'],
                    [updateParmas, process.work_process_code] 
                );

                //UPDATE 쿼리가 실행되었지만, 실제로 변경된 행(row)이 하나도 없을 때 
                if (updateWorkProcState.affectedRows === 0) {
                    console.warn(`[PrdPrefService] 경고: 작업공정(${process.work_process_code}) 업데이트에 실패했거나 변경사항이 없습니다.`);
                } else {
                    console.log(`[PrdPrefService] 작업공정(${process.work_process_code})이 성공적으로 업데이트되었습니다. Affected Rows: ${updateWorkProcState.affectedRows}`);
                } //input_qty가 현재 DB에 20으로 되어 있는데, 업데이트하려는 newInputQty도 20이라면, DB 시스템은 "변경할 내용이 없다"고 판단하여 affectedRows를 0으로 반환

                // --- 공정별 추가 로직 (자재 출고, 반제품 입고 등) ---
                //2. 현재공정순서가 1이고 지시수량만큼 완료했을때 
                // 공정순서 1 완료 시 로직 (이전 답변에서 추가했던 내용)
            // 이 if 블록은 위 if (process.work_process_code === details.work_process_code) 블록 안에 그대로 있습니다.

        if (process.process_seq == 1 && isProcessCompleted) {
            console.log(`[PrdPrefService] 공정순서 1 (${process.work_process_code})이 지시수량만큼 완료되었습니다. 관련 로직을 시작합니다.`);
            // 2-1. 반제품 입고 테이블 insert
            let creCode = await connection.query("CALL createcode_proc(?, ?, ?, @new_code); SELECT @new_code AS newCode;", ['t_semi_prod_in', 'semi_inbound_code', 'SPI']);
            let newSemiProdCode = creCode[1][0].newCode; 
            //작업실적코드가 들어가야하나?
            const insertHalfParams = [
                newSemiProdCode,
                newProdQtyAccumulated,
                'WORK',
                newPerfCode, 
                details.prod_code
            ];
            await connection.query(sqlList['inSemiPrdForProcess'], insertHalfParams);
            console.log(`[PrdPrefService] 반제품 입고 (t_semi_prod_in) 성공: ${newSemiProdCode}, 수량: ${newProdQtyAccumulated}`);
            //2-2외주 발주
        }
        // ------------------------------------------------------------------
        // 이 부분이 중요합니다: 이 else는 이 if (process.work_process_code === details.work_process_code) 에 대한 else 입니다.
        // ------------------------------------------------------------------
    } else { // <<-- 이 else는 `if (process.work_process_code === details.work_process_code)` 에 대한 else 입니다.
        console.log(`[DEBUG] No match for work_process_code: ${process.work_process_code}. Skipping update.`);
    }
} // for 루프 종료
        // for 루프 종료
        // ------------------------------------------------------------------

        // ------------------------------------------------------------------
        // 3. t_inst_perf (작업실적 테이블)에 새로운 실적 데이터 INSERT
        // SELECT와 UPDATE가 모두 완료된 후에 최종적으로 실적을 기록

        // ------------------------------------------------------------------
        const insertPerfParams = [
            newPerfCode,        // work_perf_code (새로 생성된 실적 코드)
            details.work_inst_code,
            details.work_process_code,
            details.input_qty,
            details.prod_qty,
            details.defect_qty,
            details.pref_note,
            details.defect_type,
            details.emp_num,
        ];

        try {
            const insertResult = await connection.query(sqlList['insertPrdPref'], insertPerfParams);
            if (insertResult.affectedRows === 0) {
                throw new Error('작업실적 (t_inst_perf) 등록에 실패했습니다. (Affected Rows = 0)');
            }
            console.log(`[PrdPrefService] 작업실적 ${newPerfCode} 등록 성공 (모든 공정 처리 후).`);
        } catch (error) {
            console.error(`[PrdPrefService] t_inst_perf 삽입 쿼리 오류: ${error.message}`);
            throw error;
        }

        // ------------------------------------------------------------------
        // 4. 공정 순서 마지막 또는 전체 완료 여부 로직 (for 루프 밖에서 처리)
        // ------------------------------------------------------------------
        if (currentProcessRow) {
            // ... (생략 - 이전 답변의 전체 코드 참조) ...
        } else {
            console.error(`[PrdPrefService] 치명적 오류: 실적 대상 공정(${details.work_process_code})이 조회되지 않았습니다.`);
            throw new Error(`실적 대상 공정(${details.work_process_code})이 조회되지 않았습니다.`);
        }

        await connection.commit();
        console.log(`[PrdPrefService] 작업실적 등록 및 관련 로직 성공: 작업실적코드 = ${newPerfCode}`);
        return { success: true, message: '작업실적이 성공적으로 등록되었습니다.', work_perf_code: newPerfCode };

    } catch (error) {
        await connection.rollback();
        console.error(`[PrdPrefService] insertPrdPref 함수 전체 처리 중 오류 발생:`, error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};




module.exports ={
   getProcessFlowByWorkInst,
   getEquipmentByProcess,
   getWorkInstDetails,
   startWorkProcess,
   endWorkProcess,
   insertPrdPref,
   
};