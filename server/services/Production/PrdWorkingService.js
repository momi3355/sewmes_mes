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

//const insertPrdPref= async( work_inst_code, work_process_code,  input_qty, prod_qty,defect_qty, pref_note,defect_type, emp_num)=>{
    const insertPrdPref= async(details)=>{
  let creCode = await query("createCodeProc", [ 't_inst_perf', 'work_perf_code', 'WPC' ]);
  let newCode = creCode[1][0].newCode;
    try{
        
        
         /*const details = {
            
            work_perf_code:newCode,
            work_inst_code:work_inst_code,
            work_process_code:work_process_code,
            input_qty:input_qty,
            prod_qty:prod_qty,
            defect_qty:defect_qty,
            pref_note:pref_note,
            defect_type:defect_type,

            emp_num:emp_num,
                    
        };*/
        details.splice(0, 0, newCode);
        console.log('넘어오는 파라미터: ', details);
        const rows = await query('insertPrdPref', details);
        
        console.log(rows);
    }catch(error){
        console.error(error);

    }
      

};
module.exports ={
   getProcessFlowByWorkInst,
   getEquipmentByProcess,
   getWorkInstDetails,
   startWorkProcess,
   insertPrdPref
};