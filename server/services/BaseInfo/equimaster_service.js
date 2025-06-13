const mariadb = require("../../database/mapper.js");

//설비 전체조회
const equiList = async() => {
  let list = await mariadb.query("selectEquiList").catch(err => console.log(err));
  return list;
}

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
    const imgParams = [newCode, equiInfo.fileName, equiInfo.originalName, equiInfo.filePath];
    await mariadb.query("insertImages", imgParams).catch(err => console.log(err));
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

module.exports = {
  equiList
  , equiOneSelect
  , equiAdd
  , equiModify
  , equiHistoryList
}