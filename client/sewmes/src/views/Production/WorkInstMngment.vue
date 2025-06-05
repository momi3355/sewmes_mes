<script setup>
import { ref } from "vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";

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
</script>

<template>
  <div class="container-fluid p-3">
    <div class="row search-color">
    <!-- 상단 검색 영역 -->
    <div class="row mb-3">
      <div class="col-md-2">
        <label class="form-label">작업일시</label>
        <input type="text" class="form-control" v-model="searchField1">
      </div>
      <div class="col-md-2">
        <label class="form-label">제품명</label>
        <input type="text" class="form-control" v-model="searchField2">
      </div>
      <div class="col-md-2">
        <label class="form-label"> 지시상태</label>
        <input type="text" class="form-control" v-model="searchField3">
      </div>
      <div class="col-md-2">
        <label class="form-label">담당자</label>
        <input type="text" class="form-control" v-model="searchField4">
      </div>
      <div class="col-md-2 d-flex align-items-end">
        <button class="btn btn-secondary me-2">초기화</button>
        <button class="btn btn-primary">조회</button>
      </div>
    </div>
    </div>

    <!-- 편집가능 그리드 -->
    <div class="row">
     
     
      
    </div>
  </div>
</template>

<style scoped>
.search-color {
  margin: 10px;
  padding: 20px;
  border-radius: 15px;
  background-color: #FFF;
}
</style>