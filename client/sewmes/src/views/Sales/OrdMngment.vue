<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="row">
          <div class="col-lg-6 col-md-12 mb-4">
            <tabulator-card
              card-title="주문서 목록"
              :table-data="OrderData"
              :table-columns="OrderColumns"
              :tabulator-options="OrderTabulatorOptions"
              style="height: 800px;"
            />
          </div>
          <div class="col-lg-6 col-md-12 mb-4">
            <div class="card h-100">
              <div class="card-header pb-0">
                <h6>작업지시 상세</h6>
              </div>
              <div class="card-body">
                <form>
                  <div class="row mb-0">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="companyName">업체명</label>
                        <input
                          type="text"
                          class="form-control"
                          id="companyName"
                          v-model="ordercurrentOrder.companyName"
                          readonly
                        />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="">업체연락처</label>
                        <input
                          type="tel"
                          class="form-control"
                          id=""
                          v-model="ordercurrentOrder.companyTel"
                          readonly
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row mb-0">
                    <div class="col-md-15">
                      <div class="form-group">
                        <label for="">주소</label>
                        <input
                          type="text"
                          class="form-control"
                          id=""
                          v-model="ordercurrentOrder.address"
                          readonly
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row mb-0">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="">주문일자</label>
                        <input
                          type="text"
                          class="form-control"
                          id=""
                          v-model="ordercurrentOrder.orderdate"
                        />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="">납기일자</label>
                        <input
                          type="text"
                          class="form-control"
                          id=""
                          v-model="ordercurrentOrder.deaddate"
                        />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="">영업 담당자</label>
                        <input
                          type="text"
                          class="form-control"
                          id=""
                          v-model="ordercurrentOrder.salesManager"
                        />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="">영업 담당자 연락처</label>
                        <input
                          type="tel"
                          class="form-control"
                          id=""
                          v-model="ordercurrentOrder.salesTel"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row mb-0">
                    <div class="col-md-15">
                      <div class="form-group">
                        <label for="width">비고</label>
                        <input
                          type="text"
                          class="form-control"
                          id="width"
                          v-model="ordercurrentOrder.note"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div class="card-footer d-flex justify-content-end pt-0">
                <argon-button color="secondary" variant="gradient" class="me-2" @click=""
                  >삭제</argon-button
                >
                <argon-button color="success" variant="gradient" @click=""
                  >저장</argon-button
                >
              </div>
              <p>선택된 업체명: {{ ordercurrentOrder.cp_name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { ref, onMounted } from "vue"; // Import ref and onMounted
import axios from "axios";
import ArgonButton from "@/components/ArgonButton.vue";
import DefaultInfoCard from "@/examples/Cards/DefaultInfoCard.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";

// 사용자 데이터 및 컬럼 정의

const OrderData = ref([]);

// 주문 목록
const OrderColumns = [
  { title: "순번", field: "num", width: 100, hozAlign: "center" },
  { title: "주문코드", field: "ordercode", width: 100, hozAlign: "center" },
  { title: "업체명", field: "companyName", minWidth: 150, hozAlign: "center"},
  { title: "총수량", field: "totalQty", width: 100, hozAlign: "center",},
  { title: "주문일자", field: "orderdate", width: 100, hozAlign: "center",},
  { title: "납기일자", field: "deaddate", width: 100, hozAlign: "center",},
  { title: "상태", field: "status", width: 100, hozAlign: "center",}
];
onMounted(async () => {
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
      // salesManager: '',
      // salesTel: '',
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
</style>
