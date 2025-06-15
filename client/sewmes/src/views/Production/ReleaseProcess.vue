<script setup>
import { onMounted, ref } from "vue";
import axios from "axios";

import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";

const table = ref(null);

const initialSearchFields = {
  prod_code: "",
  prod_name: "",
  dead_date: "",
};

const searchData = ref({ ...initialSearchFields });
const detailFields = ref({});

const itemData = ref([]);
const itemColumns = [
  { title: "제품코드", field: "prod_code", width: 120 },
  { title: "제품명", field: "prod_name", width: 230 },
  { title: "납품처", field: "cp_name", width: 230 },
  { title: "주문수량", field: "qty" },
  { title: "납기일", field: "dead_date" },
];

const itemOptions = {
  selectableRows: 1,
}

const itemEvent = [
  {
    eventName: "rowClick",
    eventAction: (e, row) => {
      const rowData = row.getData();
      console.log(row);
      detailFields.value = { ...rowData };
      //console.log(detailFields.value.material_code);
    }
  }
];

//리셋
const resetHandler = () => {
  searchData.value = { ...initialSearchFields };
  // detailFields.value = { ...initialDetailFields };
};

//검색
const searchHandler = async () => {
  const tabulator = table.value.getTabulator();
  await tabulator.setData("/api/prdReceive", searchData.value);
  itemData.value = tabulator.getData();
};

onMounted(async () => {
  const productReceive = await axios.get('/api/prdReceive');
  itemData.value = productReceive.data;
});
</script>

<template>
  <div class="container-fluid p-3">
    <div class="row search-color">
      <!-- 상단 검색 영역 -->
      <div class="row mb-3">
        <div class="col-md-2 d-inline-block-custom">
          <label class="form-label">제품코드</label>
          <input
            type="text"
            class="form-control"
            v-model="searchData.prod_code"
          />
        </div>
        <div class="col-md-2">
          <label class="form-label">제품명</label>
          <input
            type="text"
            class="form-control"
            v-model="searchData.prod_name"
          />
        </div>
        <div class="col-md-2">
          <label for="date" class="form-label">납기일자</label>
          <div class="date-input-wrapper">
            <input type="date"
              id="date"
              class="form-control"
              v-model="searchData.dead_date"
              max="2039-12-31"
              min="2000-01-01">
          </div>
        </div>
        <div class="col-md-2 d-flex align-items-end">
          <button class="btn btn-secondary me-2" @click="resetHandler">
            초기화
          </button>
          <button class="btn btn-primary" @click="searchHandler">조회</button>
        </div>
      </div>
    </div>
    <div class="row me-3">
      <div class="col-7 md-3">
        <tabulator-card
          ref="table"
          card-title="주문 리스트"
          :table-data="itemData"
          :table-columns="itemColumns"
          :tabulator-options="itemOptions"
          :on="itemEvent"
        />
      </div>
      <div class="col-md-5 d-flex flex-column">
        <div class="card mb-2 flex-grow-1" style="min-height: 180px">
          <div class="card-header pb-0 d-flex justify-content-between align-items-center">
            <span>주문 상세</span>
            <div class="btn-container">
              <button class="btn btn-sm btn-success" @click="bomClickhandler">저장</button>
            </div>
          </div>
          <div class="card-body p-2">
            <table class="table table-bordered table-sm align-middle mb-2">
              <tbody style="border-width: 1px">
                <tr>
                  <th style="width: 30%">제품코드</th>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="detailFields.prod_code"
                    />
                  </td>
                </tr>
                <tr>
                  <th>품명</th>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="detailFields.prod_name"
                    />
                  </td>
                </tr>
                <tr>
                  <th>규격</th>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="detailFields.standard"
                    />
                  </td>
                </tr>
                <tr>
                  <th>주문수량</th>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="detailFields.qty"
                    />
                  </td>
                </tr>
                <tr>
                  <th>납기일</th>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="detailFields.dead_date"
                    />
                  </td>
                </tr>
                <tr>
                  <th>납품처</th>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="detailFields.cp_name"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="card-header pb-0 d-flex justify-content-between align-items-center">
            <span>출고 상세</span>
          </div>
          <div class="card-body p-2">
            <table class="table table-bordered table-sm align-middle mb-2">
              <tr>
                <th>LOT</th>
                <td>
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    v-model="detailFields.lots"
                  />
                </td>
              </tr>
              <tr>
                <th>박스수량</th>
                <td>
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    v-model="detailFields.temp"
                  />
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-color {
  margin: 10px;
  padding: 20px;
  border-radius: 1rem;
  background-color: #fff;
}
</style>