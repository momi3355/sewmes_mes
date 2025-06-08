// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../../database/mapper.js");
// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require('../../utils/converts.js');

// 실제 제공할 서비스 등록 영역
//const productionPlansSqls = require('../../database/sqls/workInst.js');
module.exports ={
    // 해당 객체에 등록해야지 외부로 노출
    //생산계획목록 
    getProductionPlans:async(params)=>{
        try{
            const completeStatus = params.complete || 'N';
            const [rows] = await mariadb.query('selectProdPlansList',[completeStatus]);
            return rows;
        }catch(error){
            console.error('생산계획목록 중 문제 발생',error);
            throw error;
        }
    },
    //작업지시서 저장 
 saveWorkInstructions: async (workInstructions) => {
        try {
            const savedResults = [];

            for (const instruction of workInstructions) {
                // 프론트엔드 데이터 필드명과 DB 컬럼 매핑
                const plancd = instruction.plancd || null;
                const prodCode = instruction.prdname; 
                const instqty = instruction.instqty;

                // prodCode를 통해 bom코드조회
                let bom_code= null;
                if(prodCode){
                    const bomRows= await mariadb.query('selectBomByProdCode',[prodCode]);
                    if(bomRows&&bomRows.length>0){
                        bomCode =bomRows[0].bom_code;
                    }else{
                        console.log(`제품코드 '${prodCode}' 에 해당하는 bom코드를 찾을 수 없습니다`);
                    }
                }
                // DB 스키마에 맞춘 추가/변경된 필드 처리
                
                const instDate = instruction.inst_date ? new Date(instruction.inst_date) : new Date();
                const instRegDate = instruction.inst_reg_date ? new Date(instruction.inst_reg_date) : new Date();

                const empNum = instruction.emp_num || null;

                // 유효성 검사 (NOT NULL 필드 확인)
                // prodCode가 NOT NULL이므로 검사 유지
                if (!prodCode || !instqty) { // 'prdcode' 대신 'prodCode' 사용
                    throw new Error("필수 필드(제품코드, 지시수량)가 누락되었습니다.");
                }

               
                const insertValues = [
                    plancd,
                    bomCode,
                    instqty,
                    instDate,
                    prodCode, 
                    empNum,
                    instRegDate,
                ];
                const insertResult = await mariadb.insertWorkInstList(insertValues);
                savedResults.push({ ...instruction, instcd: 'db에서 자동생성됨', id: insertResult.insertId });
            }

            return savedResults;

        } catch (error) {
            console.error('작업지시 저장 서비스 중 오류 발생:', error);
            throw error;
        }
    }
};