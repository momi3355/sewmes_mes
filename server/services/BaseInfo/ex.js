// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../../database/mapper.js");
// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require('../../utils/converts.js');

// 실제 제공할 서비스 등록 영역

module.exports ={
    // 해당 객체에 등록해야지 외부로 노출

};