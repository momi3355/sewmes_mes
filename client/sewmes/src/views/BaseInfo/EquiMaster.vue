<script setup>
import { onMounted, reactive, ref } from "vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import axios from "axios";
import groupcodelist from "../../assets/js/utils/groupcodelist";

let equiList = ref([]);
let equiInfo = ref({});
let equiMaintHistoryList = ref([]);
let equiTypeCodeList = ref([]);
let equiSchDateList = ref([]);


const equiListColumns = [
  { title: "설비코드", field: "equi_code"},
  { title: "설비명", field: "equi_name"},
  { title: "사용여부", field: "use_yn"},
  { title: "비고", field: "equi_note"},
];

`equi_code, cate, start_date, end_date, history_detail, history_note, emp_num`
const equiMaintHistoryColumns = [
  { title: "분류", field: "cate"},
  { title: "일시", field: "start_date"},
  { title: "작업자", field: "emp_num"},
  { title: "상세내용", field: "history_detail"},
  { title: "비고", field: "history_note"},
];
// `설비명 설비유형 조회기간 사용여부 점검예정일`
// `조회기간 선택: installDate, checkDate, lastCheck(설비설치일, 점검예정일, 마지막 점검일)`
const equiSch = {
  equiName: '',
  equiType: '',
  schDate: '',
  startDate: '',
  endDate: '',
  useYn: '0b1b',
}

const equiSchData = ref({
  ...equiSch
})

const EquiSearchHandler = () => {
  
}

const EquiSearchReset = () => {

}

const saveEquiMaster = () => {

}

const tabulatorEvents = [
  {
    eventName: "rowClick",
    eventAction: async (e, row) => {
      const rowData = row.getData();
        // const info = await axios.get(`/api/quality/${rowData.quality_code}`);
        // qualityInfo.value = info.data;
        // const historyList = await axios.get(`/api/quality/history/${rowData.quality_code}`);
        // if(historyList.data.length > 0){
          // qualityHistoryList.push(historyList.data);
        // }
    }
  }
];

onMounted(() => {
  groupcodelist.groupCodeList('1C', equiTypeCodeList);
  groupcodelist.groupCodeList('0V', equiSchDateList);
})

</script>

