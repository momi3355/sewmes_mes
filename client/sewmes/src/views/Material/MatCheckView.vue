<!--자재 수입검사 조회-->
<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { ref, onMounted } from "vue"; // Import ref and onMounted
import axios from "axios";
import Swal from 'sweetalert2';

import ArgonButton from "@/components/ArgonButton.vue";

import DefaultInfoCard from "@/examples/Cards/DefaultInfoCard.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import MatCheckModal from './MatCheckModal.vue';

const searchField1 = ref('');
const searchField2 = ref('');
const searchField3 = ref('');
const searchMaterialType = ref('');

const completedList = ref([]);
const completedListCard = ref(null);
const detailInfo = ref(null);

const getTabulatorInstance = (refInstance) => {
  if (!refInstance.value || !refInstance.value.$el) return null;
  const element = refInstance.value.$el.querySelector('.tabulator');
  return Tabulator.findTable(element)?.[0] || null;
};

// 아래 조회 버튼 클릭시 실행
const showDetails = async () => {
  const tabulatorInstance = getTabulatorInstance(completedListCard);
  if(!tabulatorInstance) return;

  const selectedRows = tabulatorInstance.getSelectedData();
  if (selectedRows.length === 0){
     Swal.fire({
      title: "",
      text: "조회할 항목을 선택하시오.",
      icon: "error"
    });
    return
  }
  const selectedItem = selectedRows[0];
  

  try{
    const response = await
    axios.get(`/api/material/matcheckdetail/${selectedItem.inbound_check_code}`);
    detailInfo.value = response.data;
  } catch (error) {
    console.error("상세 정보 조회 실패: ", error);
    detailInfo.value = null;
  }
};

const dateFormatter = (cell) => {
  const value = cell.getValue();

  if(!value){
    return "";
  }
  return value.split('T')[0];
};

const completedListColumns = [
  { title: "검사코드", field: "inbound_check_code" },
  { title: "자재명", field: "material_name", hozAlign: "left" },
  { title: "합격수량", field: "pass_qty", hozAlign: "left" },
  { title: "수입일자", 
    field: "inbound_date", 
    width: 150, 
    hozAlign: "left", 
    formatter: dateFormatter
  },
  { title: "검사결과", field: "check_status", hozAlign: "left"},
];


const fetchCompletedList = async () => {
  try{
    const response = await axios.get('/api/material/matcheckview');
    completedList.value = Array.isArray(response.data) ? response.data : [];
  } catch(error){
    console.error("완료 목록 조회 오류: ", error);
    completedList.value = [];
  }
};

const handleCheckComplete = async (checkData) => {
  try{
    console.log('전송된 검사결과', checkData);
    const response = await axios.post('/api/material/complete-check', checkData);

    if(response.data.success){
      alert('검사 결과가 저장되었습니다.');
      fetchCompletedList();
    } else {
      alert('저장에 실패했습니다: ' + response.data.message);
    }
  } catch(error){
    console.error('검사 결과 저장 API가 호출되지 않음', error);
    alert('서버 오류 발생');
  }
};

// 선택된 행들을 가져오는 함수
const getSelectedRows = (tableRef) => {
  if (tableRef) {
    const selectedRows = tableRef.getRows().filter(row => row.getData().selected);
    console.log("Selected rows:", selectedRows.map(row => row.getData()));
    return selectedRows;
  }
};

onMounted(() => {
  fetchCompletedList();
});
</script>

