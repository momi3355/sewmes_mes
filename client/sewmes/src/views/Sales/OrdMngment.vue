<template>
  <div class="container">
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="row">
          <div class="col-lg-3 col-md-6">
            <default-info-card
              title="Sales"
              value="$103,430"
              description="<span
                class='text-sm font-weight-bolder text-success'
                >+5%</span> than last month"
            />
            <argon-button>버튼</argon-button>
          </div>
        </div>
        <div class="row mt-4">
          <div class="col-12"></div>
        </div>
        <div class="row mt-4">
          <div class="col-lg-12" id="AAA">
            <tabulator-card
              card-title="사용자 목록"
              :table-data="userData"
              :table-columns="userColumns"
              :tabulator-options="{
                paginationSize: 7,
                rowClick: handleUserRowClick,
              }"
            />
          </div>
          <div class="row">
            <div class="col-6 mt-4" id="BBB">
              <tabulator-card
                card-title="제품 재고 현황"
                :table-data="productData"
                :table-columns="productColumns"
              />
            </div>
            <div class="col-6 mt-4" id="CCC">
              <tabulator-card
                card-title="제품 재고 현황"
                :table-data="productData"
                :table-columns="productColumns"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { ref, onMounted } from "vue"; // Import ref and onMounted
import axios from "axios";

import ArgonButton from "@/components/ArgonButton.vue";

import DefaultInfoCard from "@/examples/Cards/DefaultInfoCard.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";

// 사용자 데이터 및 컬럼 정의
const userData = ref([
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
  { title: "ID", field: "id", width: 50, hozAlign: "center" },
  { title: "이름", field: "name", width: 150, editor: "input" },
  { title: "나이", field: "age", hozAlign: "center", sorter: "number" },
  { title: "이메일", field: "email", hozAlign: "left", formatter: "link" },
  {
    title: "상태",
    field: "status",
    hozAlign: "center",
    formatter: "tag",
    editor: "list",
    editorParams: { values: ["Active", "Inactive", "Pending"] },
  },
  {
    title: "액션",
    formatter: "buttonCross",
    width: 80,
    hozAlign: "center",
    cellClick: (e, cell) => {
      /* 삭제 로직 */ alert(`사용자 ${cell.getData().name} 삭제`);
      cell.getRow().delete();
    },
  },
];

// 제품 데이터 및 컬럼 정의 (예시)
const productData = ref([
  { id: 101, name: "노트북", category: "전자제품", price: 1200, stock: 50 },
  { id: 102, name: "마우스", category: "전자제품", price: 25, stock: 200 },
  { id: 103, name: "키보드", category: "전자제품", price: 75, stock: 120 },
  { id: 104, name: "모니터", category: "전자제품", price: 300, stock: 30 },
]);

const productColumns = [
  { title: "제품 ID", field: "id", width: 80 },
  { title: "제품명", field: "name", width: 180 },
  { title: "카테고리", field: "category", width: 120 },
  {
    title: "가격",
    field: "price",
    hozAlign: "right",
    formatter: "money",
    formatterParams: { symbol: "$", precision: 0 },
  },
  { title: "재고", field: "stock", hozAlign: "center" },
];

// Tabulator 옵션에 전달할 함수 예시
const handleUserRowClick = (e, row) => {
  alert(`"${row.getData().name}" 행이 클릭되었습니다.`);
};

// 동적으로 데이터 업데이트 예시 (버튼 클릭 시)
// const updateUserData = () => {
//   userData.value = [
//     ...userData.value,
//     { id: userData.value.length + 1, name: "새로운 사용자", age: 22, email: "new@example.com", status: "Pending" }
//   ];
// };

</script>

<style scoped>
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
