<script setup>

import { ref, onMounted } from "vue"; // Import ref and onMounted
import axios from "axios";


import ArgonButton from "@/components/ArgonButton.vue";
import DefaultInfoCard from "@/examples/Cards/DefaultInfoCard.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";



// 제품 데이터 및 컬럼 정의 (예시)
const productData = ref([

]);

const prodPrefColumns = [
  { title: "지시코드", field: "id", width: 80 },
  { title: "공정분류", field: "name", width: 180 },
  { title: "제품명", field: "category", width: 120 },
   { title: "지시수량", field: "category", width: 120 } ,
    { title: "생산량", field: "category", width: 120 },
    { title: "불량수량", field: "category", width: 120 },
    { title: "작업시작일", field: "category", width: 120 },
    { title: "작업종료일", field: "category", width: 120 }
];

// Tabulator 옵션에 전달할 함수 예시
const handleUserRowClick = (e, row) => {
  alert(`"${row.getData().name}" 행이 클릭되었습니다.`);
};



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
        <label class="form-label">공정분류</label>
        <input type="text" class="form-control" v-model="searchField2">
      </div>
      <div class="col-md-2">
        <label class="form-label"> 지시코드</label>
        <input type="text" class="form-control" v-model="searchField3">
      </div>
      <div class="col-md-2">
        <label class="form-label">담당자</label>
        <input type="text" class="form-control" v-model="searchField4">
      </div>
      <div class="col-md-2 d-flex align-items-end">
        <button class="btn btn-secondary me-2" @click="resetbtn">초기화</button>
        <button class="btn btn-primary" @click="searchAllField">조회</button>
      </div>
    </div>
    </div>
    <div class="col-12 mt-4">
              <tabulator-card
                card-title="생산실적목록"
                :table-data="productData"
                :table-columns="prodPrefColumns"
            />
    </div>

  
       
    <ProductionPlanModal
    v-bind:isModalOpen="isModalOpen"
    v-on:select-plans="handleSelectedPlans"
    v-on:close-modal="closeModal"
    />   
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
