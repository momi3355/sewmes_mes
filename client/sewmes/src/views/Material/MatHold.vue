<!--예약 자재 재고 조회-->
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

const materialData = ref([
  {
    product_code: "PRD-001",
    mat_code: "MAT-001",
    mat_name: "면 원단(화이트)",
    mat_category: "원자재",
    company: "원자재공급처",
    hold_qty: "800",
    unit: "개",
    lot: "LOT-20250503-001",
    inbound_date: "2025-05-03",
    complete_yn: "N",
  },
  {
    id: 2,
   product_code: "PRD-002",
    mat_code: "MAT-002",
    mat_name: "면 원단(블랙)",
    mat_category: "원자재",
    company: "원자재공급처",
    hold_qty: "800",
    unit: "개",
    lot: "LOT-20250503-001",
    inbound_date: "2025-05-03",
    complete_yn: "N",
  },
]);



const materialColumns = [
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
  { title: "생산코드", field: "product_code", width: 150, hozAlign: "center", sorter: "number" },
  { title: "자재코드", field: "mat_code", width: 200, hozAlign: "left", formatter: "link" },
  { title: "자재명", field: "mat_name", hozAlign: "left"},
  { title: "자재유형", field: "mat_category", width: 150, hozAlign: "center"},
  { title: "공급처", field: "company", width: 200,hozAlign: "center"},
  { title: "홀드수량", field: "hold_qty", width: 150, hozAlign: "center"},
  { title: "단위", field: "unit", width: 80, hozAlign: "center"},
  { title: "LOT", field: "lot", width: 250, hozAlign: "center"},
  { title: "입고일자", field: "inbound_date", width: 150, hozAlign: "center"},
  { title: "완료여부", field: "complete_yn", width: 120, hozAlign: "center"},
];


// 선택된 행들을 처리하는 함수
const handleMatRowClick = (e, row) => {
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
            <!-- 
              수정된 부분: 
              1. 버튼을 TabulatorCard 안으로 옮깁니다.
              2. <template #actions>로 감싸줍니다.
            -->
            <tabulator-card
              card-title="예약 자재 목록"
              :table-data="materialData"
              :table-columns="materialColumns"
              :tabulator-options="{
                paginationSize: 7,
                rowClick: handleMatRowClick,
              }"
            >
              <!-- actions 슬롯에 버튼을 삽입합니다 -->
              <template #actions>
                <ArgonButton class="removebtn"color="danger" variant="gradient">
                  삭제
                </ArgonButton>
              </template>
            </tabulator-card>
          </div>
        </div>
        
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
 .btn-secondary.me-2{
  margin-right: 10px;
 }
 .removebtn{
  width: 70px;
 }
</style>