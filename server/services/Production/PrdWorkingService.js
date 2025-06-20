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
    // 새로운 실적 코드 생성 (트랜잭션 외부에서 미리 생성하여 트랜잭션 내에서 사용)
    let newPerfCode;
    try {
        
        const creCodeResult = await query("createCodeProc", ['t_inst_perf', 'work_perf_code', 'WPC']);
        // 프로시저 반환 값 형태 확인 (대부분 [0][0] 또는 [1][0]에 newCode가 있습니다)
        newPerfCode = creCodeResult[1][0].newCode || (creCodeResult[1] && creCodeResult[1][0] ? creCodeResult[1][0].newCode : null);
        if (!newPerfCode) {
            throw new Error("새로운 작업 실적 코드를 생성하지 못했습니다.");
        }
        console.log(`[PrdPrefService] 생성된 작업 실적 코드: ${newPerfCode}`);
    } catch (error) {
        console.error(`[PrdPrefService] 작업 실적 코드 생성 중 오류 발생:`, error);
        throw new Error(`작업 실적 코드 생성 실패: ${error.message}`);
    }

    const connection = await getConnection(); // DB 커넥션 가져오기

    // ⭐ 트랜잭션 전체에서 사용될 변수들을 미리 선언합니다. ⭐
    let allWorkProcesses = [];
    let currentProcessRow = null;
    let cuttingSemiProdCode = null; // 재단 반제품 코드
    let sewingSemiProdCodeForOutsource = null; // 봉제 반제품 코드 (외주용)
    let outsourceCompCode = null; // 외주 업체 코드 

    try {
        await connection.beginTransaction(); // 트랜잭션 시작

        // ------------------------------------------------------------------
        // 1. 해당 작업지시의 모든 공정 정보 조회 (t_work_process)
        // ------------------------------------------------------------------
        try {
            const queryResult = await connection.query(sqlList['selectWorkProcess'], [details.work_inst_code]);
            
            console.log('[DEBUG] selectWorkProcess raw queryResult:', queryResult); 
            
            if (Array.isArray(queryResult) && queryResult.length > 0 && Array.isArray(queryResult[0])) {
                allWorkProcesses = queryResult[0]; // 첫 번째 요소가 실제 데이터 배열
            } else if (Array.isArray(queryResult)) { // queryResult가 이미 데이터 배열인 경우 (라이브러리에 따라 다름)
                allWorkProcesses = queryResult;
            } else {
                console.error('[ERROR] Unexpected queryResult format for selectWorkProcess:', queryResult);
                throw new Error('데이터베이스 쿼리 결과 형식이 예상과 다릅니다. (selectWorkProcess)');
            }
            
        } catch (err) {
            console.error("selectWorkProcess 쿼리 실행 중 DB 오류:", err);
            throw new Error(`작업지시(${details.work_inst_code})의 공정 정보를 조회하는 중 오류 발생: ${err.message}`);
        }

        // allWorkProcesses가 비어있을 경우 처리
        if (!allWorkProcesses || allWorkProcesses.length === 0) { 
            throw new Error(`작업지시(${details.work_inst_code})에 해당하는 공정 정보를 찾을 수 없습니다.`);
        }

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
                
                //공통로직 1
                // 1-1 공정순서3부터 실적등록되면 합격량은 지시량으로
                if (currentProcessRow.process_seq >= 3) { // process 대신 currentProcessRow 사용
                    newProdQtyAccumulated = currentProcessRow.inst_qty; // process 대신 currentProcessRow 사용
                    console.log(`[PrdPrefService] 공정순서 3 이상이므로 합격량(${newProdQtyAccumulated})을 지시수량으로 설정.`);
                }

                let isProcessCompleted = false; // 이 변수를 이 범위에서 선언
                // 1-2 공정완료여부 조건부 업데이트
                if (currentProcessRow.inst_qty <= newInputQtyAccumulated) { // process 대신 currentProcessRow 사용, 등호 포함
                    isProcessCompleted = true; // 공정 완료 플래그 설정
                    console.log(`[PrdPrefService] 공정 완료 여부 판단 - 지시수량: ${currentProcessRow.inst_qty}, 누적 투입량: ${newInputQtyAccumulated}, 완료? ${isProcessCompleted}`);
                }
                
               const updateParamsObject = {
                    input_qty: newInputQtyAccumulated,
                    prod_qty: newProdQtyAccumulated,
                    defect_qty: newDefectQtyAccumulated,
                    complete: isProcessCompleted ? '1a1a' : (currentProcessRow.complete || 'N') 
                };

                const updateWorkProcResult = await connection.query(
                    sqlList['updateWorkProcess'], 
                    [
                        updateParamsObject, 
                        currentProcessRow.work_process_code 
                    ] 
                );

                //UPDATE 쿼리가 실행되었지만, 실제로 변경된 행(row)이 하나도 없을 때 
                if (updateWorkProcResult.affectedRows === 0) {
                    console.warn(`[PrdPrefService] 경고: 작업공정(${currentProcessRow.work_process_code}) 업데이트에 실패했거나 변경사항이 없습니다.`);
                } else {
                    console.log(`[PrdPrefService] 작업공정(${currentProcessRow.work_process_code})이 성공적으로 업데이트되었습니다. 완료여부: ${isProcessCompleted ? '1a1a' : '미완료'}`);
                }

                // --- 공정별 추가 로직 (자재 출고, 반제품 입고 등) ---
                // 2. 현재 공정순서가 1이고 지시수량만큼 완료했을때 
                if (currentProcessRow.process_seq == 1 && isProcessCompleted) { // process 대신 currentProcessRow 사용
                    console.log(`[PrdPrefService] 공정순서 1 (${currentProcessRow.work_process_code})이 지시수량만큼 완료되었습니다. BOM 뷰를 활용한 로직을 시작합니다.`);

                 
                   // ⭐ BOM 뷰에서 완제품 코드(details.prod_code)로 재단/봉제 반제품 코드 조회 ⭐
                    try {
                        const rawBomCodesResult = await connection.query(sqlList['getSemiProdCodesFromBomView'], [details.prod_code]);

                        let bomCodesData;

                        // 대부분의 MySQL 드라이버는 첫 번째 배열에 실제 데이터가 담겨 있습니다.
                        // 하지만 가끔 직접 데이터 배열을 반환하기도 합니다.
                        if (Array.isArray(rawBomCodesResult) && rawBomCodesResult.length > 0 && Array.isArray(rawBomCodesResult[0])) {
                            // bomCodesResult가 [[{...}], {...}] 형태일 경우
                            bomCodesData = rawBomCodesResult[0];
                        } else if (Array.isArray(rawBomCodesResult)) {
                            // bomCodesResult가 [{...}, {...}] 형태일 경우
                            bomCodesData = rawBomCodesResult;
                        } else {
                            // 예상치 못한 결과 형태
                            console.error('[ERROR] Unexpected queryResult format for getSemiProdCodesFromBomView:', rawBomCodesResult);
                            throw new Error('BOM 뷰 쿼리 결과 형식이 예상과 다릅니다.');
                        }

                        // 이제 bomCodesData는 항상 실제 데이터 레코드들의 배열입니다.
                        if (bomCodesData.length > 0) {
                            // 주의: 현재 뷰가 여러 F2 행을 반환하고 있으므로, 어떤 행을 선택할지 결정해야 합니다.
                            // MAX(CASE WHEN ...) 뷰로 변경했다면 bomCodesData.length는 1일 것입니다.
                            // 여기서는 일단 첫 번째 행을 사용합니다.
                            sewingSemiProdCodeForOutsource = bomCodesData[0].bongban_code;
                            cuttingSemiProdCode = bomCodesData[0].jaeban_code;
                            console.log(`[PrdPrefService] BOM 뷰에서 반제품 코드 조회 성공: 봉제=${sewingSemiProdCodeForOutsource}, 재단=${cuttingSemiProdCode}`);
                        } else {
                            throw new Error(`BOM 뷰(v_bom_codes)에서 완제품 코드(${details.prod_code})에 해당하는 반제품 코드를 찾을 수 없습니다. 뷰 정의 또는 BOM 데이터 확인이 필요합니다.`);
                        }
                    } catch (error) {
                        console.error(`[PrdPrefService] BOM 뷰 조회 오류:`, error);
                        throw error;
                    }

                    // --- 2-1. 반제품 입고 테이블 인서트 (재단반제품) ---
                   
                    let creSemiInboundCodeResult = await connection.query(sqlList["createCodeProc"], ['t_semi_prod_in', 'semi_inbound_code', 'SPI']);
                    const newSemiInboundCode = creSemiInboundCodeResult[1][0].newCode || (creSemiInboundCodeResult[1] && creSemiInboundCodeResult[1][0] ? creSemiInboundCodeResult[1][0].newCode : null);
                    if (!newSemiInboundCode) throw new Error("새로운 반제품 입고 코드를 생성하지 못했습니다.");

                    const insertCuttingSemiProdInParams = [
                        newSemiInboundCode,
                        newProdQtyAccumulated, 
                        '0y1y',                
                        newPerfCode,           // 현재 작업 실적 코드
                        cuttingSemiProdCode    //  재단반제품 코드 사용 
                    ];
                    await connection.query(sqlList['inSemiPrdForProcess'], insertCuttingSemiProdInParams);
                    console.log(`[PrdPrefService] ✅ 재단반제품 입고 (t_semi_prod_in) 성공: 코드=${newSemiInboundCode}, 수량=${newProdQtyAccumulated}, 품목=${cuttingSemiProdCode}`);

                    // --- 2-2. 외주 발주 테이블 인서트 (봉제반제품) ---
          
                   

                    // 외주 발주 코드 생성
                    let creOutOrderCodeResult = await connection.query(sqlList["createCodeProc"], ['t_outsou_order', 'outsou_order_code', 'OSO']);
                    const newOutOrderCode = creOutOrderCodeResult[1][0].newCode || (creOutOrderCodeResult[1] && creOutOrderCodeResult[1][0] ? creOutOrderResult[1][0].newCode : null);
                    if (!newOutOrderCode) throw new Error("새로운 외주 발주 코드를 생성하지 못했습니다.");
                    console.log('sewingSemiProdCodeForOutsource', sewingSemiProdCodeForOutsource);
                    console.log('outsourceCompCode', outsourceCompCode);
                    if (sewingSemiProdCodeForOutsource) { // ⭐ 조건문에 outsourceCompCode 추가
                        const insertOutsourceOrderParams = [
                            newOutOrderCode,
                            currentProcessRow.work_process_code,
                            sewingSemiProdCodeForOutsource,
                            newProdQtyAccumulated,
                            outsourceCompCode // ⭐ outsourceCompCode 파라미터 추가
                        ];
                        await connection.query(sqlList['inOunSoInboundForProcess'], insertOutsourceOrderParams);
                        console.log(`[PrdPrefService] ✅ 외주 발주 목록 (t_outsou_order) 등록 성공: 코드=${newOutOrderCode}, 품목=${sewingSemiProdCodeForOutsource}, 수량=${newProdQtyAccumulated}, 업체=${outsourceCompCode}`);
                    } else {
                        // ⭐ else 블록 메시지 개선
                        // let errorMessage = "[PrdPrefService] 외주 발주를 위한 필수 정보가 부족합니다: ";
                        // if (!sewingSemiProdCodeForOutsource) errorMessage += "봉제반제품 코드 없음. ";
                        // if (!outsourceCompCode) errorMessage += "외주 업체 코드 없음. ";
                        // console.error(errorMessage);
                        // throw new Error("외주 발주 생성에 필요한 정보가 불충분합니다.");
                    }


                   
                    const workInstDetailsData = await getWorkInstDetails(details.work_inst_code);
                    const materials = workInstDetailsData ? workInstDetailsData.materials : [];

                   if (materials && materials.length > 0) {
                    console.log(`[PrdPrefService] 자재 출고 및 홀드 로직 시작. 총 자재 항목: ${materials.length}`);
                    for (const material of materials) {
                        // 이번 실적 처리 시 필요한 자재 수량 계산
                        const requiredForThisPerformance = material.required_quantity * details.input_qty;

                        if (requiredForThisPerformance > 0) {
                            // 1. 새로운 자재 출고 코드 생성
                            const creMatOutCodeResult = await connection.query(sqlList["createCodeProc"], ['t_material_release', 'work_inst_code', 'MR']);
                            const newMatOutCode = creMatOutCodeResult[1][0].newCode || (creMatOutCodeResult[1] && creMatOutCodeResult[1][0] ? creMatOutCodeResult[1][0].newCode : null);
                            if (!newMatOutCode) throw new Error("새로운 자재 출고 코드를 생성하지 못했습니다.");

                            // 2. 해당 자재의 홀드 정보 조회
                            // 여기서 'getMaterialHoldForRelease'는 제공된 'getWorkInstMaterials' 쿼리와 유사합니다.
                            const holdInfoResult = await connection.query(sqlList['getMaterialHoldForRelease'], [
                                details.work_inst_code,
                                material.item_code, // 자재 코드
                                material.lot_number // LOT 번호
                            ]);

                            // 3. 홀드 정보 유효성 검증 및 수량 확인
                            if (holdInfoResult[0] && holdInfoResult[0].length > 0) {
                                const hold = holdInfoResult[0][0];
                                const holdIdToUse = hold.hold_id;
                                const currentUsedQty = hold.used_qty || 0;
                                const availableHoldQty = hold.hold_qty - currentUsedQty; // 가용 홀드 수량

                                // 4. 가용 홀드 수량 부족 시 에러 발생 (롤백 유도)
                                if (availableHoldQty < requiredForThisPerformance) {
                                    console.warn(`[PrdPrefService] 경고: 자재(${material.item_code}, Lot:${material.lot_number})의 홀드량 부족. 필요: ${requiredForThisPerformance}, 가용: ${availableHoldQty}`);
                                    throw new Error(`자재(${material.item_code}) 홀드량이 부족하여 출고 및 작업 진행 불가. (가용: ${availableHoldQty}, 필요: ${requiredForThisPerformance})`);
                                }

                                // 5. 자재 출고 내역 't_material_release' 테이블에 삽입
                                const insertMaterialOutParams = [
                                    newMatOutCode,               // 새로 생성된 출고 코드
                                    details.work_inst_code,      // 작업 지시 코드
                                    newPerfCode,                 // 현재 작업 실적 코드
                                    material.item_code,          // 출고할 자재 코드
                                    currentProcessRow.process_code, // 현재 공정 코드
                                    requiredForThisPerformance,  // 출고 수량
                                    material.lot_number          // 자재 LOT 번호
                                ];
                                await connection.query(sqlList['materialReleaseForProcess'], insertMaterialOutParams);
                                console.log(`[PrdPrefService] ✅ 자재(${material.item_code}) 출고 (t_material_out) 성공: 코드=${newMatOutCode}, 수량=${requiredForThisPerformance}`);

                                // 6. 't_hold' 테이블의 자재 홀드 정보 업데이트
                                // 첫 번째 파라미터 'N'은 'use_yn' 필드를 의미하는 것으로 보입니다.
                                await connection.query(sqlList['updateMaterialHold'], [
                                    '0b2b', // 'N'은 홀드 사용 중 또는 아직 완전히 해제되지 않음을 의미하는 것으로 추정됩니다.
                                    requiredForThisPerformance, // 사용된 수량에 추가될 값
                                    holdIdToUse,                // 업데이트할 홀드 ID
                                    material.item_code,         // 자재 코드 (WHERE 조건에 사용될 수 있음)
                                    material.lot_number         // LOT 번호 (WHERE 조건에 사용될 수 있음)
                                ]);
                                console.log(`[PrdPrefService] ✅ 자재(${material.item_code}) 홀드(${holdIdToUse}) 업데이트 성공: used_qty +${requiredForThisPerformance}`);
                            } else {
                                console.warn(`[PrdPrefService] 경고: 자재(${material.item_code}, Lot:${material.lot_number})에 대한 유효한 홀드 정보를 찾을 수 없습니다. (work_inst_code: ${details.work_inst_code})`);
                                throw new Error(`자재(${material.item_code})에 대한 유효한 홀드 정보가 없어 출고 및 작업 진행 불가.`);
                            }
                        }
                    }
                } else {
                    console.log(`[PrdPrefService] 이 작업지시(${details.work_inst_code})에 필요한 자재가 없거나 BOM 정보가 불완전합니다. 자재 출고 로직 건너뜀.`);
                }
            }
                        break; // 현재 실적 대상 공정을 찾고 처리했으므로, 더 이상 루프를 돌 필요가 없음
                    } // End of if (process.work_process_code === details.work_process_code)
                } // End of for loop

                // for 루프가 끝난 후 currentProcessRow가 null이면 에러 처리
                if (!currentProcessRow) {
                    console.error(`[PrdPrefService] 치명적 오류: 실적 대상 공정(${details.work_process_code})이 조회되지 않았습니다.`);
                    throw new Error(`실적 대상 공정(${details.work_process_code})이 조회되지 않았습니다.`);
                }


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
                    console.log(`[PrdPrefService] ✅ 작업실적 ${newPerfCode} 등록 성공 (모든 공정 처리 후).`);
                } catch (error) {
                    console.error(`[PrdPrefService] t_inst_perf 삽입 쿼리 오류: ${error.message}`);
                    throw error;
                }

                // ------------------------------------------------------------------
                // ⭐ 4. 최종 공정 완료 시 로직 (생산 완료 처리) ⭐
                // ------------------------------------------------------------------
                // 현재 공정이 완료되었고, 동시에 이 공정이 전체 공정 중 가장 마지막 공정인 경우
                const isLastProcess = allWorkProcesses.every(p => p.process_seq <= currentProcessRow.process_seq);

                if (isProcessCompleted && isLastProcess) {
                    console.log(`[PrdPrefService] ⭐ 최종 공정(${currentProcessRow.work_process_code})이 완료되었습니다. 최종 처리 로직 시작. ⭐`);

                    // 1. 반제품 출고 (t_semi_prod_out) 인서트 (완제품 생산 시)
                    // `newProdQtyAccumulated`는 해당 공정의 누적 합격량입니다.
                    let creSemiOutCodeResult = await connection.query(sqlList["createCodeProc"], ['t_semi_prod_out', 'semi_release_code', 'SPO']); // PK 컬럼명 일치
                    const newSemiOutCode = creSemiOutCodeResult[1][0].newCode;
                    if (!newSemiOutCode) throw new Error("새로운 반제품 출고 코드를 생성하지 못했습니다.");

                    // `t_semi_prod_out` 테이블의 스키마와 `inSemiPrdOutForProcess` 쿼리 정의에 따라 파라미터 조정 필요.
                    // 여기서는 `semi_release_code`, `release_date`, `release_qty`, `perf_type`, `perf_code`, `prod_code`, `work_inst_code`, `process_code`로 가정
                    const insertSemiProdOutParams = [
                        newSemiOutCode,              // semi_release_code (PK)
                        newProdQtyAccumulated,       // release_qty (최종 생산 합격량)
                        '0y1y',                 // perf_type: 실적에 의한 출고 (예시)
                        newPerfCode,                 // perf_code (현재 작업 실적 코드)
                        details.prod_code,           // prod_code (완제품 코드)
                        details.work_inst_code,      // work_inst_code
                        currentProcessRow.process_code // process_code
                        // LOT 코드가 필요하다면 추가 (insertSemiProdOut 쿼리에도 lot 컬럼 추가 필요)
                    ];
                    await connection.query(sqlList['insertSemiProdOut'], insertSemiProdOutParams);
                    console.log(`[PrdPrefService] ✅ 반제품 출고 (t_semi_prod_out) 성공: 코드=${newSemiOutCode}, 수량=${newProdQtyAccumulated}, 품목=${details.prod_code}`);

                    // 2. 자재 홀드 업데이트 (작업 지시와 관련된 모든 홀드 '사용 완료' 처리)
                    // `getWorkInstMaterials`는 `use_yn = '0b1b'`만 조회하므로, 이미 사용된 것은 포함되지 않음.
                    // 전체 작업지시 관련 홀드를 가져와서 최종적으로 '사용 완료' 처리
                    const [finalHoldUpdateResult] = await connection.query(sqlList['getWorkInstMaterials'], [details.work_inst_code]); // `use_yn='0b1b'`만 가져오므로, 이미 '0b2b'인 것은 가져오지 않음. 모든 홀드를 보려면 WHERE 조건 제거 또는 다른 쿼리 필요.
                    if (finalHoldUpdateResult && finalHoldUpdateResult.length > 0) {
                        for (const hold of finalHoldUpdateResult) {
                            // 이 시점에서는 모든 홀드를 '0b3b' (사용 완료)로 마킹합니다.
                            // 만약 잔여량이 있다면, 그 잔여량만큼 홀드를 해제하는 로직이 필요할 수 있습니다.
                            await connection.query(sqlList['updateMaterialHoldUseYn'], ['0b3b', hold.hold_id]); // '0b3b': 사용 완료 상태 코드
                            console.log(`[PrdPrefService] ✅ 자재 홀드(${hold.hold_id}) 최종 완료 (use_yn = '0b3b')`);
                        }
                    } else {
                        console.log(`[PrdPrefService] 최종 공정 완료 후 추가로 처리할 사용 대기 중인 자재 홀드가 없습니다.`);
                    }

                    // 3. 작업 지시 (t_work_inst) 상태 업데이트 ('0s3s' 생산완료)
                    const [workInstInfoRows] = await connection.query(sqlList['getWorkInstDetailsForCompletion'], [details.work_inst_code]);
                    const workInstInfo = workInstInfoRows[0];
                    if (!workInstInfo) throw new Error(`작업지시(${details.work_inst_code}) 정보를 찾을 수 없습니다.`);

                    let updateWorkInstStatusFlag = false;
                    let newWorkInstStatusCode = workInstInfo.inst_state; // 현재 상태 유지

                    // 작업 지시의 누적 생산량이 지시 수량과 같거나 많으면 완료 처리
                    // (여기서 newProdQtyAccumulated는 현재 공정의 누적 합격량. 전체 작업 지시의 총 합격량과 비교 필요)
                    if (newProdQtyAccumulated >= workInstInfo.inst_qty) { // 이 조건은 현재 공정 기준이므로 전체 작업지시 완료 판단은 더 복잡할 수 있음
                    newWorkInstStatusCode = '0s3s'; // 생산 완료 상태 코드
                    updateWorkInstStatusFlag = true;
                    console.log(`[PrdPrefService] 작업지시(${details.work_inst_code}) 생산 수량 충족. 상태를 '${newWorkInstStatusCode}'로 변경.`);
                    }

                    // 최종 공정이 완료되면, 작업 지시를 "생산 완료" 상태로 변경
                    newWorkInstStatusCode = '0s3s'; // '0s3s': 생산 완료
                    updateWorkInstStatusFlag = true;
                    console.log(`[PrdPrefService] 최종 공정(${currentProcessRow.work_process_code})이 완료되었으므로, 작업지시(${details.work_inst_code}) 상태를 '${newWorkInstStatusCode}'로 변경.`);


                    if (updateWorkInstStatusFlag) {
                        await connection.query(sqlList['updateWorkInstStatus'], [
                            newWorkInstStatusCode,  // inst_state = '0s3s'
                            'Y',                    // complete_yn = 'Y'
                            details.work_inst_code
                        ]);
                        console.log(`[PrdPrefService] ✅ 작업지시(${details.work_inst_code}) 상태 업데이트 성공: inst_state=${newWorkInstStatusCode}, complete_yn=Y`);
                    }

                    // 4. 생산 계획 (t_prod_plan) 완료 여부 업데이트
                    // t_prod_plan은 work_inst_code를 직접 가지고 있지 않으므로, workInstInfo에서 prod_plan_code를 얻어 조회
                    const [prodPlanInfoRows] = await connection.query(sqlList['getProdPlanByWorkInst'], [workInstInfo.prod_plan_code]); // 쿼리명 변경됨
                    const prodPlanInfo = prodPlanInfoRows[0];
                    if (!prodPlanInfo) throw new Error(`생산계획(${workInstInfo.prod_plan_code}) 정보를 찾을 수 없습니다.`);

                    if (updateWorkInstStatusFlag) { // 작업 지시가 완료되었을 때만 생산 계획도 완료 처리
                        await connection.query(sqlList['updateProdPlanComplete'], ['1a1a', prodPlanInfo.prod_plan_code]); // '1a1a': 완료 (t_prod_plan의 complete 컬럼)
                        console.log(`[PrdPrefService] ✅ 생산계획(${prodPlanInfo.prod_plan_code}) 완료 여부 '1a1a'로 업데이트 성공.`);
                    }

                    // 5. 주문 상세 (t_order_detail) 및 상위 주문 (t_order) 상태 업데이트
                    const [orderDetailInfoRows] = await connection.query(sqlList['getProdPlanByWorkInst'], [prodPlanInfo.prod_plan_code]);
                    const orderDetailInfo = orderDetailInfoRows[0];
                    if (!orderDetailInfo) throw new Error(`주문 상세(${prodPlanInfo.order_detail_code}) 정보를 찾을 수 없습니다.`);

                    // 생산량이 주문 상세 수량 이상인지 확인 (orderDetailInfo.order_qty는 t_order_detail의 총 주문 수량)
                    // 여기서는 currentProcessRow의 `newProdQtyAccumulated`를 사용하지만, 실제로는 `t_prod_plan.prod_qty`가 최종 생산량일 가능성이 높습니다.
                    if (prodPlanInfo.prod_qty >= orderDetailInfo.order_qty) { // 생산계획의 prod_qty로 비교
                        // 주문 상세 상태 업데이트 (생산 완료에 해당하는 상태 코드 '0s3s')
                        await connection.query(sqlList['updateOrderDetailStatus'], ['0s3s', orderDetailInfo.order_detail_code]);
                        console.log(`[PrdPrefService] ✅ 주문 상세(${orderDetailInfo.order_detail_code}) 상태 '0s3s'로 업데이트 성공.`);

                        // 상위 주문 (t_order) 상태 업데이트 로직 (모든 상세 주문이 완료되었는지 확인 후)
                        // getOrderInfoByOrderDetailCode 쿼리는 order_code를 기준으로 모든 상세 주문 완료 여부를 판단해야 합니다.
                        const [orderMasterInfoRows] = await connection.query(sqlList['getOrderInfoByOrderDetailCode'], [orderDetailInfo.order_detail_code]);
                        const orderMasterInfo = orderMasterInfoRows[0];

                        if (orderMasterInfo && orderMasterInfo.total_detail_count === orderMasterInfo.completed_detail_count) {
                            // 모든 주문 상세가 완료되면 상위 주문 상태도 업데이트
                            await connection.query(sqlList['updateOrderStatus'], ['0s3s', orderMasterInfo.order_code]); // '0s3s': 주문 완료 상태 코드
                            console.log(`[PrdPrefService] ✅ 상위 주문(${orderMasterInfo.order_code}) 상태 '0s3s'로 업데이트 성공 (모든 상세 완료).`);
                        } else if (orderMasterInfo) {
                            console.log(`[PrdPrefService] 상위 주문(${orderMasterInfo.order_code})은 아직 모든 상세 주문이 완료되지 않아 상태를 업데이트하지 않습니다.`);
                        }
                    } else {
                        console.log(`[PrdPrefService] 주문 상세(${orderDetailInfo.order_detail_code})의 생산량(${prodPlanInfo.prod_qty})이 주문량(${orderDetailInfo.order_qty})에 미달하여 완료 처리하지 않습니다.`);
                    }

                    console.log(`[PrdPrefService] ⭐ 최종 공정 로직 완료. ⭐`);
                }

                await connection.commit();
                console.log(`[PrdPrefService] 최종: 모든 작업실적 관련 로직 성공적으로 완료. 작업실적코드 = ${newPerfCode}`);
                return { success: true, message: '작업실적이 성공적으로 등록되었습니다.', work_perf_code: newPerfCode };

            } catch (error) {
                await connection.rollback(); // 오류 발생 시 롤백
                console.error(`[PrdPrefService] insertPrdPref 함수 전체 처리 중 오류 발생:`, error);
                throw error; // 라우터로 오류 다시 던짐
            } finally {
                if (connection) {
                    connection.release(); // 커넥션 반환
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