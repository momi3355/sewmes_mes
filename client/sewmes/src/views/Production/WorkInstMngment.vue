<script setup>
import { ref } from "vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import ProductionPlanModal  from "./ProductionPlanModal.vue";
import axios from 'axios';
//실제 작업지시 데이터
const workInstData = ref([]); //초기에는 빈값
//작업지시컬럼
const workInstColumns = [
  {
     formatter: "rowSelection", // Tabulator.js의 행 선택 포맷터 사용
    titleFormatter: "rowSelection", // 헤더에도 전체 선택/해제 체크박스 표시
    hozAlign: "center", // 가운데 정렬
    headerSort: false, // 헤더 클릭 시 정렬 방지
    width: 80, // 컬럼 너비
    cssClass: 'tabulator-checkbox-column' // 필요에 따라 CSS 클래스 추가
  },
  { title: "NO", field: "NO", width: 80 },
  { title: "작업지시코드", field: "instcd", width: 180 },
  { title: "생산계획코드", field: "plancd", width: 180 },
  { title: "제품명", field: "prdname", width: 180 },
  { title: "지시수량", field: "instqty", width: 180 , editor: "input" },
  { title: "작업시작일", field: "worksd", width: 180 },
  { title: "작업종료일", field: "workdd", width: 180 },
  { title: "납기일자", field: "dd", width: 180 },
  { title: "상태", field: "state", hozAlign: "center" },
];
//생산계획 모달에서 데이터받아, 작업지시서 화면의 그리드에 표시될 데이터 추가하는 함수
const handleSelectedPlans =(plans)=>{
  const newWorkInsts = plans.map((plan,index)=>({
      NO : workInstData.value.length+index+1,
      instcd :'', //지시코드 자동생성 저장전에는 빈값
      plancd: plan.prod_plan_code,
      prdname:plan.prod_code,
      instqty: plan.prod_qty, //자동생성 , 수동입력가능
      worksd: plan.start_date,
      workdd: plan.end_date,
      dd: plan.dead_date, //주문상세테이블과 조인해서 가져올 납기일자
      state:'생산 전' //초기상태
  }));
   workInstData.value = [...workInstData.value, ...newWorkInsts];
}

//  모달 표시 상태 
const isModalOpen = ref(false); //초기상태
const openModal=()=>{
  isModalOpen.value =  true; //isModalOpen 값 true 변경해 모달 열기
};
const closeModal=()=>{
  isModalOpen.value =  false;
};

//검색필드용 반응형 변수들 선언/ 입력값  컨테이너 , 실제 검색 동작은 별도 함수 호출 선언언
const searchField1 = ref(''); //작업일시
const searchField2 = ref(''); //제품명
const searchField3=ref(''); //지시상태
const searchField4 =ref(''); //담당자자

//tabulatorCardRef 컴포넌트의 ref 선언
const tabulatorCardRef = ref(null);

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
        <button class="btn btn-secondary me-2" @click="resetbtn">초기화</button>
        <button class="btn btn-primary" @click="searchAllField">조회</button>
      </div>
    </div>
    </div>
        <!-- 생산계획서목록 모달 버튼/작업지시서 저장버튼 -->
    <div class="row mt-3">
      <div class="col-12">
        <button class="btn btn-info" @click="openModal">생산계획서 불러오기</button>
        <button class="btn btn-success ms-2" @click="saveWorkInstructions">저장</button>
      </div>
    </div>

    <!-- 편집가능 그리드 -->
      <div class="col-12 mt-4">
              <tabulator-card
                ref="tabulatorCardRef"
                card-title="작업지시서 작성"
                :table-data="workInstData"
                :table-columns="workInstColumns"
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