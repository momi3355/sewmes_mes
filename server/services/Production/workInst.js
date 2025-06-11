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
    // 🚨🚨🚨 수정 부분: mariadb.executeTransactionalQuery 대신 conn.query를 직접 사용하고, sqlList에서 쿼리 가져옴 🚨🚨🚨
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
 const    getProductionPlans=async(params)=>{
        
        try {
                const completeStatus = params.complete || 'N';
                // const [rows] = await mariadb.query('selectProdPlansList', [completeStatus]); // <--- 이 줄을 변경
                const rows = await mariadb.query('selectProdPlansList', [completeStatus]); 
                console.log('Extracted rows (after fix):', rows); 
                return rows;
            } catch (error) {
                console.error('생산계획목록 중 문제 발생', error);
                throw error;
            }
};
//작업지시서 저장 
const saveWorkInstructions= async (workInstructions) => {
    let conn;
        try {
            conn = await mariadb.beginTransaction(); 
            const savedResults = [];

            for (const instruction of workInstructions) {
                // 프론트엔드 데이터 필드명과 DB 컬럼 매핑
                const work_inst_code = await generateWorkInstCode(conn);
                const prod_plan_code = instruction.prod_plan_code || null;
                const prod_code = instruction.prod_code; 
                const inst_qty = instruction.inst_qty;

                // prodCode를 통해 bom코드조회
                let bom_code= null;
                if(prod_code){
                    const bomRows= await mariadb.executeTransactionalQuery(conn,'selectBomByProdCode',[prod_code]);
                   if(bomRows&&bomRows.length>0){
                        bom_code =bomRows[0].bom_code;
                    }else{
                            console.log(`제품코드 '${prod_code}' 에 해당하는 bom코드를 찾을 수 없습니다`);
                    }
                }
                // DB 스키마에 맞춘 추가/변경된 필드 처리
                
                const inst_date = instruction.inst_date ? new Date(instruction.inst_date) : new Date();
                const inst_reg_date = instruction.inst_reg_date ? new Date(instruction.inst_reg_date) : new Date();

                const emp_num = instruction.emp_num || null;
                 const inst_state = instruction.inst_state || '0s';
                // 유효성 검사 (NOT NULL 필드 확인)
                // prodCode가 NOT NULL이므로 검사 유지
                if (!prod_code || !inst_qty) { // 'prdcode' 대신 'prodCode' 사용
                    throw new Error("필수 필드(제품코드, 지시수량)가 누락되었습니다.");
                }

               
                const insertValues = [
                    work_inst_code,
                    prod_plan_code,
                    bom_code,
                    inst_qty,
                    inst_date,
                    prod_code, 
                    emp_num,
                    inst_reg_date,
                    inst_state
                ];
                const insertResult = await mariadb.executeTransactionalQuery(conn, 'insertWorkInstList', insertValues); ;
                savedResults.push({ ...instruction, instcd: work_inst_code, id: insertResult.insertId });
            }

            await mariadb.commit(conn); // ✨ mapper를 통해 트랜잭션 커밋
            console.log('모든 작업지시 성공적으로 커밋됨.');
            return { success: true, message: '모든 작업지시가 성공적으로 저장되었습니다.', data: savedResults };

        } catch (error) {
            if(conn){
                await mariadb.rollback(conn);
            }
             console.error('작업지시 저장 중 오류 발생 및 롤백됨. 오류 상세:', error);
            return { success: false, message: '작업지시 저장 중 오류가 발생했습니다: ' + error.message };
        }finally {
            if (conn) { // 작업이 끝나면 연결을 풀에 반환
                await mariadb.releaseConnection(conn); // ✨ mapper를 통해 연결 해제
            }
        }
    };
module.exports ={
    getProductionPlans,
    saveWorkInstructions,
};