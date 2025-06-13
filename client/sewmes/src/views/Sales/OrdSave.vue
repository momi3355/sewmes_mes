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
            :tabulator-options="tabulatorOptions"
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
import { ref, onMounted } from "vue"; // Import ref and onMounted
import axios from "axios";
import ArgonButton from "@/components/ArgonButton.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import prodModal from "./prodModal.vue";
import groupcodelist from "../../assets/js/utils/groupcodelist.js"

const isModalOpen = ref(false); //초기상태
const ordlist = ref([]);
const OrderData = ref([]);
const standardlist = ref([]);
const values = ref(null);
const colorlist = ref([]);
const sizelist = ref([]);
const colorMap = ref({});
const sizeMap = ref({});

// 규격에서 수량 추출하는 함수
const extractUnitCount = (standardValue) => {
  if (!standardValue) return 0;
  const match = standardValue.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

// 총수량 계산
const calculateTotalQty = (row) => {
  const standardLabel = values.value[row.standard] || ""; 
  const unitCount = extractUnitCount(standardLabel);
  return unitCount * (parseInt(row.qty) || 0);
};

// 총금액 계산
const calculateTotalPrice = (row) => {
  const totalQty = calculateTotalQty(row);
  return totalQty * (parseInt(row.unitprice) || 0);
};

const handleCellEdit = (cell) => {
  const row = cell.getRow().getData();
  row.totalqty = calculateTotalQty(row);
  row.totalprice = calculateTotalPrice(row);
  cell.getRow().update(row);
};

// 선택한 제품 리스트 출력
const OrderColumns = [
  {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerSort:false, width: 20,},
  { title: "제품명", field: "prodname", width: 350},
  { title: "색상", field: "color", width: 80,
      formatter: function(cell) {
      const code = cell.getValue();
      return colorMap.value[code] || code;
    }
  },
  { title: "사이즈", field: "size", width: 150,
            formatter: function(cell) {
      const code = cell.getValue();
      return sizeMap.value[code] || code;
    }
   },
  { title: "규격", field: "standard", width: 200, editor: "list",
editorParams: function() {
  return {
    values: values.value
  }
},
formatter: function(cell) {
  const code = cell.getValue();
  return values.value[code] || code;
},
cellEdited: handleCellEdit
  },
    { 
    title: "box수량", field: "qty", width: 120, editor: "input",
cellEdited: function(cell) {
  const row = cell.getRow().getData();
  row.totalqty = calculateTotalQty(row);
  row.totalprice = calculateTotalPrice(row);
  cell.getRow().update(row);
}
  }, 
  { title: "총수량", field: "totalqty", width: 100,},
  { 
    title: "제품단가", field: "unitprice", width: 200, editor:"input",
    cellEdited: function(cell) {
      const row = cell.getRow().getData();
      row.totalprice = calculateTotalPrice(row);
      cell.getRow().update(row);
    }
  },
  { title: "총금액", field: "totalprice", width: 230}
];

// 데이터 가지고오기
onMounted(async () => {
await groupcodelist.groupCodeList('0Z', standardlist);
await groupcodelist.groupCodeList('0H', sizelist);
await groupcodelist.groupCodeList('0I', colorlist);

  values.value = Object.fromEntries(
  standardlist.value.map(item => [item.detail_code, item.detail_name])
);
  colorMap.value = Object.fromEntries(colorlist.value.map(item => [item.detail_code, item.detail_name]));
  sizeMap.value = Object.fromEntries(sizelist.value.map(item => [item.detail_code, item.detail_name]));
  try {
    const res = await axios.get('/api/productList'); // ✅ 백엔드 API 호출

    // ✅ 응답 데이터를 OrderData에 넣기
    OrderData.value = res.data.map((item) => {
      console.log('item 데이터', item);
      return{
      prodname: item.prod_name,
      color : item.color,
      size : item.size,
      standard : item.standard,
      qty : 0,
      totalqty : 0,
      totalprice : 0,
      unitprice : 0
    }});
    console.log('📦 DB에서 받아온 데이터:', OrderData.value);
  } catch (error) {
    console.error('❌ 주문 목록 로딩 실패:', error.message);
  }
});
// 모달에서 선택한 제품 데이터
const getlist = (modaldata) =>{
  console.log('자식한테 받아온 데이터', JSON.stringify(modaldata, null, 2));
  console.log('자식한테 받아온 데이터', modaldata);
  ordlist.value = modaldata;
};

// 모달창
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