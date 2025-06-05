<!--자재 발주서 관리-->
<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { ref, onMounted } from "vue"; // Import ref and onMounted
import axios from "axios";

import ArgonButton from "@/components/ArgonButton.vue";

import DefaultInfoCard from "@/examples/Cards/DefaultInfoCard.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";

const userData = ref([
  {
    id: 1,
    name: "홍길동",
    age: 28,
    email: "hong.gd@example.com",
    status: "Active",
    selected: true
  },
  {
    id: 2,
    name: "이순신",
    age: 45,
    email: "lee.ss@example.com",
    status: "Inactive",
    selected: true
  },
  {
    id: 3,
    name: "김유신",
    age: 33,
    email: "kim.ys@example.com",
    status: "Active",
    selected: true
  },
  {
    id: 4,
    name: "강감찬",
    age: 52,
    email: "kang.gc@example.com",
    status: "Pending",
    selected: true
  },
  {
    id: 5,
    name: "유관순",
    age: 20,
    email: "ryu.gs@example.com",
    status: "Active",
    selected: true
  },
  {
    id: 6,
    name: "안중근",
    age: 38,
    email: "ahn.jg@example.com",
    status: "Active",
    selected: true
  },
  {
    id: 7,
    name: "윤봉길",
    age: 25,
    email: "yoon.bg@example.com",
    status: "Inactive",
    selected: true
  },
  {
    id: 8,
    name: "세종대왕",
    age: 60,
    email: "sejong.d@example.com",
    status: "Active",
    selected: true
  },
]);

const productData = ref([
  {
    id: 1,
    name: "홍길동",
    age: 28,
    email: "hong.gd@example.com",
    status: "Active",
  },
  {
    id: 2,
    name: "이순신",
    age: 45,
    email: "lee.ss@example.com",
    status: "Inactive",
  },
  {
    id: 3,
    name: "김유신",
    age: 33,
    email: "kim.ys@example.com",
    status: "Active",
  },
  {
    id: 4,
    name: "강감찬",
    age: 52,
    email: "kang.gc@example.com",
    status: "Pending",
  },
  {
    id: 5,
    name: "유관순",
    age: 20,
    email: "ryu.gs@example.com",
    status: "Active",
  },
  {
    id: 6,
    name: "안중근",
    age: 38,
    email: "ahn.jg@example.com",
    status: "Active",
  },
  {
    id: 7,
    name: "윤봉길",
    age: 25,
    email: "yoon.bg@example.com",
    status: "Inactive",
  },
  {
    id: 8,
    name: "세종대왕",
    age: 60,
    email: "sejong.d@example.com",
    status: "Active",
  },
]);

const userColumns = [
  { 
    title: "선택", 
    field: "selected", 
    width: 80, 
    hozAlign: "center",
    formatter: "tickCross",
    editor: true,
    headerSort: false
  },
  { title: "자재코드", field: "name", width: 150, editor: "input" },
  { title: "발주일자", field: "age", hozAlign: "center", sorter: "number" },
  { title: "납기일자", field: "email", hozAlign: "left", formatter: "link" },
  { title: "업체코드", field: "cp_code", hozAlign: "left"},
  { title: "단가", field: "unit_price", hozAlign: "center"},
  { title: "합계", field: "total_price", hozAlign: "center"},
];

const productColumns = [
  { 
    title: "선택", 
    field: "selected", 
    width: 80, 
    hozAlign: "center",
    formatter: "tickCross",
    editor: true,
    headerSort: false
  },
  { title: "자재명", field: "name", width: 150, editor: "input" },
  { title: "수량", field: "age", hozAlign: "center", sorter: "number", editor: "input" },
  { title: "단위", field: "email", hozAlign: "left", formatter: "link", editor: "input" },
  { title: "단가", field: "cp_code", hozAlign: "left", editor: "input"},
  { title: "합계", field: "unit_price", hozAlign: "center"},
  { title: "색상", field: "total_price", hozAlign: "center", editor: "input"},
  { title: "사이즈", field: "total_price", hozAlign: "center", editor: "input"},
  { title: "발주일자", field: "total_price", hozAlign: "center", editor: "input"},
  { title: "납기일자", field: "total_price", hozAlign: "center", editor: "input"},
  { title: "주소", field: "total_price", hozAlign: "center", editor: "input"},
  { title: "비고", field: "total_price", hozAlign: "center", editor: "input"},
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
        <label class="form-label">검색항목 1</label>
        <input type="text" class="form-control" v-model="searchField1">
      </div>
      <div class="col-md-2">
        <label class="form-label">검색항목 2</label>
        <input type="text" class="form-control" v-model="searchField2">
      </div>
      <div class="col-md-2">
        <label class="form-label">검색항목 3</label>
        <input type="text" class="form-control" v-model="searchField3">
      </div>
      <div class="col-md-2">
        <label class="form-label">검색항목 4</label>
        <input type="text" class="form-control" v-model="searchField4">
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
              :table-data="userData"
              :table-columns="userColumns"
              :tabulator-options="{
                paginationSize: 7,
                rowClick: handleUserRowClick,
              }"
            />
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
</style>