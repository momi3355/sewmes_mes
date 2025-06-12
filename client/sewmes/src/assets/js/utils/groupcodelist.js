const groupCodeList = async (groupCode, targetList) => {
  let list = await axios.get(`/api/groupCode/gc/${groupCode}`);
  targetList.value = list.data;
  return targetList;
}

const detailCodeInfo = async (detailCode) => {
  let info = await axios.get(`/api/groupCode/dc/${detailCode}`);
  return info.data;
}

export default {
  groupCodeList,
  detailCodeInfo,
}