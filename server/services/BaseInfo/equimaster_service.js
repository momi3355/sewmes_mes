const mariadb = require("../../database/mapper.js");

const equiList = async ({ equiName, equiType, schDate, startDate, endDate }) => {
  const queryParams = [
    equiName, equiName, equiName,
    equiType, equiType, equiType,
    schDate, startDate, endDate, // 조건 존재 여부 확인용
    schDate, startDate, endDate, // 0v1v
    schDate, startDate, endDate, // 0v2v
    schDate, startDate, endDate  // 0v3v
  ];

  let list = await mariadb.query("selectEquiList", queryParams).catch(err => console.log(err));
  return list;
};

//단건조회
const equiOneSelect = async(equiCode) => {
  let list = await mariadb.query("selectEquiInfo", equiCode).catch(err => console.log(err));

  let info = list[0];
  return info;
}

//등록
const equiAdd = async(equiInfo) => {
  let creCode = await mariadb.query("createCodeProc", [ 't_equipment', 'equi_code', 'E' ])
  let newCode = creCode[1][0].newCode;
  equiInfo.equi_code = newCode;

  if (!equiInfo.check_interval) {  // 빈 문자열, null, undefined 모두 포함
  delete equiInfo.check_interval;
  }

  equiInfo = JSON.parse(JSON.stringify(equiInfo));
  const { fileName, originalName, filePath, ...equiData } = equiInfo;
  let resInfo = await mariadb.query("insertEquiInfo", equiData).catch(err => console.log(err));

  if(equiInfo.fileName) {
    const imgParams = [newCode, equiInfo.fileName, equiInfo.originalName, equiInfo.filePath];
    await mariadb.query("insertImages", imgParams).catch(err => console.log(err));
  }
   let result = null;
   if (resInfo.affectedRows > 0) {
    result = {
      isSuccessed: true,
    }
  } else {
    result = {
      isSuccessed: false
    }
  }
  return result;
}

//수정
const equiModify = async(equiCode, equiInfo) => {
  equiInfo = JSON.parse(JSON.stringify(equiInfo));
  const { fileName, originalName, filePath, ...equiData } = equiInfo;
  let data = [equiData, equiCode];

  let resInfo = await mariadb.query("updateEquiInfo", data).catch(err => console.log(err));

  if(equiInfo.fileName) {
    const imgParams = [equiCode, equiInfo.fileName, equiInfo.originalName, equiInfo.filePath];
    await mariadb.query("updateImgInfo", imgParams).catch(err => console.log(err));
  }

  let result = null;

  if (resInfo.affectedRows > 0) {
    result = {
      isUpdated: true,
    };
  } else {
    result = {
      isUpdated: false,
    };
  }
  return result;
}

//설비 비가동 이력조회
const equiHistoryList = async (equiCode) => {
  let list = await mariadb.query("selectEquiHistory", equiCode).catch(err => console.log(err));
  return list;
}

//설비 이력 등록
const equiHistoryInsert = async (equiHistoryInfo) => {
  let creCode = await mariadb.query("createCodeProc", [ 't_equi_history', 'history_code', 'EH' ])
  let newCode = creCode[1][0].newCode;
  equiHistoryInfo.history_code = newCode;

  equiHistoryInfo = JSON.parse(JSON.stringify(equiInfo));
  let resInfo = await mariadb.query("insertEquiHistoryInfo", equiHistoryInfo).catch(err => console.log(err));

   let result = null;
   if (resInfo.affectedRows > 0) {
    result = {
      isSuccessed: true,
    }
  } else {
    result = {
      isSuccessed: false
    }
  }
  return result;
}

module.exports = {
  equiList
  , equiOneSelect
  , equiAdd
  , equiModify
  , equiHistoryList
  , equiHistoryInsert
}