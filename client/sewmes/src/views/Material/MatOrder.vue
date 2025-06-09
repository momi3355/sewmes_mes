<!--자재 발주서 -->
<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { ref, onMounted } from "vue"; // Import ref and onMounted
import axios from "axios";

import ArgonButton from "@/components/ArgonButton.vue";

import DefaultInfoCard from "@/examples/Cards/DefaultInfoCard.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";

const materialData = ref([
  {
    id: 1,
    matcode: "MAT-001",
    matname: "원자재001",
    company: "원자재판매처",
    mat_category: "원자재",
    stock: "0",
  },
  {
     id: 1,
    matcode: "MAT-002",
    matname: "원자재002",
    company: "원자재판매처",
    mat_category: "원자재",
    stock: "1",
  },
]);

const productData = ref([
  {
    id: 1,
    matname: "",
    qty: "",
    unit: "",
    unit_price: "",
    total_price: "",
    color: "",
    size: "",
    order_date: "",
    deadline: "",
    address: "", 
    note: "",
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
  { title: "자재코드", field: "matcode", width: 150, editor: "input" },
  { title: "자재명", field: "matname", hozAlign: "left"},
  { title: "공급처", field: "company", hozAlign: "left"},
  { title: "자재유형", field: "mat_category", hozAlign: "left"},
  { title: "재고량", field: "stock", hozAlign: "left"},
];

const productColumns = [
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
  { title: "자재명", field: "matname", width: 150, editor: "input" },
  { title: "수량", field: "qty", hozAlign: "left", sorter: "number", editor: "input" },
  { title: "단위", field: "unit", hozAlign: "left", formatter: "link", editor: "input" },
  { title: "단가", field: "unit_price", hozAlign: "left", editor: "input"},
  { title: "합계", field: "total_price", hozAlign: "left"},
  { title: "색상", field: "color", hozAlign: "left", editor: "input"},
  { title: "사이즈", field: "size", hozAlign: "left", editor: "input"},
  { title: "발주일자", field: "order_date", hozAlign: "left"},
  { title: "납기일자", field: "deadline", hozAlign: "left"},
  { title: "주소", field: "address", hozAlign: "left", editor: "input"},
  { title: "비고", field: "note", hozAlign: "left", editor: "input"},
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
      <div class="col-md-2 d-flex align-items-end">
        <button class="btn btn-secondary me-2">초기화</button>
        <button class="btn btn-primary">조회</button>
      </div>
    </div>
        <div class="row mt-4">
          <div class="col-lg-12">
            <tabulator-card
              card-title="공급할 자재 목록"
              :table-data="materialData"
              :table-columns="materialColumns"
              :tabulator-options="{
                paginationSize: 7,
                rowClick: handleMatRowClick,
              }"
            />
              <div class="button-container">
                <ArgonButton 
                  class="addbutton"
                  color="info" 
                  variant="gradient"
                  @click="add"
                >
                  추가
                </ArgonButton>
              </div>


          </div>
            <div class="col-12 mt-4">
              <tabulator-card
                card-title="발주 요청서 작성"
                :table-data="productData"
                :table-columns="productColumns"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
<style scoped>
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
 .button-container{
  display: flex;
  justify-content: center;
 }
 .addbutton{
  width: 140px;
  margin-top: 25px;
 }
</style>