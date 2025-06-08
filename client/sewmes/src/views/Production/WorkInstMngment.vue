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
  { title: "생산계획코드", field: "plancd", width: 180  , editor: "input" },
  { title: "제품코드", field: "prdcode", width: 180  , editor: "input"},
  { title: "지시수량", field: "instqty", width: 180 , editor: "input" },
  { title: "작업시작일", field: "worksd", width: 180 },
  { title: "작업종료일", field: "workdd", width: 180 },
  { title: "납기일자", field: "dd", width: 180 , editor: "input"},
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
      worksd: '',
      workdd: '',
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

//행추가 함수(생산계획 목록 없이 작업지시 생성) 
const addRow=()=>{
  //새로운 행을 위한 NO값 생성
  const newNo =workInstData.value.length>0 ? Math.max(...workInstData.value.map(item=>item.NO||0))+1:1;
  //새로운 빈 행 데이터 객체 생성
  const newRow={
    NO:newNo,
    instcd :'', //지시코드 자동생성 저장전에는 빈값
    plancd: '',
    prdname:'', //제품
    instqty: 0, //지시수량 사용자입력 
    worksd: '', //작업공정에서 자동입력
    workdd: '', //작업공정에서 자동입력
    dd: '', //주문상세테이블과 조인해서 가져올 납기일자
    state:'생산 전' //초기상태
  }
  workInstData.value.push(newRow);
}
// 저장 함수
const saveWorkInstructions= async()=>{
  try{//모든작업지시 데이터 가져오기 
    const dataToSave = workInstData.value;
    if(dataToSave.length===0){
      alert("저장할 작업지시데이터가 없습니다.");
      return;
    }

    const response = await axios.post('/workInstMngment/save',{
        workInstructions: dataToSave
    });
    //성공/실패 응답처리
    if(response.data.success){
      alert("작업지시가 성공적으로 저장되었습니다.");
    }else{
      console.error("작업지시 저장 실패",response.data.message);
    }
  }catch(error){
      console.error("작업지시 저장 중 오류 발생:",error);
      if(error.response){
        console.error("서버오류");
      }else if(error.request){
        console.error("네트워크 오류: 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요.");
      }else{
        console.error(`예상치 못한 오류: ${error.message}`);
      }
  }
}
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
        <button class="btn btn-success ms-2 " @click="saveWorkInstructions">저장</button>
        <button class="btn btn-secondary ms-2" @click="addRow">행추가</button>
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