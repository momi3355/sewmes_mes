<script setup>
import { onBeforeMount, onMounted, reactive, ref } from "vue";
import { useStore } from "vuex";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import axios from "axios";
import groupcodelist from "../../assets/js/utils/groupcodelist";
import Swal from "sweetalert2";

let qualityList = ref([]);
let qualityInfo = ref({});
let qualityHistoryList = reactive([]);
let testTargetCodeList = ref([]);
let imageInput = ref();
let useYnDetail = ref([]);

// 부서별 권한 관련
const store = useStore(); 
const dept = ref("");
onBeforeMount(() => {
  dept.value = store.state.user.dept;
})
const canShow = (allowedDepts) => {
  return allowedDepts.includes(dept.value);
};

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
  { title: "버전", field: "quality_ver", width: 80},
  { title: "검사명", field: "test_name"}, 
  { title: "대상 품목", field: "test_target",
    formatter: (cell) => {
      const code = cell.getValue();
      const matched = testTargetCodeList.value.find(item => item.detail_code == code);
      return matched ? matched.detail_name : code;
    }, },
  { title: "검사 방법", field: "test_method"},
  { title: "참조", field: "test_ref"},
  { title: "검사 기준", field: "test_standard"},];

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
  const testName = qualityInfo.value.test_name?.trim();
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
  //품질 코드 없으면 등록
  if (!qualityInfo.value.quality_code) {
    let insertRes = await axios.post('/api/quality', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    if (insertRes.data.isSuccessed) {
      Swal.fire({
        text: "성공적으로 등록되었습니다.",
        icon: "success"
      })
      await getQualityList();
      qualityInfo.value = {};
      if (imageInput.value) {
        imageInput.value.value = ''
      };
    } else {
      Swal.fire({
        text: "처리 중 오류가 발생했습니다.",
        icon: "error"
      })
    }
  } else {
    //없으면 갱신 여부 물어봄 
    Swal.fire({
      text: "품질 기준 정보를 갱신하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "확인",
      cancelButtonText: "취소",
    }).then(async (result) => {
      if (result.isConfirmed) {
        let renewRes = await axios.put(`/api/quality/renew/${qualityInfo.value.quality_code}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log(renewRes);
        if (renewRes.data.isSuccessed) {
          Swal.fire({
            text: "갱신되었습니다.",
            icon: "success"
          });
          await getQualityList();
          qualityInfo.value = {};
          if (imageInput.value) {
            imageInput.value.value = ''
          };
        } else {
          Swal.fire({
            text: "처리 중 오류가 발생했습니다.",
            icon: "error"
          })
        }
      }
    });

  }



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
        qualityHistoryList.splice(0, qualityHistoryList.length);
        if(historyList.data.length > 0){
          qualityHistoryList.splice(0, qualityHistoryList.length, ...historyList.data);
        }
    }
  }
];

const showImgModal = ref(false);
const modalImgSrc = ref(null);

const openImageModal = (src) => {
  modalImgSrc.value = src;
  showImgModal.value = true;
};

const closeImageModal = () => {
  showImgModal.value = false;
  modalImgSrc.value = null;
};

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
          <label class="form-label search-label">검사명</label>
          <input type="text" class="form-control" v-model="qualSchData.testName" onfocus="this.select()" />
        </div>
        <div class="col-md-2">
          <label class="form-label search-label">대상품목</label>
          <select class="form-select form-select-sm" v-model="qualSchData.testTarget">
            <option value="" disabled>선택하세요</option>
            <option v-for="target in testTargetCodeList" :key="target.detail_code" :value="target.detail_code">
              {{ target.detail_name }}
            </option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label search-label">참조</label>
          <input type="text" class="form-control" v-model="qualSchData.testRef" onfocus="this.select()" />
        </div>
        <div class="col-md-2">
          <label class="form-label search-label">사용여부</label>
          <div class="form-check" v-for="yn in useYnDetail">
            <input class="form-check-input" type="checkbox" v-model="qualSchData.useYn" :value="yn.detail_code"
              :id="'sch'+yn.detail_code" />
            <label class="form-check-label" :for="'sch'+yn.detail_code">
              {{ yn.detail_name }}
            </label>
          </div>
        </div>
        <div class="col-md-2 d-flex align-items-end justify-content-end  gap-2">
          <button class="btn btn-outline-secondary w-50" @click="qualitySearchReset">초기화</button>
          <button class="btn btn-primary w-50" @click="qualitySearchHandler">조회</button>
        </div>
      </div>
    </div>

    <!-- 본문 영역 -->
    <div class="content-area d-flex gap-3">
      <!-- 좌측 목록 -->
      <div class="col-md-7 d-flex flex-column">
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
            <button class="btn btn-sm btn-success" @click="saveQualityMaster" v-if="canShow(['0c2c', '0c3c', '0c4c', '0c5c'])">저장</button>
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
                  <!-- 참고자료 셀 -->
                  <td colspan="3">
                    <!-- 이미지 썸네일과 모달 -->
                    <div v-if="qualityInfo.ref_img" class="image-preview mt-2" style="cursor:pointer;">
                      <img :src="`/api/getimgs/${qualityInfo.ref_img}`" style="max-height: 150px;"
                        @click="openImageModal(`/api/getimgs/${qualityInfo.ref_img}`)" alt="참고 이미지" />
                    </div>

                    <!-- 파일 입력은 항상 보여줌 -->
                    <input type="file" ref="imageInput" />

                    <!-- 모달 -->
                    <div v-if="showImgModal" class="modal-overlay" @click.self="closeImageModal">
                      <div class="modal-content">
                        <button class="btn btn-close" style="color: red;" @click="closeImageModal">X</button>
                        <img :src="modalImgSrc" style="max-width: 600px; max-height: 800px;" />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card mb-2 detail-card">
        <!-- 이력 카드 -->
        <div class="card flex-grow-1">
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
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.modal-content {
  position: relative;
  background: white;
  padding: 10px;
  border-radius: 4px;
}
.btn-close {
  position: absolute;
  top: 5px;
  right: 8px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

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

.search-label {
  font-size: medium;
}
</style>