<template>
  <div class="container-fluid p-3 full-height">
    <!-- 상단 검색 영역 -->
    <div class="search-area bg-white rounded p-3 mb-3 shadow-sm">
      <div class="row">
        <div class="col-md-2">
          <label class="form-label">설비명</label>
          <input type="text" class="form-control" v-model="equiSchData.equiName" />
        </div>
        <div class="col-md-2">
          <label class="form-label">설비 유형</label>
          <!-- <input type="text" class="form-control" v-model="equiSchData.testTarget" /> -->
           <select class="form-select" v-model="equiSchData.equiType">
            <option value="">-</option>
            <option v-for="target in equiTypeCodeList" :key="target.detail_code" value="target.detail_code">{{ target.detail_name }}</option>
           </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">조회 기간</label>
          <input type="text" class="form-control" v-model="equiSchData.startDate" /> ~ <input type="text" class="form-control" v-model="equiSchData.endDate" />
           <select class="form-select" v-model="equiSchData.schDate">
            <option value="">-</option>
            <option v-for="target in equiSchDateList" :key="target.detail_code" value="target.detail_code">{{ target.detail_name }}</option>
           </select>
        </div>
        <div class="col-md-2">
          <label class="form-label d-block">사용여부</label>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="0b1b" value="0b1b" v-model="equiSchData.useYn" />
            <label class="form-check-label" for="0b1b">사용</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="0b2b" value="0b2b" v-model="equiSchData.useYn" />
            <label class="form-check-label" for="0b2b">비사용</label>
          </div>
        </div>
        <div class="col-md-2">
          <!-- <label class="form-label">점검 예정일 순으로 정렬</label> -->
          <!-- <input type="text" class="form-control" v-model="equiSchData.testName" /> -->
        </div>
        <div class="col-md-2 d-flex align-items-end gap-2">
          <button class="btn btn-outline-secondary w-50" @click="EquiSearchReset">초기화</button>
          <button class="btn btn-primary w-50" @click="EquiSearchHandler">조회</button>
        </div>
      </div>
    </div>

    <!-- 본문 영역 -->
    <div class="content-area d-flex gap-3">
      <!-- 좌측 목록 -->
      <div class="col-md-7 d-flex flex-column overflow-auto">
        <tabulator-card
          class="flex-grow-1"
          card-title="설비 목록"
          :table-data="equiList"
          :table-columns="equiListColumns"
          :on="tabulatorEvents"
        />
      </div>

      <!-- 우측 상세 + 이력 -->
      <div class="col-md-5 d-flex flex-column overflow-hidden">
        <!-- 상세 카드 -->
        <div class="card mb-2 detail-card">
          <div class="card-header header-fixed mb-3 mt-3">
            <span>설비 상세</span>
            <button class="btn btn-sm btn-warning">수정</button>
            <button class="btn btn-sm btn-success" @click="saveEquiMaster">저장</button>
          </div>
          <div class="card-body detail-body">
            <table class="table table-bordered table-sm align-middle mb-2">
              <tbody>
                <tr>
                  <th style="width: 30%;">설비명</th>
                  <td><!-- <input type="text" :key="qualityInfo.quality_code" class="form-control form-control-sm" v-model="qualityInfo.test_name"> --></td>
                   <th>사용여부</th>
                </tr>
                <tr>
                  <th>모델명</th>
                  <!-- <td><select class="form-select" v-model="qualityInfo.test_target">
                      <option value="">선택하세요</option>
                      <option v-for="target in testTargetCodeList" :key="target.detail_code" :value="target.detail_code">
                        {{ target.detail_name }}
                      </option>
                      </select>
                  </td> -->
                </tr>
                <tr>
                  <th>제조사</th>
                  <td><!-- <input type="text" class="form-control form-control-sm" v-model="qualityInfo.test_method">--></td> 
                   <th>제조일</th>
                   <td><input type="text"></td>
                </tr>
                <tr>
                  <th>설비 설치일</th>
                  <td><!-- <input type="text" class="form-control form-control-sm" v-model="qualityInfo.test_ref"> --></td>
                   <th>설비유형</th>
                   <td></td>
                </tr>
                <tr>
                  <th>마지막 점검일</th>
                  <!-- <td><input type="text" class="form-control form-control-sm" v-model="qualityInfo.test_standard"></td> -->
                </tr>
                <tr>
                  <th>점검 예정일</th>
                  <td><!--<input type="text" class="form-control form-control-sm" v-model="qualityInfo.test_standard">--></td>
                   <th>점검 간격</th>
                   <td><input type="text" name="" id=""></td>
                </tr>
                <tr>
                  <th>비고</th>
                  <!-- <td><textarea class="form-control" v-model="qualityInfo.test_note"></textarea></td> -->
                </tr>
                <tr>
                  <th>이미지</th>
                  <td>
                    <input type="file" ref="imageInput" />
                    <!-- <div v-if="qualityInfo.ref_img" class="image-preview">
                      <img src="/uploads/qualityInfo.ref_img">
                    </div> -->
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 이력 카드 -->
        <div class="card flex-grow-1 overflow-auto">
          <tabulator-card
            card-title="설비 비가동 이력"
            :table-data="equiMaintHistoryList"
            :table-columns="equiMaintHistoryColumns"
            height="auto"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.full-height {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.search-area {
  flex-shrink: 0;
}

.content-area {
  flex: 1;
  overflow: hidden;
}

.image-preview {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 5px;
}

.image-preview img {
  max-height: 100px;
  border: 1px solid #ccc;
  padding: 3px;
  background: #fff;
}

.header-fixed {
  height: 50px;
  padding: 10px 15px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #dee2e6;
}

.detail-card {
  flex-shrink: 0;
}

.detail-body {
  max-height: 350px;
  overflow-y: auto;
  padding: 10px;
}
</style>