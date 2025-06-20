<template>
  <div class="container-fluid p-3">
    <!-- 📦 주문 목록 + 상세 -->
    <div class="container-fluid py-4" id="odlist">
      <div class="row gx-4">
        <!-- 주문 목록 -->
        <div class="col-lg-6 mb-4">
          <tabulator-card
            card-title="주문서 목록"
            :table-data="OrderData"
            :table-columns="OrderColumns"
            :tabulator-options="tabulatorEvent"
            :on="tabulatorEvent"
            style="height: 800px;"
            height="576px"
          />
        </div>

        <!-- 주문 상세 + 등록 -->
        <div class="col-lg-6 mb-4">
          <div class="card">
            <div class="card-body">
              <form>
              <div class="row g-3">
                <div class="col-md-6 d-flex align-items-center">
  <label class="form-label me-2 mb-0" style="min-width: 100px;">업체명:</label>
  <div class="position-relative flex-grow-1" @focusin="listOpen = true" @focusout="onFocusOut">
    <input type="text" class="form-control" v-model="ordercurrentOrder.cp_name">
    <ul class="dropdown-menu show" v-if="listOpen" style="position:absolute; top:100%; left:0;">
      <li v-for="(company, index) in filteredCompanyList" :key="index">
        <a class="dropdown-item" href="#" @mousedown.prevent @click="selectCompany(company)">
          {{ company.cp_name }}
        </a>
      </li>
    </ul>
  </div>
</div>

                  <div class="col-md-6 d-flex align-items-center mb-2">
  <label class="form-label me-2 mb-0" style="min-width: 100px;">업체연락처:</label>
  <input type="tel" class="form-control flex-grow-1" v-model="ordercurrentOrder.cp_tel" />
</div>

<div class="col-md-12 d-flex align-items-center mb-2">
  <label class="form-label me-2 mb-0" style="min-width: 100px;">주소:</label>
  <input type="text" class="form-control flex-grow-1" v-model="ordercurrentOrder.address" />
</div>

<div class="col-md-6 d-flex align-items-center mb-2">
  <label class="form-label me-2 mb-0" style="min-width: 100px;">주문일자:</label>
  <input type="date" class="form-control flex-grow-1" v-model="orderDateStr" />
</div>

<div class="col-md-6 d-flex align-items-center mb-2">
  <label class="form-label me-2 mb-0" style="min-width: 100px;">납기일자:</label>
  <input type="date" class="form-control flex-grow-1" v-model="deadDateStr" />
</div>

<div class="col-md-6 d-flex align-items-center mb-2">
  <label class="form-label me-2 mb-0" style="min-width: 100px;">영업 담당자:</label>
  <input type="text" class="form-control flex-grow-1" v-model="ordercurrentOrder.emp_name" />
</div>

<div class="col-md-6 d-flex align-items-center mb-2">
  <label class="form-label me-2 mb-0" style="min-width: 100px;">영업 담당자 연락처:</label>
  <input type="tel" class="form-control flex-grow-1" v-model="ordercurrentOrder.emp_tel" />
</div>

<div class="col-12 d-flex align-items-start mb-2">
  <label class="form-label me-2 mb-0" style="min-width: 100px;">비고:</label>
  <textarea class="form-control flex-grow-1" rows="2" v-model="ordercurrentOrder.note"></textarea>
</div>
</div>
</form>
</div>

<tabulator-card
  card-title=""
  :table-data="orderInfo"
  :table-columns="OrderColumnsDetail"
  style="height: 420px;"
/>

<!-- 제품 테이블 -->
</div>
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
import moment from "moment";

// 로그인 정보 및 데이터 초기화
const store = useStore();
const user = computed(() => store.state.user);
const isLoggedIn = computed(() => !!store.state.user);

const OrderData = ref([]);
const ordlist = ref([]);
const isModalOpen = ref(false);
// 상세조회
const orderInfo = ref([]);
// 등록용 데이터 바인딩
const searchTerm = ref("");
const companyTel = ref("");
const address = ref("");
const companyList = ref([]);
const listOpen = ref(false);
// 공통코드
const sizecode = ref([]);
const colorcode = ref([]);
const statecode = ref([]);
const standardcode = ref([]);

const onFocusOut = () => {
  setTimeout(() => listOpen.value = false, 100);
};

const selectCompany = (company) => {
  searchTerm.value = company.cp_name;
  companyTel.value = company.cp_tel;
  address.value = company.address;
  listOpen.value = false;
};

