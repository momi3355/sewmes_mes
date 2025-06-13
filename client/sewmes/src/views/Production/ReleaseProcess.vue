<script setup>
import { onMounted, ref } from "vue";
import axios from "axios";

import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import { typeFormatter } from "@/assets/js/utils/tableFormatter";

const searchData = ref({});
const detailFields = ref({});
const bomtype = {};

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

onMounted(async () => {
  const a = await axios.get('/api/prdReceive');
  console.log(a.data);
  itemData.value = a.data;
});
</script>

<template>
  <div class="container-fluid p-3">
    <div class="row search-color">
      <!-- 상단 검색 영역 -->
      <div class="row mb-3">
        <div class="col-md-2 d-inline-block-custom">
          <label class="form-label">품목코드</label>
          <input
            type="text"
            class="form-control"
            v-model="searchData.code"
          />
        </div>
        <div class="col-md-2">
          <label class="form-label">제품유형</label>
          <select class="form-select" v-model="searchData.item_type">
            <option v-for="type in bomtype" :value="type.detail_code">
              {{ type.detail_name }}
            </option>
          </select>
        </div>
      </div>
      <div class="row mb-3">
        <div class="col-md-2">
          <label class="form-label">품명</label>
          <input
            type="text"
            class="form-control"
            v-model="searchData.name"
          />
        </div>
        <div class="col-md-2">
          <label class="form-label">품목유형</label>
          <input
            type="text"
            class="form-control"
            v-model="searchData.type"
          />
        </div>
        <div class="col-md-2">
          <label class="form-label">사용여부</label>
          <div class="form-check" v-for="type in usetype">
            <input
              class="form-check-input"
              type="radio"
              v-model="searchData.use_yn"
              :value="type.code"
              :id="'search-'+type.code"
            />
            <label class="form-check-label" :for="'search-'+type.code">
              {{ type.name }}
            </label>
          </div>
        </div>
        <div class="col-md-2">
          <label for="date" class="form-label">수입일자</label>
          <div class="date-input-wrapper">
            <!-- v-model을 searchDate와 연결 -->
            <input type="date"
              id="date"
              class="form-control"
              v-model="searchDate"
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
          ref="item_table"
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
                      @keyup.enter="findProd"
                      v-model="detailFields.prod_code"
                    />
                  </td>
                </tr>
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
                  <th>단위수량</th>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="detailFields.standard"
                    />
                  </td>
                </tr>
                <tr>
                  <th>재고수량</th>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="detailFields.temp"
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
                <tr>
                  <th>출고일시</th><!-- TODO: 출고일시는 출고처리날짜로 기입 -->
                  <td>
                    <input
                      type="date"
                      class="form-control form-control-sm"
                      v-model="detailFields.temp"
                    />
                  </td>
                </tr>
                <tr>
                  <th>업체명</th>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="detailFields.cp_name"
                    />
                  </td>
                </tr>
                <tr>
                  <th>분류</th>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="detailFields.cls"
                    />
                  </td>
                </tr>
                <tr>
                  <th>업체주소</th>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="detailFields.address"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <span>출고 상세</span>
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