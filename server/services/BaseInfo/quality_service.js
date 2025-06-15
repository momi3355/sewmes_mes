// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../../database/mapper.js");
// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require('../../utils/converts.js');

// 실제 제공할 서비스 등록 영역

//전체 조회 + 검색 조회
const qualityList = async ({ testName, testTarget, testRef, useYn }) => {
  const params = [
    testName, testName, testName,
    testTarget, testTarget, testTarget,
    testRef, testRef, testRef,
    useYn, useYn, useYn,
  ];

  let list = await mariadb.query("selectQualityList", params)
    .catch(err => console.log(err));
  return list;
}

// 단건조회
const qualityOneSelect = async (qualityCode) => {
  let list = await mariadb.query("selectQualityInfo", qualityCode)
    .catch(err => console.log(err));

  let info = list[0];
  return info;
};

// 등록
const qualityAdd = async (qualityInfo) => {
  //코드 생성
  let creCode = await mariadb.query("createCodeProc", [ 't_quality', 'quality_code', 'Q' ]);
  // 결과가 affectedRows, 값 들어있는 배열 두개라서 두번째 배열의 0번째 값을 가져옴
  let newCode = creCode[1][0].newCode;
  qualityInfo.quality_code = newCode;

  //qualityInfo가 formData라서 객체로 들어가도록 별도 처리
  qualityInfo = JSON.parse(JSON.stringify(qualityInfo));
  const { fileName, originalName, filePath, ...qualityData } = qualityInfo;
  let resInfo = await mariadb.query("insertQualityinfo", qualityData)
    .catch(err => console.log(err));

    if(qualityInfo.fileName) {
    const imgParams = [newCode, qualityInfo.fileName, qualityInfo.originalName, qualityInfo.filePath];
    await mariadb.query("insertImages", imgParams).catch(err => console.log(err));
  }

  console.log(resInfo);
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

// 수정
const qualityModify = async (qualityCode, qualityInfo) => {
  qualityInfo = JSON.parse(JSON.stringify(qualityInfo));
  const { fileName, originalName, filePath, ...qualityData } = qualityInfo;
  let data = [qualityData, qualityCode];

  let resInfo = await mariadb.query("updateQualityinfo", data)
    .catch(err => console.log(err));

  if(qualityInfo.fileName) {
    const imgParams = [qualityCode, qualityInfo.fileName, qualityInfo.originalName, qualityInfo.filePath];
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
};


// 갱신
const qualityRenewal = async (qualityInfo) => {
  //트랜잭션 처리...
  const conn = await mariadb.getConnection();
  let result = null;
  try {
    await conn.beginTransaction();

    const renew = await mariadb.query("renewQuality", qualityInfo.qualityCode);
    const msg = renew[1][0].msg;

    console.log(msg);

    if (msg == 'OK') {
      const { qualityCode, ...updateFields } = qualityInfo;
      const data = [updateFields, qualityCode];
      const update = conn.query("updateQualityinfo", data);

      if (update.affectedRows > 0) {
        result = {
          isSuccessed: true,
        }
        await conn.commit();
      }
    } else if (msg == 'NG') {
      //프로시저 실패시 오류 떠넘김
      throw new Error();
    }
  } catch {
    //오류가 나면 롤백
    await conn.rollback();
    console.error(error);
    result = {
      isSuccessed: false,
    };
  } finally {
    conn.release();
  }
    return result;
};

//이력조회
const qualityHistoryList = async (qualityCode) => {
  let list = await mariadb.query("selectQualityHistory", qualityCode)
    .catch(err => console.log(err));
  return list;
};

//공통코드 조회
const groupCodeSearchList = async (groupCode) => {
  let list = await mariadb.query("groupCodeSearch", groupCode).catch(err => console.log(err));
  return list;
}

const groupCodeDetailInfo = async (detailCode) => {
  let list = await mariadb.query("detailCodeSearch", detailCode).catch(err => console.log(err));

  let info = list[0];
  return info;
}

module.exports = {
  // 해당 객체에 등록해야지 외부로 노출
  qualityList,
  qualityOneSelect,
  qualityAdd,
  qualityModify,
  qualityRenewal,
  qualityHistoryList,
  groupCodeSearchList,
  groupCodeDetailInfo
}