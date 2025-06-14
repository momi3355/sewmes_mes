<!--자재 수입검사 조회-->
<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { ref, onMounted } from "vue"; // Import ref and onMounted
import axios from "axios";

import ArgonButton from "@/components/ArgonButton.vue";

import DefaultInfoCard from "@/examples/Cards/DefaultInfoCard.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import MatCheckModal from './MatCheckModal.vue';

const searchField1 = ref('');
const searchField2 = ref('');
const searchField3 = ref('');
const searchMaterialType = ref('');

const completedList = ref([]);
const matCheckModalRef = ref(null);
const selectedDetail = ref(null);



const completedListColumns = [
  { title: "검사코드", field: "inbound_check_code" },
  { title: "자재명", field: "material_name", hozAlign: "left" },
  { title: "합격수량", field: "pass_qty", hozAlign: "left" },
  { title: "수입일자", field: "inbound_date", hozAlign: "left"},
  { title: "검사일자", field: "check_date", hozAlign: "left"},
  { title: "검사결과", field: "check_status", hozAlign: "left"},
];


// 선택된 행들을 처리하는 함수
const handleRowClick = async (e, row) => {
  const rowData = row.getData();
  console.log("Row clicked:", rowData);
  try{
    const response = await axios.get(`/api/material/matcheckdetail/${rowData.inbound_check_code}`);
    console.log("상세정보: ", response.data);
  } catch(error){
    console.error("상세 정보조회 오류", error);
  }
};

const fetchCompletedList = async () => {
  try{
    const response = await axios.get('/api/material/matcheckview');
    completedList.value = response.data;
  } catch(error){
    console.error("완료 목록 조회 오류: ", error);
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
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">
        <!-- 상단 검색 영역 -->
        <div class="row searchbox mb-3">
          <div class="col-md-2">
            <label class="form-label">자재명</label>
            <input type="text" class="form-control" v-model="searchField1">
          </div>
          <div class="col-md-2">
            <label class="form-label">자재코드</label>
            <input type="text" class="form-control" v-model="searchField2">
          </div>
          <div class="col-md-2">
            <label class="form-label">공급처</label>
            <input type="text" class="form-control" v-model="searchField3">
          </div>
          <!--드롭다운-->
  <div class="col-md-2">
    <label for="material-type" class="form-label">검사결과</label>
    <select id="material-type" class="form-control" v-model="searchMaterialType">
      <option value="">전체</option>
      <option value="합격">합격</option>
      <option value="불합격">불합격</option>
    </select>
  </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-secondary me-2">초기화</button>
            <button class="btn btn-primary">조회</button>
          </div>
        </div>

        <div class="row mt-4">
          <div class="col-lg-12">
            <tabulator-card
              card-title="수입처리 자재 목록"
              :table-data="completedList"
              :table-columns="completedListColumns"
              :tabulator-options="{
                paginationSize: 7,
                rowClick: handleRowClick,
              }"
            >
              <!-- 'actions' 슬롯에 버튼을 삽입합니다. -->
              <template #actions>
                <ArgonButton 
                  color="info" 
                  variant="gradient"
                  @click="saveAsPdf"
                >PDF로 저장</ArgonButton>
              </template>
            </tabulator-card>
          </div>
        </div>
        
        <table>
          <tbody>
            <tr>
              <th>입고번호</th>
              <td></td>
              <th>자재명</th>
              <td colspan="2"></td>
            </tr>
            <tr>
              <th>수입일자</th>
              <td></td>
              <th>합격수량</th>
              <td colspan="2"></td>
            </tr>
            <tr>
              <th>검사일자</th>
              <td></td>
              <th>불합격수량</th>
              <td colspan="2"></td>
            </tr>
            <tr>
              <th colspan="5" class="section-header">검사 정보</th>
            </tr>
            <tr>
              <th>폭(cm)</th>
              <th>색상 일치</th>
              <th>오염 여부</th>
              <th>인장 강도</th>
              <td rowspan="2" class="result-pass">합격</td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div> 
    </div>   
  </div>     <!-- "py-4 container-fluid" -->
  <MatCheckModal ref="matCheckModalRef" @complete="handleCheckComplete" />
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
table {
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
</style>