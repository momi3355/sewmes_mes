<template>
  <div class="container-fluid p-3">
    <!-- 상단 검색 영역 -->
    <div class="row mb-3 search-color">
      <div class="col-md-2">
        <label class="form-label">검색항목 1</label>
        <input type="text" class="form-control" v-model="searchField1">
      </div>
      <div class="col-md-2">
        <label class="form-label">검색항목 2</label>
        <input type="text" class="form-control" v-model="searchField2">
      </div>
      <div class="col-md-2">
        <label class="form-label">검색항목 3</label>
        <input type="text" class="form-control" v-model="searchField3">
      </div>
      <div class="col-md-2">
        <label class="form-label">검색항목 4</label>
        <input type="text" class="form-control" v-model="searchField4">
      </div>
      <div class="col-md-2 d-flex align-items-end">
        <button class="btn btn-secondary me-2">초기화</button>
        <button class="btn btn-primary">조회</button>
      </div>
    </div>

    <!-- 📦 주문 목록 + 상세 -->
    <div class="container-fluid py-4" id="odlist">
      <div class="row gx-4">
        <!-- 주문 목록 -->
        <div class="col-lg-6 mb-4">
          <tabulator-card
            card-title="주문서 목록"
            :table-data="OrderData"
            :table-columns="OrderColumns"
            :tabulator-options="tabulatorOptions"
            :on="tabulatorEvent"
            style="height: 800px;"
          />
        </div>

        <!-- 주문 상세 + 등록 -->
        <div class="col-lg-6 mb-4">
          <div class="card">
            <div class="card-body">
              <form>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">업체명</label>
                    <div class="position-relative" @focusin="listOpen = true" @focusout="onFocusOut">
                      <input type="text" class="form-control" v-model="searchTerm">
                      <ul class="dropdown-menu show" v-if="listOpen" style="position:absolute; top:100%; left:0;">
                        <li v-for="(company, index) in filteredCompanyList" :key="index">
                          <a class="dropdown-item" href="#" @mousedown.prevent @click="selectCompany(company)">
                            {{ company.cp_name }}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">업체연락처</label>
                    <input type="tel" class="form-control" v-model="companyTel" readonly />
                  </div>

                  <div class="col-12">
                    <label class="form-label">주소</label>
                    <input type="text" class="form-control" v-model="address" readonly />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">주문일자</label>
                    <input type="date" class="form-control" v-model="orderDate" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">납기일자</label>
                    <input type="date" class="form-control" v-model="deadDate" />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">영업 담당자</label>
                    <input type="text" class="form-control" v-model="salesManager" readonly />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">영업 담당자 연락처</label>
                    <input type="tel" class="form-control" v-model="salesTel" readonly />
                  </div>

                  <div class="col-12">
                    <label class="form-label">비고</label>
                    <textarea class="form-control" rows="2" v-model="note"></textarea>
                  </div>
                </div>
              </form>
            </div>

            <!-- 버튼 영역 -->
            <div class="card-footer d-flex justify-content-end pt-0">
              <button class="btn btn-outline-secondary btn-sm me-2" @click="openModal">제품추가 🧾</button>
              <argon-button color="secondary" variant="gradient" class="me-2">삭제</argon-button>
              <argon-button color="success" variant="gradient" @click="saveOrder">저장</argon-button>
            </div>

            <!-- 제품 테이블 -->
            <tabulator-card
              card-title=""
              :table-data="ordlist"
              :table-columns="OrderColumnsDetail"
              :tabulator-options="tabulatorOptionsDetail"
              style="height: 400px;"
            />
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

// 공통코드 변환
const standardlist = ref([]);
const sizelist = ref([]);
const colorlist = ref([]);

// 로그인 정보 및 데이터 초기화
const store = useStore();
const user = computed(() => store.state.user);
const isLoggedIn = computed(() => !!store.state.user);

