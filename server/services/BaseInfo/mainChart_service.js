// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../../database/mapper.js");

const processChartList = async() => {
  let list = await mariadb.query("selectProcessChartUse").catch(err => console.log(err));
  return list;
}

const workInstToProcessCompleteList = async () => {
  let list = await mariadb.query("selectCompleteWorkInstToProcess").catch(err => console.log(err));
  return list
}

const dateOfProdList = async() => {
  let list = await mariadb.query("selectDateHowManyProd").catch(err => console.log(err));
  return list;
}

module.exports = {
  // 해당 객체에 등록해야지 외부로 노출
 processChartList, 
 workInstToProcessCompleteList, 
 dateOfProdList,
}