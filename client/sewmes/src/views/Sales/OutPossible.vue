<template>
  <div class="container-fluid p-3">
    <!-- 📦 주문 목록 + 상세 -->
<div class="container-fluid py-4" id="odlist">
  <div class="row gx-4">
    <!-- 주문서 목록1 -->
    <div class="col-lg-6 mb-4">
      <tabulator-card
        card-title="외주업체 목록"
        :table-data="companyData"
        :table-columns="companyColumns"
        :tabulator-options="{selectableRows : 1}"
        :on="selectCompany"
        style="height: 700px;"
      />
    </div>

    <!-- 주문서 목록2 -->
    <div class="col-lg-6 mb-4">
      <tabulator-card
        card-title="외주 가능 제품"
        :table-data="modalSelectList"
        :table-columns="outpossible"
        :tabulator-options="tabulatorOptionsDetail"
        style="height: 700px;"
      >
        <!-- actions 슬롯에 버튼을 삽입 -->
        <template #actions>
          <button class="btn btn-outline-secondary btn-sm me-2" id="openModal" @click="openModal">제품추가 🧾</button>
          <ArgonButton class="removebtn" color="danger" variant="gradient">삭제</ArgonButton>
          <argon-button color="success" variant="gradient" @click="saveEvent">저장</argon-button>
        </template>
      </tabulator-card>
    </div>
  </div>
</div>

  </div>
  
  <!-- 제품 추가 모달 -->
  <prodModal
    v-bind:isModalOpen="ModalState"
    @selectPlans="getlist"
    @close-modal="closeModal"
  />
</template>

<script setup>
import { ref, onMounted } from "vue";
// import { useStore } from 'vuex';
import axios from "axios";
import ArgonButton from "@/components/ArgonButton.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import prodModal from "./prodModal.vue";
import groupcodelist from "../../assets/js/utils/groupcodelist.js"

const companyData = ref([]); // 업체 정보
const modalSelectList = ref([]); // 모달에서 선택한 제품들
const ModalState = ref(false); // 모달 on/off 초기값 설정
const selectCpcode = ref(null); // 선택한 업체코드
const selectOutProd = ref([])

// 외주업체 목록
const companyColumns = [
  { title: "순번", field: "num", width: 70 },
  { title: "업체코드", field: "cpcode", width: 130 },
  { title: "업체명", field: "cpname", width: 130 },
  { title: "지역", field: "region", width: 90 },
  { title: "상태", field: "useyn", width: 100 },
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

// 백엔드 API 가지고 와서 필드에 업체목록 데이터 뿌려주기
const outcompanyList = async() => {
  try{
    const result = await axios.get('/api/outcompanyList');

    companyData.value = result.data.map((item,idx) => ({
    num : idx+ 1,
    cpcode : item.cp_code,
    cpname : item.cp_name,
    region : item.region,
    useyn : item.use_yn,
    firstreg : item.first_reg
    }));
    console.log(result.data);
    console.log("외주업체 목록 데이터", companyData);
  } catch(error){
    console.error("외주업체 목록 데이터 오류", error);
  }
};
  // 행 클릭시 작동될 이벤트 (선택한 업체)
const selectCompany =  [
  {
    eventName: "rowClick",
    eventAction: async (e, row) => {
    selectCpcode.value = row.getData().cpcode;

    const result = await axios.get(`/api/yesOutProdList?cpcode=${selectCpcode.value}`);
    selectOutProd.value = result.data.map()
    modalSelectList.value = []; // 선택될 때 마다 초기화
    
  }
}
];
  // 클릭한 행의 상세정보
  const tabulatorOptionsDetail = {};

  // 모달창
  const openModal = () => {
    ModalState.value = true;
  };

  const closeModal = () => {
    ModalState.value = false;
  };

  // 모달에서 선택한 제품 데이터
  const getlist = (modaldata) =>{
    console.log('자식한테 받아온 데이터', JSON.stringify(modaldata, null, 2));
    console.log('자식한테 받아온 데이터', modaldata);
    modalSelectList.value = modaldata;  
  };

  // 저장버튼 이벤트
  const saveEvent = async () => {
    try{
      for (const item of modalSelectList.value) {
        const selectData = {
          cp_code: selectCpcode.value,
          prod_code: item.prodcode
        };

        const res = await axios.post('/api/outProdCpInsert', selectData);
      if (res.data.success) {
        console.log(`제품 ${item.prodcode} 저장 성공`);
      } else {
        console.error(`제품 ${item.prodcode} 저장 실패`);
      }
      }
    
      if (res.data.success){
        console.log('저장되었습니다')
      } else{
        alert('저장에 실패했습니다.')
      }
    }catch(err){
      console.log('오류입니다', err)
      console.log('저장중 오류가 발생하였습니다')
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
