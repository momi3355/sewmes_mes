<template>
  <div class="container-fluid p-3">
    <div class="row search-color">
    <!-- 상단 검색 영역 -->
    <div class="row mb-3">
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
            :tabulator-options="tabulatorEvent"
            :on="tabulatorEvent"
            style="height: 800px;"
          />
        </div>

        <!-- 주문 상세 -->
        <div class="col-lg-6 mb-4">
          <div class="card">
            <div class="card-body">
              <form>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">업체명</label>
                    <input type="text" class="form-control" v-model="detailFields.companyName" readonly />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">업체연락처</label>
                    <input type="tel" class="form-control" v-model="detailFields.companyTel" readonly />
                  </div>
                  <div class="col-12">
                    <label class="form-label">주소</label>
                    <input type="text" class="form-control" v-model="detailFields.address" readonly />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">주문일자</label>
                    <input type="text" class="form-control" v-model="detailFields.orderdate" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">납기일자</label>
                    <input type="text" class="form-control" v-model="detailFields.deaddate" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">영업 담당자</label>
                    <input type="text" class="form-control" v-model="detailFields.salesManager" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">영업 담당자 연락처</label>
                    <input type="tel" class="form-control" v-model="detailFields.salesTel" />
                  </div>
                  <div class="col-12">
                    <label class="form-label">비고</label>
                    <input type="text" class="form-control" v-model="detailFields.note" />
                  </div>
                </div>
              </form>
            </div>
            <div class="card-footer d-flex justify-content-end pt-0">
              <argon-button color="secondary" variant="gradient" class="me-2">삭제</argon-button>
              <argon-button color="success" variant="gradient">저장</argon-button>
            </div>
  <table class="table table-sm product-list-table">
    <thead>
      <tr>
        <th><input type="checkbox" id="cbox"></th>
        <th>제품명</th>
        <th>색상</th>
        <th>사이즈</th>
        <th>규격</th>
        <th>수량</th>
        <th>총수량</th>
        <th>단가(box)</th>
        <th>합계</th>
        <th>상태</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in detailFields.products" :key="index">
        <td>
          <input type="checkbox" v-model="item.checked" />
        </td>
        <td>{{ item.name }}</td>
        <td>{{ item.qty }}</td>
        <td>{{ item.price }}</td>
        <td>{{ item.note }}</td>
      </tr>
    </tbody>

  </table>
              <div class="card-footer d-flex justify-content-end pt-10">
              <argon-button color="secondary" variant="gradient" class="del">삭제</argon-button>
            </div>
</div>
          </div>
        </div>
        <div class="product-table mt-4">

      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ref, onMounted,computed } from "vue"; // Import ref and onMounted
import axios from "axios";
import ArgonButton from "@/components/ArgonButton.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";

// 사용자 데이터 및 컬럼 정의

const store = useStore();
const router = useRouter();
const OrderData = ref([]);
const isLoggedIn = computed(() => !!store.state.user);

// 주문 목록
const OrderColumns = [
  { title: "순번", field: "num", width: 79, hozAlign: "center" },
  { title: "주문코드", field: "ordercode", width: 108, hozAlign: "center" },
  { title: "업체명", field: "companyName", minWidth: 94, hozAlign: "center"},
  { title: "총수량", field: "totalQty", width: 94, hozAlign: "center",},
  { title: "주문일자", field: "orderdate", width: 120, hozAlign: "center",},
  { title: "납기일자", field: "deaddate", width: 100, hozAlign: "center",},
  { title: "상태", field: "status", width: 100, hozAlign: "center",}
];
onMounted(async () => {
  if (!isLoggedIn.value) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }

  try {
    const res = await axios.get('/api/orderList'); // ✅ 백엔드 API 호출

    // ✅ 응답 데이터를 OrderData에 넣기
    OrderData.value = res.data.map((item, index) => ({
      num: index + 1,
      ordercode: item.order_code,
      companyName: item.cp_name,
      totalQty: item.qty,
      orderdate: item.order_date,
      deaddate: item.dead_date,
      companyTel: item.cp_tel,
      salesManager: '심재진',
      salesTel: '0103213',
      address: item.address,
      note: item.note,
      status: item.state
    }));

    console.log('📦 DB에서 받아온 데이터:', OrderData.value);
  } catch (error) {
    console.error('❌ 주문 목록 로딩 실패:', error.message);
  }
});
// 주문 상세 정보
// const ordercurrentOrder = ref({});


const tabulatorEvent = [
  {
    eventName: "rowClick",
    eventAction: (e, row) => {
      const rowData = row.getData();
      console.log(rowData);
      detailFields.value = rowData;
      //console.log(detailFields.value.material_code);
    }
  }
];

const orderDetailFields={
  companyName: "",
  companyTel: "",
  address: "",
  orderDate: "",
  deadDate: "",
  salesManager: "",
  salesTel: "",
  note: ""
}

const tabulatorOptions = {
  selectableRows: 1,
}

const detailFields = ref({ ...orderDetailFields });

// 동적으로 데이터 업데이트 예시 (버튼 클릭 시)
// const updateUserData = () => {
  //   userData.value = [
    //     ...userData.value,
    //     { id: userData.value.length + 1, name: "새로운 사용자", age: 22, email: "new@example.com", status: "Pending" }
    //   ];
// };

</script>

<style scoped>
  input {
    display: block;
    margin-bottom: -10px; /* 간격을 줄임 */
  }
  .search-color {
  margin: 10px;
  padding: 20px;
  border-radius: 1rem;
  background-color: #fff;
}
/* 주문 상세 카드 내부의 제품 테이블 */
.product-table {
  border-top: 1px solid #ddd;
  padding-top: 1rem;
  background-color: white; /* ✅ 흰 배경 적용 */
  border-radius: 8px;
}

/* 테이블 스타일 */
.product-list-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white; /* ✅ 테이블 배경도 흰색으로 */
  font-size: 0.875rem;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}

.product-list-table th,
.product-list-table td {
  padding: 6px 8px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

#cbox{
  margin-bottom: 5px;
}

.del{
  width: 65px;
  /* height: 30px; */
  /* padding-bottom: 10px; */
}
</style>