<template>
<div class="card detail-form" id="card">
  <div class="card-body p-4">
    <div class="row g-3 align-items-center">
      <div class="col-md-3 fw-bold">업체명:</div>
      <div class="col-md-9">
        <input 
  type="text" 
  class="form-control" 
  :value="searchTerm" 
  @input="setSearchTerm" 
  @blur="() => setListOpen(false)" 
  @focus="() => setListOpen(true)" 
/>
      </div>

      <div class="col-md-3 fw-bold">업체 연락처:</div>
      <div class="col-md-9">
        <input type="text" class="form-control" v-model="companyTel" />
      </div>

      <div class="col-md-3 fw-bold">주소:</div>
      <div class="col-md-9">
        <input type="text" class="form-control" v-model="address" />
      </div>

      <div class="col-md-3 fw-bold">주문일자:</div>
      <div class="col-md-9">
        <input type="text" class="form-control" v-model="orderdate" />
      </div>

      <div class="col-md-3 fw-bold">납기일자:</div>
      <div class="col-md-9">
        <input type="text" class="form-control" v-model="deaddate" />
      </div>

      <div class="col-md-3 fw-bold">영업 담당자 연락처:</div>
      <div class="col-md-9">
        <input type="text" class="form-control" v-model="salesTel" />
      </div>

      <div class="col-md-3 fw-bold">영업 담당자:</div>
      <div class="col-md-9">
        <input type="text" class="form-control" v-model="salesManager" />
      </div>

      <div class="col-md-3 fw-bold">비고:</div>
      <div class="col-md-9">
        <textarea class="form-control" rows="3" v-model="note"></textarea>
      </div>
    </div>
  </div>
              <div class="card-footer d-flex justify-content-end pt-0">
                <button class="btn btn-outline-secondary btn-sm me-2" @click="openModal">제품추가 🧾</button>
              <argon-button color="secondary" variant="gradient" class="me-2" id="arbtn">삭제</argon-button>
              <argon-button color="success" variant="gradient" id="arbtn">저장</argon-button>
            </div>
            <tabulator-card
            card-title=""
            :table-data="ordlist"
            :table-columns="OrderColumns"
            :tabulator-options="ordlist"
            :on="tabulatorEvent"
            style="height: 400px;"
          />
</div>
      <prodModal
      v-bind:isModalOpen="isModalOpen"
      @selectPlans="getlist"
      @close-modal="closeModal"
      />
</template>

<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { ref, onMounted } from "vue"; // Import ref and onMounted
import axios from "axios";
import ArgonButton from "@/components/ArgonButton.vue";
import DefaultInfoCard from "@/examples/Cards/DefaultInfoCard.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import prodModal from "./prodModal.vue";

const isModalOpen = ref(false); //초기상태
const ordlist = ref([]);

const OrderColumns = [
  { title: "제품명", field: ordlist.prod_name, width: 100, hozAlign: "center",  },
  { title: "색상", field: "color", width: 100, hozAlign: "center" },
  { title: "사이즈", field: "size", width: 100, hozAlign: "center" },
  { title: "규격", field: "num", width: 150, hozAlign: "center" },
  { title: "수량", field: "num", width: 100, hozAlign: "center" },
  { title: "총수량", field: "num", width: 100, hozAlign: "center" },
  { title: "단가(1box)", field: "unit_price", width: 150, hozAlign: "center" },
  { title: "합계", field: "num", width: 150, hozAlign: "center" }
];

onMounted(async () => {

  try {
    const res = await axios.get('/api/productList'); // ✅ 백엔드 API 호출

    // ✅ 응답 데이터를 OrderData에 넣기
    OrderData.value = res.data.map((item, ) => ({
      prod_name: item.prod_name,
      // ordercode: item.order_code,
      // companyName: item.cp_name,
      // totalQty: item.qty,
      // orderdate: item.order_date,
      // deaddate: item.dead_date,
      // companyTel: item.cp_tel,
      // salesManager: '심재진',
      // salesTel: '0103213',
      // address: item.address,
      // note: item.note,
      // status: item.state
    }));

    console.log('📦 DB에서 받아온 데이터:', OrderData.value);
  } catch (error) {
    console.error('❌ 주문 목록 로딩 실패:', error.message);
  }
});
const getlist = (asdf) =>{
  console.log('자식한테 받아온 데이터', asdf)
  ordlist.value = asdf;
};

const openModal = () => {
    isModalOpen.value = true; //isModalOpen 값 true 변경해 모달 열기
};
const closeModal = () => {
    isModalOpen.value = false;
};

</script>

<style>
/* 주문 상세 카드 내부의 제품 테이블 */
#card{
  width: 1500px;
  margin: auto;
}
#tabulator-card{
    width: 1500px;
  margin: auto;
}

/* 테이블 스타일 */


#arbtn{
  width: 65px;
  height: 40px;
}
</style>