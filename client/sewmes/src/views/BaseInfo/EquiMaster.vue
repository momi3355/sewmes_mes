<script setup>
import { onMounted, reactive, ref } from "vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import axios from "axios";
import groupcodelist from "../../assets/js/utils/groupcodelist.js";
import moment from 'moment';

let equiList = ref([]);
let equiInfo = ref({});
let equiMaintHistoryList = ref([]);
let equiTypeCodeList = ref([]);
let equiSchDateList = ref([]);
let equiHistoryList = reactive([]);
let equiuseYn = ref([]);
let imageInput = ref();


//설비기준정보 컬럼
const equiListColumns = [
  { title: "설비코드", field: "equi_code"},
  { title: "설비명", field: "equi_name"},
  { title: "사용여부", field: "use_yn"},
  { title: "비고", field: "equi_note"},
];

//설비이력 컬럼
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

const getEquiList = async () => {
  let params = {
    ...equiSchData.value
  }

  let list = await axios.get('/api/equipment').catch(err => console.log(err));
  equiList.value = list.data;
}

const EquiSearchHandler = () => {
  
}

const EquiSearchReset = () => {

}

const saveEquiMaster = async () => {
  const formData = new FormData();

  formData.append('equi_name', equiInfo.value.equi_name || '');
  formData.append('use_yn', equiInfo.value.use_yn || '');
  formData.append('model_name', equiInfo.value.model_name || '');
  formData.append('maker', equiInfo.value.maker || '');
  formData.append('make_date', equiInfo.value.make_date || '');
  formData.append('install_date', equiInfo.value.install_date || '');
  formData.append('equi_type', equiInfo.value.equi_type || '');
  formData.append('check_interval', equiInfo.value.check_interval || '');
  formData.append('equi_note', equiInfo.value.equi_note || '');

  let file = imageInput.value?.files[0];
  if(file){
    formData.append('image', file);
  }

  if(!equiInfo.value.equi_code){
    //equi_code가 없으면 등록
    let insertResult = await axios.post('/api/equipment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log(insertResult);
  }else if(equiInfo.value.equi_code){
    //equi_code가 있으면 수정
    formData.append('equi_code', equiInfo.value.equi_code);
    let updateResult = await axios.put(`/api/equipment/${equiInfo.value.equi_code}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log(updateResult);
  }
  
}

const tabulatorEvents = [
  {
    eventName: "rowClick",
    eventAction: async (e, row) => {
      const rowData = row.getData();
        const info = await axios.get(`/api/equipment/${rowData.equi_code}`);
        equiInfo.value = info.data;
        const historyList = await axios.get(`/api/equipment/history/${rowData.equi_code}`);
        if(historyList.data.length > 0){
          equiHistoryList.push(historyList.data);
        }
    }
  }
];

onMounted(() => {
  groupcodelist.groupCodeList('1C', equiTypeCodeList);
  groupcodelist.groupCodeList('0V', equiSchDateList);
  groupcodelist.groupCodeList('0B', equiuseYn);
  getEquiList();
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
            <div class="form-check">
  <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
  <label class="form-check-label" for="flexCheckDefault">
    Default checkbox
  </label>
</div>
            <!-- <input class="form-check-input" type="radio" id="0b1b" value="0b1b" v-model="equiSchData.useYn" />
            <label class="form-check-label" for="0b1b">사용</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="0b2b" value="0b2b" v-model="equiSchData.useYn" />
            <label class="form-check-label" for="0b2b">비사용</label> -->
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
            <button class="btn btn-sm btn-success" @click="saveEquiMaster">저장</button>
          </div>
          <div class="card-body detail-body">
            <table class="table table-bordered table-sm align-middle mb-2">
              <tbody>
                <tr>
                  <th style="width: 30%;">설비명</th>
                  <td><input type="text" :key="equiInfo.equi_code" class="form-control form-control-sm"
                      v-model="equiInfo.equi_name"></td>
                  <th>사용여부</th>
                  <td>
                    <div v-for="yn in equiuseYn" :key="yn.detail_code"  class="form-check form-check-inline">
                      <input type="radio" :value="yn.detail_code" :id="yn.detail_code" v-model="equiInfo.use_yn" class="form-check-input" >
                      <label :for="yn.detail_code" class="form-check-label" >{{ yn.detail_name }}</label>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>모델명</th>
                  <td colspan="3"><input type="text" class="form-control form-control-sm" v-model="equiInfo.model_name"></td>
                </tr>
                <tr>
                  <th>제조사</th>
                  <td><input type="text" class="form-control form-control-sm" v-model="equiInfo.maker"></td> 
                   <th>제조일</th>
                   <td><input type="text" class="form-control form-control-sm" v-model="equiInfo.make_date"></td>
                </tr>
                <tr>
                  <th>설비 설치일</th>
                  <td><input type="text" class="form-control form-control-sm" v-model="equiInfo.install_date"></td>
                  <th>설비유형</th>
                  <td><select class="form-select" v-model="equiInfo.equi_type">
                      <option value="">-</option>
                      <option v-for="target in equiTypeCodeList" :key="target.detail_code" :value="target.detail_code">
                        {{ target.detail_name }}</option>
                    </select></td>
                </tr>
                <tr>
                  <th>마지막 점검일</th>
                  <td colspan="3">{{equiInfo.last_check}}</td>
                </tr>
                <tr>
                  <th>점검 예정일</th>
                  <td><input type="text" class="form-control form-control-sm" v-model="equiInfo.check_date"></td>
                   <th>점검 간격</th>
                   <td><input type="text" class="form-control form-control-sm" v-model="equiInfo.check_interval">일</td>
                </tr>
                <tr>
                  <th>비고</th>
                  <td colspan="3"><textarea class="form-control" v-model="equiInfo.equi_note"></textarea></td>
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