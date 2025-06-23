<!--자재 발주서 조회-->
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
    mat_code: "",
    mat_name: "",
    company: "",
    category: "",
    order_date: "",
  },
]);



const userColumns = [
  {
  formatter: "rowSelection",  // 행 선택 체크박스를 생성합니다.
  titleFormatter: "rowSelection", // 헤더에 '전체 선택' 체크박스를 생성합니다.
  hozAlign: "center",
  headerSort: false,          // 이 열은 정렬 기능을 비활성화합니다.
  cellClick: function(e, cell) { // 셀의 아무 곳이나 클릭해도 체크되도록 합니다.
    cell.getRow().toggleSelect();
  },
   width: 1
},
  { title: "자재코드", field: "mat_code", width: 150, editor: "input" },
  { title: "자재명", field: "mat_name", hozAlign: "center", sorter: "number" },
  { title: "공급처", field: "company", hozAlign: "left", formatter: "link" },
  { title: "자재유형", field: "category", hozAlign: "left"},
  { title: "발주일자", field: "order_date", hozAlign: "center"},
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
    <label class="form-label">공급처</label>
    <input type="text" class="form-control" v-model="searchField3">
  </div>

  <!-- '수입일자'를 '자재유형' 드롭다운으로 변경 -->
  <div class="col-md-2">
    <label for="material-type" class="form-label">자재유형</label>
    <select id="material-type" class="form-control" v-model="searchMaterialType">
      <option value="">전체</option>
      <option value="원자재">원자재</option>
      <option value="부자재">부자재</option>
      <option value="소모품">소모품</option>
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
              card-title="자재 발주서 목록"
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
        <th>자재명</th>
        <td colspan="3"></td>
        <th>수량</th>
        <td></td>
      </tr>
      <tr>
        <th>사이즈</th>
        <td></td>
        <th>단위</th>
        <td></td>
        <th>단가</th>
        <td></td>
      </tr>
      <tr>
        <th>색상</th>
        <td colspan="3"></td>
        <th>합계</th>
        <td></td>
      </tr>
      <tr>
        <th>공급처</th>
        <td colspan="5"></td>
      </tr>
      <tr>
        <th>주소</th>
        <td colspan="5"></td>
      </tr>
      <tr>
        <th>주문일자</th>
        <td colspan="5"></td>
      </tr>
      <tr>
        <th>납기일자</th>
        <td colspan="5"></td>
      </tr>
      <tr class="row-memo">
        <th>비고</th>
        <td colspan="5"></td>
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
    border-collapse: collapse; /* 셀 테두리를 한 줄로 합칩니다. */
    width: 100%; /* 테이블 전체 너비를 100%로 설정 */
    max-width: 900px; /* 테이블 최대 너비 (선택 사항) */
    border: 1px solid #888; /* 바깥쪽 전체 테두리 */
    font-size: 0.9em;
    margin-left: auto; 
    margin-right: auto; 
    margin-top: 50px;
  }
  /* 모든 셀(th, td)에 대한 공통 스타일 */
  th, td {
    border: 1px solid #ccc; /* 셀 테두리 (회색) */
    padding: 10px; /* 셀 내부 여백 */
    text-align: center; /* 텍스트 가운데 정렬 */
    vertical-align: middle; /* 세로 가운데 정렬 */
  }
  /* 헤더 셀(th)에 대한 스타일 */
  th {
    background-color: #E9E9E9; /* 헤더 배경색 (회색) */
    font-weight: bold;
  }
  /* 첫 번째 열의 헤더 너비 고정 */
  th:first-child {
    width: 120px;
  }
  /* '비고' 행의 높이 조절 */
  .row-memo th,
  .row-memo td {
    height: 80px; 
  }
  tbody tr:nth-child(1) td:last-child,
  tbody tr:nth-child(2) td:last-child,
  tbody tr:nth-child(3) td:last-child {
  width: 200px; /* 원하시는 너비로 조절하세요 */
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
 .btn-secondary.me-2{
  margin-right: 10px;
  width: 70px;
 }
 .removebtn{
  width: 70px;
 }
 .form-label {
  font-size: large;
  margin: 10px;
  margin-top: 12px;
}
.mb-3 {
  height: 120px;
  margin: 0px;
}
.form-control {
  margin-left: 5px;
}
.btn.btn-secondary.me-2 {
  margin: 13px;
}  
.btn.btn-primary {
  margin: 13px;
  width: 60px;
}
.col-md-2 {
  padding-bottom: 15px;
}
select.form-control {
  /* 1. 기본 브라우저 화살표 숨기기 */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  /* 2. 배경 이미지로 SVG 화살표 아이콘 추가 */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right .75rem center; /* 오른쪽 끝에서 약간 떨어진 중앙에 위치 */
  background-size: 16px 12px;
  
  /* 3. 텍스트가 화살표를 덮지 않도록 오른쪽 패딩 추가 */
  padding-right: 2.5rem;
}
</style>