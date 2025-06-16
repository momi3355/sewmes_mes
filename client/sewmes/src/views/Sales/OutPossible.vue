<template>
  <div class="container-fluid p-3">
    <!-- 📦 주문 목록 + 상세 -->
<div class="container-fluid py-4" id="odlist">
  <div class="row gx-4">
    <!-- 주문서 목록1 -->
    <div class="col-lg-6 mb-4">
      <tabulator-card
        card-title="외주업체 목록"
        :table-data="companyList"
        :table-columns="companyColumns"
        :tabulator-options="tabulatorOptions"
        :on="tabulatorEvent"
        style="height: 700px;"
      />
    </div>

    <!-- 주문서 목록2 -->
    <div class="col-lg-6 mb-4">
      <tabulator-card
        card-title="외주 가능 제품"
        :table-data="OrderData"
        :table-columns="outpossible"
        :tabulator-options="tabulatorOptions"
        :on="tabulatorEvent"
        style="height: 700px;"
      >
        <!-- actions 슬롯에 버튼을 삽입 -->
        <template #actions>
          <button class="btn btn-outline-secondary btn-sm me-2" id="openModal">제품추가 🧾</button>
          <ArgonButton class="removebtn" color="danger" variant="gradient">삭제</ArgonButton>
          <argon-button color="success" variant="gradient" @click="saveOrder">저장</argon-button>
        </template>
      </tabulator-card>
    </div>
  </div>
</div>

  </div>
  
  <!-- 제품 추가 모달 -->
  <prodModal
    v-bind:isModalOpen="isModalOpen"
    @selectPlans="getlist"
    @close-modal="closeModal"
  />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from 'vuex';
import axios from "axios";
import ArgonButton from "@/components/ArgonButton.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import prodModal from "./prodModal.vue";
import groupcodelist from "../../assets/js/utils/groupcodelist.js"

const companyData = ref([]); // 업체 정보
const outProduct = ref([]); // 외주 가능 제품
const modalList = ref([]); // 모달에서 선택한 제품
const checkProd = ref([]); // 체크선택 한 제품

// 외주업체 목록
const companyColumns = [
  { title: "순번", field: "num", width: 70 },
  { title: "업체코드", field: "cpcode", width: 130 },
  { title: "업체명", field: "cpName", width: 130 },
  { title: "지역", field: "region", width: 90 },
  { title: "상태", field: "address", width: 100 },
  { title: "등록날짜", field: "firstreg", width: 100 },
];

// 외주 가능 제품
const outpossible = [
  {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerSort:false, width: 20,},
  { title: "순번", field: "num", width: 70 },
  { title: "제품코드", field: "prodcode", width: 80 },
  { title: "제품명", field: "prodname", width: 150 },
  { title: "카테고리", field: "category", width: 80 },
  { title: "색상", field: "color", width: 80 },
  { title: "사이즈", field: "size", width: 100 },
];

// 백엔드 API 가지고 와서 필드에 데이터 뿌려주기
const outcompanyList = async() => {
  try{
    const result = awaitaxios.get('/api/companyList');

    companyData.value = result.data.map((item,idx) => ({
    num : idx+ 1,
    cpcode : companyData.cp_code

    }));
    console.log(result.data);
    console.log("외주업체 목록 데이터");
  } catch(error){
    console.error("외주업체 목록 데이터 오류", error);
  }
};

onMounted(() => {
  outcompanyList();
});
</script>

<style scoped>
.search-color { margin: 10px; padding: 20px; border-radius: 1rem; background-color: #fff; }
#openModal{
  margin: 0px;
}
</style>
