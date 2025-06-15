const mariadb = require("../../database/mapper.js");

//설비 전체조회
const equiList = async ({
  equiName = '',
  equiType = '',
  useYnList = [],
  dateType = '',
  startDate = '',
  endDate = '',
}) => {
  // useYnList -> 문자열로 합쳐서 IN절과 FIND_IN_SET에 넘길 값 준비
  const useYnParam = useYnList.length > 0 ? useYnList.join(',') : null;

  // params 순서에 맞게 배열 만들기
  const params = [
    equiName, equiName, equiName,     // equi_name LIKE
    equiType, equiType, equiType,     // equi_type =
    null, '', useYnParam,              // use_yn IN (?)
    null, '', useYnParam,              // FIND_IN_SET(use_yn, ?)
    
    dateType, startDate, endDate,      // install_date 조건
    dateType, startDate, endDate,      // last_check 조건
    dateType, startDate, endDate,      // check_date 조건
    null, ''                          // 날짜 필터 없을 때 조건 (널 또는 빈문자열)
  ];

  return await mariadb.query("selectEquiList", params);
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

module.exports = {
  equiList
  , equiOneSelect
  , equiAdd
  , equiModify
  , equiHistoryList
}