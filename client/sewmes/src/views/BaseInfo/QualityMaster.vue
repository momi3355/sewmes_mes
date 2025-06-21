<script setup>
import { onMounted, reactive, ref } from "vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import axios from "axios";
import groupcodelist from "../../assets/js/utils/groupcodelist";

let qualityList = ref([]);
let qualityInfo = ref({});
let qualityHistoryList = reactive([]);
let testTargetCodeList = ref([]);
let imageInput = ref();
let useYnDetail = ref([]);

//품질기준정보 컬럼
const qualityColumns = [
  { title: "품질코드", field: "quality_code", width: 120},
  { title: "검사명", field: "test_name", width: 160}, 
  {
    title: "대상품목",
    field: "test_target",
    formatter: (cell) => {
      const code = cell.getValue();
      const matched = testTargetCodeList.value.find(item => item.detail_code == code);
      return matched ? matched.detail_name : code;
    }, 
    width: 120
  },
  { title: "참조", field: "test_ref"},
  {
    title: "사용여부",
    field: "use_yn",
    formatter: (cell) => {
      const code = cell.getValue();
      const matched = useYnDetail.value.find(item => item.detail_code == code);
      return matched ? matched.detail_name : code;
    },
    width: 120
  },
];

//품질기준정보 이력 컬럼
const qualityHistoryColumns = [
  { title: "버전", field: "qualityVer", width: 80},
  { title: "검사명", field: "testName"}, 
  { title: "대상 품목", field: "testTarget"},
  { title: "검사 방법", field: "testMethod"},
  { title: "참조", field: "testRef"},
  { title: "검사 기준", field: "testStandard"},];

const qualitySch = {
  testName: '',
  testTarget: '', 
  testRef: '',
  useYn: ['0b1b']
};

const qualSchData = ref({
  ...qualitySch
});

const getQualityList = async () => {
  let params = {
    ...qualSchData.value
  }
  let list = await axios.get('/api/quality', {
      params
    })
    .catch(err => console.log(err));
    const qualityFilter = list.data.filter(item => {
    let matchUseYn = true;
    if (params.useYn.length === 1) {
      matchUseYn = params.useYn.includes(item.use_yn);
    }
    return matchUseYn;
  })
  qualityList.value = qualityFilter;
  groupcodelist.detailCodeInfo(list.data[0].use_yn);
}

const qualitySearchHandler = async () => {
  const params = {
    ...qualSchData.value
  };
  const res = await axios.get('/api/quality', {
    params
  });
  const qualityFilter = res.data.filter(item => {
    let matchUseYn = true;
    if (params.useYn.length === 1) {
      matchUseYn = params.useYn.includes(item.use_yn);
    }
    return matchUseYn;
  })
  qualityList.value = qualityFilter;
};

const qualitySearchReset = () => {
  qualSchData.value = {
    ...qualitySch
  };
  getQualityList();
};

