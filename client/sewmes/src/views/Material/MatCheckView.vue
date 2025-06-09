<!--자재 수입검사 조회-->
<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { ref, onMounted } from "vue"; // Import ref and onMounted
import axios from "axios";

import ArgonButton from "@/components/ArgonButton.vue";

import DefaultInfoCard from "@/examples/Cards/DefaultInfoCard.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";

const searchField1 = ref('');
const searchField2 = ref('');
const searchField3 = ref('');
const searchMaterialType = ref('');

const userData = ref([
  {
    lot: "LOT-20250503001",
    mat_name: "원단이름",
    pass_qty: "355",
    nopass_qty: "1",
    inbound_date: "2025-05-01",
    check_date: "2025-05-03",
    check_result: "합격",
  },
]);



const userColumns = [
  {
  formatter: "rowSelection",  // 행 선택 체크박스를 생성합니다.
  // titleFormatter: "rowSelection", // 헤더에 '전체 선택' 체크박스를 생성합니다.
  hozAlign: "center",
  headerSort: false,          // 이 열은 정렬 기능을 비활성화합니다.
  cellClick: function(e, cell) { // 셀의 아무 곳이나 클릭해도 체크되도록 합니다.
    cell.getRow().toggleSelect();
  },
   width: 1
},
  { title: "LOT", field: "lot", width: 150, editor: "input" },
  { title: "자재명", field: "mat_name", hozAlign: "left", sorter: "number" },
  { title: "합격수량", field: "pass_qty", hozAlign: "left", formatter: "link" },
  { title: "불합격수량", field: "nopass_qty", hozAlign: "left"},
  { title: "수입일자", field: "inbound_date", hozAlign: "left"},
  { title: "검사일자", field: "check_date", hozAlign: "left"},
  { title: "검사결과", field: "check_result", hozAlign: "left"}
];


// 선택된 행들을 처리하는 함수
const handleUserRowClick = (e, row) => {
  console.log("Row clicked:", row.getData());
};

// 선택된 행들을 가져오는 함수
const getSelectedRows = (tableRef) => {
  if (tableRef) {
    const selectedRows = tableRef.getRows().filter(row => row.getData().selected);
    console.log("Selected rows:", selectedRows.map(row => row.getData()));
    return selectedRows;
  }
};

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
              :table-data="userData"
              :table-columns="userColumns"
              :tabulator-options="{
                paginationSize: 7,
                rowClick: handleUserRowClick,
              }"
            >
              <!-- 'actions' 슬롯에 버튼을 삽입합니다. -->
              <template #actions>
                <ArgonButton 
                  color="info" 
                  variant="gradient"
                  @click="saveAsPdf"
                >
                  PDF로 저장
                </ArgonButton>
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