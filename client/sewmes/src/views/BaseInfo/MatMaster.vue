

<template>
  <div class="container-fluid p-3">
    <div class="row search-color">
      <!-- 상단 검색 영역 -->
      <div class="row mb-3">
        <div class="col-md-2 d-inline-block-custom">
          <span class="form-label">검색항목 1</span>
          <input name="searchField1" type="text" class="form-control" v-model="searchField1">
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
