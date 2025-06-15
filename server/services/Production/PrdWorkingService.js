const { query, directQuery,getConnection } = require("../../database/mapper.js");
const { convertObjToAry } = require('../../utils/converts.js');
const sqlList = require("../../database/sqlList.js");

// 특정 작업 지시의 공정 흐름도를 가져오는 서비스 함수
// 특정 작업 지시의 공정 흐름도를 가져오는 서비스 함수
const getProcessFlowByWorkInst = async (workInstCode) => {
    try {
        console.log('Calling SQL with workInstCode:', workInstCode); // Keep this for debugging
        // ⭐⭐⭐ Change this line: Pass the string alias 'getProcessFlowByWorkInst' ⭐⭐⭐
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
        // mapper.js의 query 함수에 'getEquipmentByProcess'라는 alias와 파라미터(processCode)를 전달합니다.
        const rows = await query('getEquipmentByProcess', [processCode]);
        return rows;
    } catch (error) {
        console.error(`Error in ProductionService.getEquipmentByProcess for processCode ${processCode}:`, error);
        throw error; // 에러를 상위 호출자에게 전달하여 적절히 처리되도록 합니다.
    }
};


module.exports ={
   getProcessFlowByWorkInst,
   getEquipmentByProcess,
};