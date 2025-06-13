// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../../database/mapper.js");
// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require('../../utils/converts.js');

// 실제 제공할 서비스 등록 영역
const sqls = require('../../database/sqls/workInst.js');
const sqlList = require("../../database/sqlList.js"); 

// 작업지시코드 생성 함수
const generateWorkInstCode = async(conn)=>{
    const prefix='I';
    const rows = await conn.query(sqlList['selectMaxWorkInstCode']); // SQL Alias를 사용하여 쿼리 가져옴
    let maxCode= rows&& rows.length>0?rows[0].max_code :null;
    let sequence =1;
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



    // 해당 객체에 등록해야지 외부로 노출
    //생산계획목록 
 const    getProductionPlans=async()=>{
        
        try {
                const rows = await mariadb.query('selectProdPlansList'); 
                console.log('Extracted rows (after fix):', rows); 
                return rows;
            } catch (error) {
                console.error('생산계획목록 중 문제 발생', error);
                throw error;
            }
};

//작업지시조회 
const getWorkInstAll= async()=>{
    try{
        const rows = await mariadb.query('allworkInstList');
        return rows;
    }catch(error){
        console.error('작업지시목록 조회 중 문제 발생',error);
        throw error;
    }
}
//작업지시서 저장 
const saveWorkInstructions= async (workInstructions) => {
    let conn;
        try {
            conn = await mariadb.getConnection(); 
            await conn.beginTransaction(); 
            const savedResults = [];

            for (const instruction of workInstructions) {
                 const existingWorkInstCode = instruction.work_inst_code || instruction.work_inst_code; // 프론트엔드에서 어떤 이름으로 보내는지 확인
                let currentWorkInstCode;
                if (existingWorkInstCode){
                    //1. DB에 해당 WORK_INST_CODE가 실제로 존재하는지 확인 
                    
                    const checkExistsResult = await mariadb.executeTransactionalQuery(conn,'checkWorkInstCode',[existingWorkInstCode]);
                    const exists = checkExistsResult && checkExistsResult.length > 0 && checkExistsResult[0].count > 0
                    if(exists){// 있으면 update
                        console.log(`[saveWorkInstructions] Updating existing work instruction: ${existingWorkInstCode}`);
                        currentWorkInstCode = existingWorkInstCode; 

                        const UpdateValues=[
                            instruction.prod_plan_code || null,
                            instruction.prod_code,
                            instruction.inst_qty,
                            instruction.dead_date || null,
                            instruction.inst_state || '0s1s',
                            instruction.emp_num || null,
                            instruction.inst_date ? new Date(instruction.inst_date) : new Date(),
                            instruction.inst_reg_date ? new Date(instruction.inst_reg_date) : new Date(),
                            currentWorkInstCode
                        ];
                        const updateResult = await mariadb.executeTransactionalQuery(conn,'updateWorkInstList',UpdateValues);
                        console.log(`작업지시 ${currentWorkInstCode} 업데이트 성공. Affected rows: ${updateResult.affectedRows}`);

                        await mariadb.executeTransactionalQuery(conn, 'deleteHoldSql', [currentWorkInstCode]);
                        console.log(`기존 자재 홀드 내역 삭제 완료 for ${currentWorkInstCode}.`);
                    }else{ // 코드값이 넘어왔으나 db에 없는 경우
                        console.warn(`[saveWorkInstructions] Existing work_inst_code '${existingWorkInstCode}' not found in DB. Treating as new.`);
                        currentWorkInstCode = await generateWorkInstCode(conn);
                    }
                }else{ //work_inst_code가 넘어오지 않은 경우 : 신규  INMSERT
                     currentWorkInstCode = await generateWorkInstCode(conn);

                }
                //( 신규 INSERT인 경우)
                    if(!existingWorkInstCode || !exists){
                        const insertValues = [
                                currentWorkInstCode,
                                instruction.prod_plan_code,
                                instruction.prod_code, 
                                instruction.bom_code,
                                instruction.inst_qty,
                                instruction.inst_date,
                                instruction.emp_num,
                                instruction.inst_state || '0s1s',
                                instruction.inst_reg_date
                            ];
                        const insertResult = await mariadb.executeTransactionalQuery(conn, 'insertWorkInstList', insertValues); 
                         console.log(`작업지시 ${currentWorkInstCode} 신규 삽입 성공. Insert ID: ${insertResult.insertId}`);
                    }
                     // prodCode를 통해 bom코드조회
                        if (!prod_code || !inst_qty) { // 'prdcode' 대신 'prodCode' 사용
                            throw new Error("필수 필드(제품코드, 지시수량)가 누락되었습니다.");
                        }
                        let bom_code= null;
                        if(prod_code){
                            const bomRows= await mariadb.executeTransactionalQuery(conn,'selectBomByProdCode',[prod_code]);
                        if(bomRows&&bomRows.length>0){
                                bom_code =bomRows[0].bom_code;
                            }else{
                                    console.log(`제품코드 '${prod_code}' 에 해당하는 bom코드를 찾을 수 없습니다`);
                            }
                        }
                if (!bom_code) {
                await mariadb.rollback(conn); // Rollback the entire transaction if BOM not found
                throw new Error(`제품코드 '${instruction.prod_code}'에 해당하는 BOM 정보를 찾을 수 없어 자재 홀드 처리 및 작업지시 저장 실패.`);
            }

            // Get BOM details (materials) for the found BOM_code
            const bomDetails = await mariadb.executeTransactionalQuery(conn, 'selectBomDetailsByBomCode', [bom_code]);

            if (bomDetails && bomDetails.length > 0) {
                const holdInsertSqlPrefix = `INSERT INTO t_hold (item_code, hold_qty, work_inst_code) VALUES `;
                const holdValuePlaceholders = [];
                const holdValues = [];

                for (const detail of bomDetails) {
                    const calculatedHoldQty = detail.need * instruction.inst_qty;
                    holdValuePlaceholders.push(`(?, ?, ?)`);
                    holdValues.push(detail.item_code, calculatedHoldQty, currentWorkInstCode);
                }

                if (holdValuePlaceholders.length > 0) {
                    const finalHoldInsertSql = holdInsertSqlPrefix + holdValuePlaceholders.join(', ');
                    const holdResult = await mariadb.executeTransactionalQuery(conn, finalHoldInsertSql, holdValues);
                    console.log(`${holdResult.affectedRows} 건의 자재 홀드 성공 for ${currentWorkInstCode}.`);
                }
            } else {
                console.warn(`BOM 코드 '${bom_code}'에 대한 상세 내역(자재 목록)을 찾을 수 없습니다. 자재 홀드 처리 생략.`);
                // Depending on your business rule, you might want to throw an error here too if BOM details are mandatory
                // throw new Error(`BOM 코드 '${bom_code}'에 대한 상세 내역이 없어 자재 홀드 처리 불가.`);
            }

            // Add to saved results for the response
            savedResults.push({ ...instruction, work_inst_code: currentWorkInstCode });
        }

        await conn.commit();
        console.log('모든 작업지시 및 관련 자재 홀드 성공적으로 커밋됨.');
        return { success: true, message: '모든 작업지시가 성공적으로 저장되었습니다.', data: savedResults };

    } catch (error) {
        if (conn) {
            await conn.rollback();
        }
        console.error('작업지시 저장 중 오류 발생 및 롤백됨. 오류 상세:', error);
        return { success: false, message: '작업지시 저장 중 오류가 발생했습니다: ' + error.message };
    } finally {
        if (conn) {
            await conn.release(); // <--- 이 라인을 이렇게 변경합니다
        }
    }
};
module.exports ={
    getProductionPlans,
    saveWorkInstructions,
    getWorkInstAll,
};