const filteredCompanyList = computed(() => {
  if (!searchTerm.value) return companyList.value;
  return companyList.value.filter(company =>
    company.cp_name.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

// 주문서 목록 테이블
const OrderColumns = [
  { title: "순번", formatter: "rownum", width: 80 },
  { title: "주문코드", field: "order_code", width: 108 },
  { title: "업체명", field: "cp_name"},
  { title: "총수량", field: "total_qty", width: 94 },
  { title: "주문일자", field: "order_date", width: 110 },
  { title: "납기일자", field: "dead_date", width: 110 },
  { title: "상태", field: "order_state", width: 90, 
    formatter:(cell)=>{
    const code = cell.getValue();
    const matched = statecode.value.find(item => item.detail_code == code);
    return matched ? matched.detail_name : code;
  } }
];

// 등록 폼 상세 제품 테이블
const OrderColumnsDetail = [
  {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerSort:false, width: 20,},
  { title: "제품명", field: "prod_name", width: 150 },
  { title: "색상", field: "color", width: 80,
    formatter:(cell)=>{
    const code = cell.getValue();
    const matched = colorcode.value.find(item => item.detail_code == code);
    return matched ? matched.detail_name : code;
  }
  },
  { title: "사이즈", field: "size", width: 95, 
    formatter:(cell)=>{
    const code = cell.getValue();
    const matched = sizecode.value.find(item => item.detail_code == code);
    return matched ? matched.detail_name : code;
  }
  },
  { title: "규격", field: "standard", width: 105, 
    formatter:(cell)=>{
    const code = cell.getValue();
    const matched = standardcode.value.find(item => item.detail_code == code);
    return matched ? matched.detail_name : code;
  }
  },
  { title: "수량", field: "total_qty", width: 80 },
  { title: "단가", field: "unit_price", width: 80 },
  { title: "합계", field: "sel_price", width: 100 },
  { title: "상태", field: "order_detail_state", width: 100 ,
    formatter:(cell)=>{
    const code = cell.getValue();
    const matched = statecode.value.find(item => item.detail_code == code);
    return matched ? matched.detail_name : code;
  }
  },
];


onMounted(async () => {
  // 공통코드
  groupcodelist.groupCodeList('0I', colorcode);
  groupcodelist.groupCodeList('0N', statecode);
  groupcodelist.groupCodeList('0Z', standardcode);
  groupcodelist.groupCodeList('0H', sizecode);

  try {
    const res = await axios.get('/api/orderList'); // ✅ 백엔드 API 호출
    OrderData.value = res.data
    console.log('📦 DB에서 받아온 데이터:', OrderData.value);
} catch (error) {
  console.error('❌ 주문 목록 로딩 실패:', error.message);
}
});

// 주문 상세 정보
const ordercurrentOrder = ref({});

const OrderTabulatorOptions = {
  // pagination: 'local', // Paging removed
  // paginationSize: 7, // Paging size removed
  layout: 'fitColumns',
  rowClick: (e, row) => {
    OrderData.value.forEach(item => item.isSelected = false);
    row.getData().isSelected = true;
    ordercurrentOrder.value = { ...row.getData() }; // Update detailed view
  },
  rowFormatter: function(row) {
    if (row.getData().isSelected) {
      row.getElement().classList.add("selected-row");
    } else {
      row.getElement().classList.remove("selected-row");
    }
  }
};



// 이벤트 핸들러
const tabulatorEvent = [
  {
    eventName: "rowClick",
    eventAction: async (e, row) => {
      const rowData = row.getData();
      console.log(rowData);
      // 추후 상세조회 기능 구현 가능
      const info = await axios.get(`/api/orderDetailList/${rowData.order_code}`);
      orderInfo.value = info.data
      ordercurrentOrder.value = info.data[0]
      console.log("dfsaf",ordercurrentOrder.value.cp_name)
    }
  }
];

const orderDetailFields={
  companyName: orderInfo.value.cp_name,
  companyTel: "",
  address: "",
  orderDate: "",
  deadDate: "",
  salesManager: "",
  salesTel: "",
  note: ""
}
const detailFields = ref({ ...orderDetailFields });
const orderDateStr = computed({
  get() { return ordercurrentOrder.value.order_date ? moment(ordercurrentOrder.value.order_date).format('YYYY-MM-DD') : ''; },
  set(val) { ordercurrentOrder.value.order_date = val; }
});

const deadDateStr = computed({
  get() { return ordercurrentOrder.value.dead_date ? moment(ordercurrentOrder.value.dead_date).format('YYYY-MM-DD') : ''; },
  set(val) { ordercurrentOrder.value.dead_date = val; }
});


</script>

<style scoped>
/* 기존 조회페이지 스타일 유지 */
.search-color { margin: 10px; padding: 20px; border-radius: 1rem; background-color: #fff; }

</style>