const OrderData = ref([]);
const ordlist = ref([]);
const isModalOpen = ref(false);

// 등록용 데이터 바인딩
const searchTerm = ref("");
const companyTel = ref("");
const address = ref("");
const orderDate = ref("");
const deadDate = ref("");
const salesTel = ref("");
const salesManager = ref("");
const note = ref("");

const companyList = ref([]);
const listOpen = ref(false);

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
  { title: "순번", field: "num", width: 70 },
  { title: "주문코드", field: "ordercode", width: 100 },
  { title: "업체명", field: "companyName", width: 130 },
  { title: "총수량", field: "totalQty", width: 90 },
  { title: "주문일자", field: "orderdate", width: 100 },
  { title: "납기일자", field: "deaddate", width: 100 },
  { title: "상태", field: "status", width: 100 }
];

// 등록 폼 상세 제품 테이블 (임시)
const OrderColumnsDetail = [
  { title: "제품명", field: "prodname", width: 150 },
  { title: "색상", field: "color", width: 80 },
  { title: "사이즈", field: "size", width: 80 },
  { title: "규격", field: "standard", width: 100 },
  { title: "수량", field: "qty", width: 80 },
  { title: "총수량", field: "totalqty", width: 100 },
  { title: "단가", field: "unitprice", width: 100 },
  { title: "합계", field: "totalprice", width: 100 },
];

// 이벤트 핸들러
const tabulatorEvent = [
  {
    eventName: "rowClick",
    eventAction: (e, row) => {
      const rowData = row.getData();
      console.log(rowData);
      // 추후 상세조회 기능 구현 가능
    }
  }
];

const tabulatorOptions = { selectableRows: 1 };
const tabulatorOptionsDetail = {};

// 제품 추가 모달 데이터
const getlist = (modaldata) => {
  ordlist.value = modaldata;
};

// 모달창 제어
const openModal = () => { isModalOpen.value = true };
const closeModal = () => { isModalOpen.value = false };

// 저장
const saveOrder = async () => {
  try {
    const orderData = {
      companyName: searchTerm.value,
      companyTel: companyTel.value,
      address: address.value,
      orderDate: orderDate.value,
      deadDate: deadDate.value,
      salesManager: salesManager.value,
      salesTel: salesTel.value,
      note: note.value,
      orderDetails: ordlist.value
    };

    console.log('보낼 주문 데이터:', orderData);
    const res = await axios.post('/api/saveOrder', orderData);
    if (res.data.success) {
      alert('저장 성공');
    } else {
      alert('저장 실패');
    }
  } catch (err) {
    console.error(err);
    alert('저장 중 오류 발생');
  }
};

// 데이터 로딩
onMounted(async () => {
  if (!isLoggedIn.value) return;

  salesManager.value = user.value.emp_name;
  salesTel.value = user.value.emp_tel;

  try {
    const [resOrder, resCompany] = await Promise.all([
      axios.get('/api/orderList'),
      axios.get('/api/companyDropDown')
    ]);
    await groupcodelist.groupCodeList('0Z', standardlist);
    await groupcodelist.groupCodeList('0H', sizelist);
    await groupcodelist.groupCodeList('0I', colorlist);
    
    OrderData.value = resOrder.data.map((item, index) => ({
      num: index + 1,
      ordercode: item.order_code,
      companyName: item.cp_name,
      totalQty: item.qty,
      orderdate: item.order_date,
      deaddate: item.dead_date,
      companyTel: item.cp_tel,
      salesManager: '심재진',
      salesTel: '010-3213',
      address: item.address,
      note: item.note,
      status: item.state
    }));

    companyList.value = resCompany.data;

  } catch (e) {
    console.error('데이터 로드 실패', e);
  }
});
</script>

<style scoped>
/* 기존 조회페이지 스타일 유지 */
.search-color { margin: 10px; padding: 20px; border-radius: 1rem; background-color: #fff; }
</style>
