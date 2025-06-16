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

module.exports ={
   getProcessFlowByWorkInst,
   getEquipmentByProcess,
};