const saveQualityMaster = async () => {
const testName = qualityInfo.value.test_name ?.trim();
const testTarget = qualityInfo.value.test_target?.trim();

// 기본 유효성 검사
if (!testName || !testTarget) {
  Swal.fire({
    text: '검사명과 대상품목은 필수입니다.',
    icon: 'warning'
  });
  return;
}

  const formData = new FormData();

  formData.append('test_name', qualityInfo.value.test_name || '');
  formData.append('test_target', qualityInfo.value.test_target || '');
  formData.append('test_method', qualityInfo.value.test_method || '');
  formData.append('test_ref', qualityInfo.value.test_ref || '');
  formData.append('test_standard', qualityInfo.value.test_standard || '');
  formData.append('test_note', qualityInfo.value.test_note || '');
  formData.append('use_yn', qualityInfo.value.use_yn || '');
  let file = imageInput.value?.files[0];
  if (file) {
    formData.append('image', file);
  }

  if (!qualityInfo.value.quality_code) {
    await axios.post('/api/quality', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  } else {
    formData.append('quality_code', qualityInfo.value.quality_code);
    await axios.put(`/api/quality/${qualityInfo.value.quality_code}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  await getQualityList();
  qualityInfo.value = {};
  if (imageInput.value) {
    imageInput.value.value = ''
  };

};
  
const tabulatorOptions = {
    selectableRows: 1, //행선택가능
    selectableRowsPersistence: false, //페이지변경시 선택상태 유지 안함
};

const tabulatorEvents = [
  {
    eventName: "rowClick",
    eventAction: async (e, row) => {
      const rowData = row.getData();
        const info = await axios.get(`/api/quality/${rowData.quality_code}`);
        qualityInfo.value = info.data;
        const historyList = await axios.get(`/api/quality/history/${rowData.quality_code}`);
        if(historyList.data.length > 0){
          qualityHistoryList.push(historyList.data);
        }
    }
  }
];

onMounted(() => {
  groupcodelist.groupCodeList('1B', testTargetCodeList);
  groupcodelist.groupCodeList('0B', useYnDetail);
  getQualityList();
})


</script>

<template>
  <div class="container-fluid p-3 full-height">
    <!-- 상단 검색 영역 -->
    <div class="search-area bg-white rounded p-3 mb-3 shadow-sm">
      <div class="row">
        <div class="col-md-2">
          <label class="form-label">검사명</label>
          <input type="text" class="form-control" v-model="qualSchData.testName" onfocus="this.select()" />
        </div>
        <div class="col-md-2">
          <label class="form-label">대상품목</label>
          <select class="form-select form-select-sm" v-model="qualSchData.testTarget">
            <option value="" disabled>선택하세요</option>
            <option v-for="target in testTargetCodeList" :key="target.detail_code" :value="target.detail_code">
              {{ target.detail_name }}
            </option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">참조</label>
          <input type="text" class="form-control" v-model="qualSchData.testRef" onfocus="this.select()" />
        </div>
        <div class="col-md-2">
          <label class="form-label">사용여부</label>
          <div class="form-check" v-for="yn in useYnDetail">
            <input class="form-check-input" type="checkbox" v-model="qualSchData.useYn" :value="yn.detail_code"
              :id="'sch'+yn.detail_code" />
            <label class="form-check-label" :for="'sch'+yn.detail_code">
              {{ yn.detail_name }}
            </label>
          </div>
        </div>
        <div class="col-md-2 d-flex align-items-end gap-2">
          <button class="btn btn-outline-secondary w-50" @click="qualitySearchReset">초기화</button>
          <button class="btn btn-primary w-50" @click="qualitySearchHandler">조회</button>
        </div>
      </div>
    </div>

    <!-- 본문 영역 -->
    <div class="content-area d-flex gap-3">
      <!-- 좌측 목록 -->
      <div class="col-md-7 d-flex flex-column overflow-auto">
        <tabulator-card class="flex-grow-1" 
        card-title="품질 기준 목록" 
        :table-data="qualityList"
        :table-columns="qualityColumns" 
        :on="tabulatorEvents" 
        :tabulatorOptions="tabulatorOptions"
        height="576px" />
      </div>

      <!-- 우측 상세 + 이력 -->
      <div class="col-md-5 d-flex flex-column overflow-hidden">
        <!-- 상세 카드 -->
        <div class="card mb-2 detail-card">
          <div class="card-header header-fixed mb-3 mt-3">
            <h5 class="mt-0 text-start">검사항목 상세</h5>
            <button class="btn btn-sm btn-success" @click="saveQualityMaster">저장</button>
          </div>
          <div class="card-body detail-body">
            <table class="table table-bordered table-sm align-middle mb-2">
              <tbody>
                <tr>
                  <th style="width: 15%;">검사명</th>
                  <td style="width: 35%;">
                    <input type="text" :key="qualityInfo.quality_code" class="form-control form-control-sm"
                      v-model="qualityInfo.test_name" onfocus="this.select()">
                  </td>
                  <th style="width: 15%;">사용여부</th>
                  <td style="width: 35%;">
                    <div class="d-flex align-items-center">
                      <div v-for="yn in useYnDetail" :key="yn.detail_code" class="form-check form-check-inline me-2">
                        <input type="radio" :value="yn.detail_code" :id="'info'+yn.detail_code"
                          v-model="qualityInfo.use_yn" class="form-check-input">
                        <label :for="'info'+yn.detail_code" class="form-check-label">{{ yn.detail_name }}</label>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>대상품목</th>
                  <td colspan="3">
                    <select class="form-select form-select-sm" v-model="qualityInfo.test_target">
                      <option value="">선택하세요</option>
                      <option v-for="target in testTargetCodeList" :key="target.detail_code"
                        :value="target.detail_code">
                        {{ target.detail_name }}
                      </option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>검사방법</th>
                  <td colspan="3">
                    <input type="text" class="form-control form-control-sm" v-model="qualityInfo.test_method" onfocus="this.select()">
                  </td>
                </tr>
                <tr>
                  <th>참조</th>
                  <td colspan="3">
                    <input type="text" class="form-control form-control-sm" v-model="qualityInfo.test_ref" onfocus="this.select()">
                  </td>
                </tr>
                <tr>
                  <th>검사기준</th>
                  <td colspan="3">
                    <input type="text" class="form-control form-control-sm" v-model="qualityInfo.test_standard" onfocus="this.select()">
                  </td>
                </tr>
                <tr>
                  <th>비고</th>
                  <td colspan="3">
                    <textarea class="form-control" v-model="qualityInfo.test_note" onfocus="this.select()"></textarea>
                  </td>
                </tr>
                <tr>
                  <th>참고자료</th>
                  <td colspan="3">
                    <input type="file" ref="imageInput" />
                    <div v-if="qualityInfo.ref_img" class="image-preview mt-2">
                      <img :src="`/api/getimgs/${qualityInfo.ref_img}`" style="max-height: 150px;" />
                    </div>
                    <div v-else>
                      <span class="text-muted">참고 이미지가 없습니다.</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card mb-2 detail-card">
        <!-- 이력 카드 -->
        <div class="card flex-grow-1 overflow-auto">
          <tabulator-card card-title="품질기준 이력" 
          :table-data="qualityHistoryList" 
          :table-columns="qualityHistoryColumns"
          height="137px" />
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.full-height {
  height: 840px;
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
  width: 656px;
}

.detail-body {
  max-height: 350px;
  overflow-y: auto;
  padding: 10px;
}
</style>