<template>
   <!-- 1. 가장 바깥쪽을 하나의 container-fluid로 감싸고, 내부 패딩을 조절합니다. -->
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">

        <!-- 2. 검색 영역 -->
        <div class="search-area bg-white rounded p-3 mb-4 shadow-sm">
          <div class="row align-items-end">
            <!-- 자재명 -->
            <div class="col-md-3">
              <label class="form-label search-label">자재명</label>
              <input type="text" class="form-control" v-model="searchProdName">
            </div>
            <div class="col-md-2">
            <label for="date" class="form-label search-label">수입일자</label>
            <div class="date-input-wrapper">
              <input type="date" id="date" class="form-control" max="2039-12-31" min="2000-01-01">
            </div>
          </div>
            <!-- 버튼 -->
            <div class="col-md-2 d-flex justify-content-end gap-2">
              <button class="btn btn-secondary" @click="resetFilter">초기화</button>
              <button class="btn btn-primary" @click="searchLotHistoryList">조회</button>
            </div>
          </div>
        </div>

        <!-- '수입처리 자재 목록' 테이블 -->
        <div class="row">
          <div class="col-md-12 d-flex flex-column">
            <tabulator-card
              ref="completedListCard"
              card-title="수입처리 자재 목록"
              :table-data="completedList"
              :table-columns="completedListColumns"
              :tabulator-options = "{
                selectableRows : 1
              }"
              height="700px"
            >
              <template #actions>
                <button class="btn btn-primary" @click="showDetails">조회</button>
                <!-- <ArgonButton color="info" variant="gradient">PDF로 저장</ArgonButton> -->
              </template>
            </tabulator-card>
          </div>
        </div>
        
        <table v-if="detailInfo" class="detail-table"> <!-- 스타일 충돌 방지를 위해 class 추가 권장 -->
  <tbody>
    <tr>
      <th>입고번호</th>
      <!-- 2. API로부터 받은 detailInfo 객체의 각 속성을 {{ }} 안에 넣어서 표시합니다. -->
      <td>{{ detailInfo.inbound_code }}</td>
      <th>자재명</th>
      <td colspan="2">{{ detailInfo.material_name }}</td>
    </tr>
    <tr>
      <th>수입일자</th>
      <!-- 날짜/시간 데이터에서 'T' 앞부분만 잘라서 YYYY-MM-DD 형식으로 보여줍니다. -->
      <td>{{ detailInfo.inbound_date ? detailInfo.inbound_date.split('T')[0] : '' }}</td>
      <th>합격수량</th>
      <td colspan="2">{{ detailInfo.pass_qty }}</td>
    </tr>
    <tr>
      <th>검사일자</th>
      <td>{{ detailInfo.check_date ? detailInfo.check_date.split('T')[0] : '' }}</td>
      <th>불합격수량</th>
      <td colspan="2">{{ detailInfo.total_defect_qty }}</td>
    </tr>
            
            <!-- 상세 검사 항목 부분은 나중에 구현하기 위해 일단 비워둠 -->
            <tr>
              <th colspan="5" class="section-header">검사 정보</th>
            </tr>
            <tr>
              <th>폭(cm)</th>
              <th>색상 일치</th>
              <th>오염 여부</th>
              <th>인장 강도</th>
              <td rowspan="2" class="result-pass">
                <!-- 여기에 최종 검사 결과를 표시할 수 있음 (예: 합격) -->
              </td>
            </tr>
            <tr>
              <td><!-- 폭 불합격 수량 --></td>
              <td><!-- 색상 불합격 수량 --></td>
              <td><!-- 오염 불합격 수량 --></td>
              <td><!-- 인장 강도 불합격 수량 --></td>
            </tr>
          </tbody>
        </table>

      </div> 
    </div>   
  </div>
</template>
<style scoped>
 .col-lg-12{
  margin-top: 85px;
}
 .searchbox{
  background-color: #FFFFFF;
  border-radius: 1rem;
  margin: 30px;
 }
 .btn{
  padding: 10px;
  margin: 0px;
 }
 .btn btn-secondary me-2{
  margin-right: 10px;

 }
 .check{
  margin-left: 96%;
 }
table.detail-table {
    border-collapse: collapse; 
    width: 900px; 
    border: 1px solid black;
    font-size: 1em;
    margin-left: auto; 
    margin-right: auto; 
    margin-top: 50px;
  }
  
  th, td {
    border: 1px solid black; 
    padding: 12px; 
    text-align: center; 
    vertical-align: middle; 
  }
  
  th {
    background-color: #E9E9E9; 
  }
  
  .section-header {
    background-color: #DDDDDD; 
  }
  
  .result-pass {
    font-size: 3em; 
    font-weight: bold; 
    color: #4CAF50; 
  }
  .savepdf {
    width: 150px;
    height: 40px;
    margin-top: 10px;
  }
  .btn-primary {
    width: 80px;
    margin-right: 10px;
  }
  .btn-secondary{
    width: 80px;
  } 
  .form-label{
    font-size: medium;
  }
  .date-input-wrapper::after {
  content: '📅';
  font-size: 1.2rem;
  color: #adb5bd;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none; 
}

.date-input-wrapper input[type="date"]::-webkit-calendar-picker-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  opacity: 0; 
  cursor: pointer;
}
</style>