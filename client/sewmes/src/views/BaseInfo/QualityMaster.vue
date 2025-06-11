<script setup>
import { onMounted, reactive, ref } from "vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import axios from "axios";

let qualityList = reactive([]);
let qualityInfo = ref({});
let qualityHistoryList = reactive([]);
let groupCodeList = reactive([]);

//품질기준정보 컬럼
const qualityColumns = [
  { title: "검사명", field: "testName"}, 
  { title: "대상 품목", field: "testTarget"},
  { title: "참조", field: "testRef"},
  { title: "사용 여부", field: "useYn"},
];

//품질기준정보 이력 컬럼
const qualityHistoryColumns = [
  { title: "버전", field: "qualityVer"},
  { title: "검사명", field: "testName"}, 
  { title: "대상 품목", field: "testTarget"},
  { title: "검사 방법", field: "testMethod"},
  { title: "참조", field: "testRef"},
  { title: "검사 기준", field: "testStandard"},];

const qualitySch = {
  testNameSch: '',
  testTargetSch: '', 
  testRefSch: '',
  useYn: '0b1b'
};

const qualSchData = ref({ ...qualitySch});

const getQualityList = async () => {
  let params = {
    ...qualSchData.value
  }
  let list = await axios.get('/api/quality', params).catch(err => console.log(err));
  console.log(list.data);
  console.log(list.data.length);
  qualityList = list.data;
}

const getGroupCode = async (groupCode) => {
  let params = {
    groupCode
  }
  let list = await axios.get('/api/groupCode/gc', params)
  groupCodeList = list.data;
}

onMounted(() => {
  getQualityList();
})


</script>

<template>
  <div class="container-fluid p-3">
    <div class="row search-color">
    <!-- 상단 검색 영역 -->
    <div class="row mb-3">
      <div class="col-md-2">
        <label class="form-label">검사명</label>
        <input type="text" class="form-control" v-model="qualSchData.testNameSch">
      </div>
      <div class="col-md-2">
        <label class="form-label">대상품목</label>
        <input type="text" class="form-control" v-model="qualSchData.testTargetSch">
      </div>
      <div class="col-md-2">
        <label class="form-label">참조</label>
        <input type="text" class="form-control" v-model="qualSchData.testRefSch">
      </div>
      <div class="col-md-2">
        <label class="form-label">사용여부</label>
        <input type="radio" class="form-check-input" value="0b1b" v-model="qualSchData.useYn">
        <label for="0b1b">Y</label>
        <input type="radio" class="form-check-input" value="0b2b" v-model="qualSchData.useYn">
        <label for="0b2b">N</label>
        <div>
           {{ qualSchData.useYn }}
        </div>
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
          <div class="card-body p-2">

        <tabulator-card
          card-title="품질 기준 목록"
          :table-data="qualityList"
          :table-columns="qualityColumns"
        />
        </div>
      </div>

      <!-- 우측 상세 항목 -->
<div class="col-md-5 d-flex flex-column">
  <div class="card mb-2 flex-grow-1" style="min-height: 350px;">
    <div class="card-header d-flex justify-content-between align-items-center">
      <span>검사항목 상세</span>
      <button class="btn btn-sm btn-success">저장</button>
    </div>
    <div class="card-body p-2">
      <table class="table table-bordered table-sm align-middle mb-2">
        <tbody>
          <tr>
            <th style="width: 30%;">검사명</th>
            <td><input type="text" class="form-control form-control-sm" v-model="testName"></td>
          </tr>
          <tr>
            <th>대상품목</th>
            <td><input type="text" class="form-control form-control-sm" v-model="testTarget"></td>
          </tr>
          <tr>
            <th>검사방법</th>
            <td><input type="text" class="form-control form-control-sm" v-model="testMethod"></td>
          </tr>
          <tr>
            <th>참조</th>
            <td><input type="text" class="form-control form-control-sm" v-model="testRef"></td>
          </tr>
          <tr>
            <th>검사기준</th>
            <td><input type="text" class="form-control form-control-sm" v-model="testStandard"></td>
          </tr>
          <tr>
            <th>비고</th>
            <td><textarea class="form-control" v-model="testNote"></textarea></td>
          </tr>
          <tr>
            <th>참고자료</th>
            <td>
              <div class="d-flex gap-2">
                <input type="file" name="" id="">
                <!-- <img src="img1.png" alt="img1" style="height: 60px;"> -->
              </div>
              <!-- 필요 시 v-model 바인딩 -->
              <!-- <input type="text" class="form-control form-control-sm mt-1" v-model="detailField7"> -->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- 품질기준 이력 -->
  <div class="card flex-shrink-0 thisCard">
    <tabulator-card
      card-title="품질기준 이력"
      :table-data="qualityHistoryList"
      :table-columns="qualityHistoryColumns"
      height="auto"
    />
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
card {
  height: auto;
}
</style>