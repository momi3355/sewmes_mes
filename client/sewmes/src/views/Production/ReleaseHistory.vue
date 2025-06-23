<script setup>
import { onMounted, ref } from "vue";
import axios from "axios";

import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import groupcodelist from "@/assets/js/utils/groupcodelist";
import { typeFormatter, dateFormatter } from "@/assets/js/utils/tableFormatter";

const catetype = ref([]);
const stantype = ref([]);

const releaseData = ref([]);

const releaseColumns = [
  { title: "LOT", field: "lot" },
  { 
    title: "카테고리",
    field: "category",
    width: 130,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: catetype,
    },
  },
  { title: "제품명", field: "prod_name" },
  {
    title: "규격",
    field: "standard",
    width: 130,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: stantype,
    },
  },
  { title: "출고수량", field: "release_qty", width: 120, hozAlign: "right" },
  { title: "단위", field: "unit", width: 90 },
  { title: "납품처", field: "cp_name", width: 170 },
  {
    title: "출고일자",
    field: "release_date",
    width: 140,
    formatter: dateFormatter,
    formatterParams: {
      dateformat: "YYYY-MM-DD",
    },
  },
  { title: "담당자", field: "emp_name", width: 100 },
];

const initialSearchFields = {
  prod_name: "",
  cp_name: "",
  category: "",
  release_date: "",
}

const searchData = ref({ ...initialSearchFields });

//리셋
const resetHandler = () => {
  searchData.value = { ...initialSearchFields };
  // detailFields.value = { ...initialDetailFields };
};

//검색
const searchHandler = () => {
  getReleaseList();
}

const getReleaseList = async() => {
  const search = searchData.value;
  const release = await axios.get("/api/prdRelease", {
    params: {
      prod_name: search.prod_name,
      cp_name: search.cp_name,
      category: search.category,
      release_date: search.release_date
    }
  });
  releaseData.value = release.data;
}

onMounted(async () => {
  Promise.all([
    groupcodelist.groupCodeList("0j", catetype),
    groupcodelist.groupCodeList("0z", stantype),
  ]).then(() => {
    getReleaseList();
  }).catch(() => {
    Swal.fire({
      title: "접속실패",
      text: "네트워크 접속에 실패했습니다.",
      icon: "error"
    });
  });
});
</script>

<template>
  <div class="container-fluid p-3 full-height">
    <div class="search-area bg-white rounded p-3 mb-3 shadow-sm">
      <!-- 상단 검색 영역 -->
      <div class="row">
        <div class="col-md-1">
          <label class="form-label search-label">카테고리</label>
          <select class="form-select" v-model="searchData.category">
            <option selected value="">전체</option>
            <option v-for="type in catetype" :value="type.detail_code">{{ type.detail_name }}</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label search-label">제품명</label>
          <input type="text" class="form-control" v-model="searchData.prod_name" onfocus="this.select()">
        </div>
        <div class="col-md-2">
          <label class="form-label search-label">납품처</label>
          <input type="text" class="form-control" v-model="searchData.cp_name" onfocus="this.select()">
        </div>
        <div class="col-md-2">
          <label class="form-label search-label">출고일자</label>
          <div class="date-input-wrapper">
            <input type="date"
              id="date"
              class="form-control"
              v-model="searchData.release_date"
              max="2039-12-31"
              min="2000-01-01">
          </div>
        </div>
        <div class="col-md-2 d-flex align-items-end gap-2">
          <button class="btn btn-outline-secondary w-50" @click="resetHandler">초기화</button>
          <button class="btn btn-primary w-50" @click="searchHandler">조회</button>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <tabulator-card
          ref="table"
          card-title="출고 이력 리스트"
          height="640px"
          :table-data="releaseData"
          :table-columns="releaseColumns"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-label {
  font-size: medium;
}
.full-height {
  height: 840px;
  display: flex;
  flex-direction: column;
}
.search-color {
  margin: 10px;
  padding: 20px;
  border-radius: 1rem;
  background-color: #fff;
}
</style>