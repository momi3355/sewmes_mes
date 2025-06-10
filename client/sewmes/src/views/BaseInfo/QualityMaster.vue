<script setup>
import { ref } from "vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";

const productData = ref([
  { id: 101, name: "노트북", category: "전자제품", price: 1200, stock: 50 },
  { id: 102, name: "마우스", category: "전자제품", price: 25, stock: 200 },
  { id: 103, name: "키보드", category: "전자제품", price: 75, stock: 120 },
  { id: 104, name: "모니터", category: "전자제품", price: 300, stock: 30 },
]);

const productColumns = [
  { title: "제품 ID", field: "id", width: 80 },
  { title: "제품명", field: "name", width: 180 },
  { title: "카테고리", field: "category", width: 120 },
  {
    title: "가격",
    field: "price",
    hozAlign: "right",
    formatter: "money",
    formatterParams: { symbol: "$", precision: 0 },
  },
  { title: "재고", field: "stock", hozAlign: "center" },
];
</script>

<template>
  <div class="container-fluid p-3">
    <div class="row search-color">
    <!-- 상단 검색 영역 -->
    <div class="row mb-3">
      <div class="col-md-2">
        <label class="form-label">검사명</label>
        <input type="text" class="form-control" v-model="searchField1">
      </div>
      <div class="col-md-2">
        <label class="form-label">대상품목목</label>
        <input type="text" class="form-control" v-model="searchField2">
      </div>
      <div class="col-md-2">
        <label class="form-label">참조</label>
        <input type="text" class="form-control" v-model="searchField3">
      </div>
      <div class="col-md-2 d-flex align-items-end">
        <button class="btn btn-secondary me-2">초기화</button>
        <button class="btn btn-primary">조회</button>
      </div>
    </div>
    </div>

    <!-- 중간 본문: 좌측 테이블 / 우측 상세 -->
    <div class="row">
      <!-- 좌측 Tabulator 영역 -->
      <div class="col-md-7">
        <!-- <div class="card">
          <div class="card-header">목록</div>
          <div class="card-body p-2">
            <div id="tabulator-table" style="height: 400px;"></div>
          </div>
        </div> -->
        <tabulator-card
          card-title="제품 재고 현황"
          :table-data="productData"
          :table-columns="productColumns"
        />
      </div>

      <!-- 우측 상세 항목 -->
      <div class="col-md-5">
        <div class="card mb-3">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span>상세폼</span>
            <button class="btn btn-sm btn-success">저장</button>
          </div>
          <div class="card-body">
            <div class="row mb-2">
              <div class="col-md-6">
                <label class="form-label">상세항목 1</label>
                <input type="text" class="form-control" v-model="detailField1">
              </div>
              <div class="col-md-6">
                <label class="form-label">상세항목 2</label>
                <input type="text" class="form-control" v-model="detailField2">
              </div>
              <div class="col-md-6">
                <label class="form-label">상세항목 3</label>
                <input type="text" class="form-control" v-model="detailField3">
              </div>
              <div class="col-md-6">
                <label class="form-label">상세항목 4</label>
                <input type="text" class="form-control" v-model="detailField4">
              </div>
              <div class="col-md-6">
                <label class="form-label">상세항목 5</label>
                <input type="text" class="form-control" v-model="detailField5">
              </div>
              <div class="col-md-6">
                <label class="form-label">상세항목 6</label>
                <input type="text" class="form-control" v-model="detailField6">
              </div>
              <div class="col-md-12">
                <label class="form-label">상세항목 7</label>
                <input type="text" class="form-control" v-model="detailField7">
              </div>

              <!-- 참고 이미지 -->
              <div class="col-md-12 mt-3">
                <label class="form-label">이미지영역</label>
                <div class="d-flex gap-3">
                  <img src="img1.png" alt="img1" style="width: 100px;" />
                  <img src="img2.png" alt="img2" style="width: 100px;" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 우측 하단 이력 그리드 (옵션) -->
        <div v-if="showHistory" class="card">
          <div class="card-header">하단그리드</div>
          <div class="card-body p-2">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>컬럼 1</th>
                  <th>컬럼 2</th>
                  <th>컬럼 3</th>
                  <th>컬럼 4</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in historyData" :key="index">
                  <td>{{ item.col1 }}</td>
                  <td>{{ item.col2 }}</td>
                  <td>{{ item.col3 }}</td>
                  <td>{{ item.col4 }}</td>
                </tr>
              </tbody>
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
  border-radius: 15px;
  background-color: #FFF;
}
</style>