<script setup>
import { onMounted, reactive, ref, computed } from "vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import axios from "axios";
import groupcodelist from "../../assets/js/utils/groupcodelist.js";
import moment from 'moment';
import Swal from 'sweetalert2';

import EquiMaint from "../Equipment/EquiMaint.vue";

let equiList = ref([]);
let equiInfo = ref({});
let equiMaintHistoryList = ref([]);
let equiTypeCodeList = ref([]);
let equiSchDateList = ref([]);
let equiHistoryList = reactive([]);
let equiuseYn = ref([]);
let imageInput = ref();
let equiStatus = ref([]);
let maintCate = ref([]);


//설비기준정보 컬럼
const equiListColumns = [
  { title: "설비코드", field: "equi_code", width: 120},
  { title: "설비명", field: "equi_name", width: 160},
  {
    title: "사용여부",
    field: "use_yn",
    formatter: (cell) => {
      const code = cell.getValue();
      const matched = equiuseYn.value.find(item => item.detail_code == code);
      return matched ? matched.detail_name : code;
    },
    width: 120
  },
 {
  title: "설비상태",
  field: "equi_status",
  formatter: (cell) => {
    const code = cell.getValue();
    const matched = equiStatus.value.find(item => item.detail_code === code);
    const name = matched ? matched.detail_name : code;

    // 상태에 따라 클래스 매핑
    const classMap = {
      '0u1u': 'btn-success text-white',  // 가동가능
      '0u2u': 'btn-warning text-dark',   // 가동중
      '0u3u': 'btn-secondary text-white',// 점검
      '0u4u': 'btn-danger text-white'    // 고장
    };

    const className = classMap[code] || 'bg-light text-dark';

    return `<div class="px-2 py-1 rounded text-center ${className}">
      ${name}
    </div>`;
  },
  width: 120
},
  {
  title: "점검예정일",
  field: "check_date",
  formatter: (cell) => {
    const value = cell.getValue();
    return value ? moment(value).format("YYYY-MM-DD") : "";
  }
},
  { title: "비고", field: "equi_note"},
];

//설비이력 컬럼
`equi_code, cate, start_date, end_date, history_detail, history_note, emp_num`
const equiMaintHistoryColumns = [
  { title: "분류", field: "cate",
    formatter: (cell) => {
      const code = cell.getValue();
      const matched = maintCate.value.find(item => item.detail_code == code);
      return matched ? matched.detail_name : code;
    },},
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
  useYn: ['0b1b'],
  equiStatus: ['0u1u'],
}

const equiSchData = ref({
  ...equiSch
})

const getEquiList = async () => {
  let params = {
    ...equiSchData.value
  }

  let list = await axios.get('/api/equipment').catch(err => console.log(err));
  const equiFilter = list.data.filter(item => {
     let matchUseYn = true;
  let matchEquiStatus = true;

  if (params.useYn && params.useYn.length === 1) {
    matchUseYn = params.useYn.includes(item.use_yn);
  }

  if (params.equiStatus && params.equiStatus.length > 0) {
    matchEquiStatus = params.equiStatus.includes(item.equi_status);
  }

  return matchUseYn && matchEquiStatus;
  })
  equiList.value = equiFilter;
}

const EquiSearchHandler = async () => {
  const params = {
    ...equiSchData.value,
    startDate: equiSchData.value.startDate ? moment(equiSchData.value.startDate).format('YYYY-MM-DD') : '',
    endDate: equiSchData.value.endDate ? moment(equiSchData.value.endDate).format('YYYY-MM-DD') : '',
  };
  const res = await axios.get('/api/equipment', {
    params
  }).catch(err => console.log(err));
  equiList.value = res.data;
  
  const equiFilter = res.data.filter(item => {
     let matchUseYn = true;
  let matchEquiStatus = true;

  if (params.useYn && params.useYn.length === 1) {
    matchUseYn = params.useYn.includes(item.use_yn);
  }

  if (params.equiStatus && params.equiStatus.length > 0) {
    matchEquiStatus = params.equiStatus.includes(item.equi_status);
  }

  return matchUseYn && matchEquiStatus;
  })
  equiList.value = equiFilter;
}

const EquiSearchReset = () => {
  equiSchData.value = {
    ...equiSch
  };
  getEquiList();
}

const saveEquiMaster = async () => {
 if (!equiInfo.value.equi_name?.trim()) {
    Swal.fire({ text: '설비명을 입력해주세요.', icon: 'warning' });
    return;
  }
  if (!equiInfo.value.use_yn) {
    Swal.fire({ text: '사용여부를 선택해주세요.', icon: 'warning' });
    return;
  }
  if (!equiInfo.value.equi_type?.trim()) {
    Swal.fire({ text: '설비유형을 선택해주세요.', icon: 'warning' });
    return;
  }

  const formData = new FormData();

  const today = moment();
  const lastCheck = equiInfo.value.last_check ? moment(equiInfo.value.last_check) : null;
  const installDate = equiInfo.value.install_date ? moment(equiInfo.value.install_date) : today;
  const checkInterval = parseInt(equiInfo.value.check_interval) || 0;

  let computedCheckDate = '';

  // 1. 점검 예정일이 이미 있으면 그대로 사용
  if (equiInfo.value.check_date) {
    computedCheckDate = moment(equiInfo.value.check_date);
  } else {
    // 2. 점검 예정일 없으면 lastCheck + checkInterval (있으면)
    if (lastCheck && checkInterval > 0) {
      computedCheckDate = lastCheck.clone().add(checkInterval, 'days');
    } else {
      // 3. 그 외에는 설치일 + 30일
      computedCheckDate = installDate.clone().add(30, 'days');
    }
  }

  formData.append('equi_name', equiInfo.value.equi_name || '');
  formData.append('use_yn', equiInfo.value.use_yn || '');
  formData.append('model_name', equiInfo.value.model_name || '');
  formData.append('maker', equiInfo.value.maker || '');
  formData.append('make_date', moment(equiInfo.value.make_date).format('YYYY-MM-DD HH:mm:ss') || '');
  formData.append('install_date', installDate.format('YYYY-MM-DD HH:mm:ss'));
  formData.append('equi_type', equiInfo.value.equi_type || '');
  formData.append('check_interval', equiInfo.value.check_interval || '');
  formData.append('equi_note', equiInfo.value.equi_note || '');
  formData.append('check_date', computedCheckDate.format('YYYY-MM-DD HH:mm:ss'));

  let file = imageInput.value?.files[0];
  if(file){
    formData.append('image', file);
  }

  //equi_code 없으면 등록
  if(!equiInfo.value.equi_code){
    let insertResult = await axios.post('/api/equipment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (insertResult.data.isSuccessed) {
      Swal.fire({
        text: "설비 등록이 완료되었습니다.",
        icon: "success"
      });
    } else {
      Swal.fire({
        text: "설비 등록 중 오류가 발생했습니다.",
        icon: "error"
      });
    }
  } else {
    //있으면 수정
    formData.append('equi_code', equiInfo.value.equi_code);
    let updateResult = await axios.put(`/api/equipment/${equiInfo.value.equi_code}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    if (updateResult.data.isUpdated) {
      Swal.fire({
        text: "설비 수정이 완료되었습니다.",
        icon: "success"
      });
    } else {
      Swal.fire({
        text: "설비 수정 중 오류가 발생했습니다.",
        icon: "error"
      });
    }
    }

  await getEquiList();
  equiInfo.value = {};
  equiMaintHistoryList.value = []
  equiInfo.value = {
    equi_name: '',
    use_yn: '',
    model_name: '',
    maker: '',
    make_date: '',
    install_date: '',
    equi_type: '',
    check_interval: '',
    equi_note: '',
    check_date: '',
    equi_img: '',
    last_check: ''
  };
  if (imageInput.value) {
    imageInput.value.value = ''
  };
}

const tabulatorOptions = {
    selectableRows: 1, //행선택가능
    selectableRowsPersistence: false, //페이지변경시 선택상태 유지 안함
};

const tabulatorEvents = [
  {
    eventName: "rowClick",
    eventAction: async (e, row) => {
      const rowData = row.getData();
      selectedEquiCode.value = rowData.equi_code;
      selectedEquiName.value = rowData.equi_name;
      console.log(selectedEquiCode.value);
      console.log(selectedEquiName.value);
        const info = await axios.get(`/api/equipment/${rowData.equi_code}`);
        equiInfo.value = info.data;
        const historyList = await axios.get(`/api/equipment/history/${rowData.equi_code}`);
        equiHistoryList.splice(0, equiHistoryList.length);
        if(historyList.data.length > 0){
          equiHistoryList.splice(0, equiHistoryList.length, ...historyList.data);
        }
    }
  }
];

const makeDateStr = computed({
  get() { return equiInfo.value.make_date ? moment(equiInfo.value.make_date).format('YYYY-MM-DD') : ''; },
  set(val) { equiInfo.value.make_date = val; }
});

const installDateStr = computed({
  get() { return equiInfo.value.install_date ? moment(equiInfo.value.install_date).format('YYYY-MM-DD') : ''; },
  set(val) { equiInfo.value.install_date = val; }
});

const checkDateStr = computed({
  get() { return equiInfo.value.check_date ? moment(equiInfo.value.check_date).format('YYYY-MM-DD') : ''; },
  set(val) { equiInfo.value.check_date = val; }
});

onMounted(() => {
  groupcodelist.groupCodeList('1C', equiTypeCodeList);
  groupcodelist.groupCodeList('0V', equiSchDateList);
  groupcodelist.groupCodeList('0B', equiuseYn);
  groupcodelist.groupCodeList('0U', equiStatus);
  groupcodelist.groupCodeList('0T', maintCate)
  getEquiList();
})

const intervalReset = (e) => {
  if(e.target.value < 0){
      e.target.value = 0;
  }
}

// 모달 열기/닫기 상태 제어
const isMaintModalOpen = ref(false);

// 모달에 전달할 props 상태
const maintType = ref('0t1t');  // 초기값: 점검
const selectedEquiCode = ref('');
const selectedEquiName = ref('');
const loggedInEmpNum = ref('emp1234');  // 실제 사원번호는 로그인 정보에서 받아서 세팅

// 설비 목록에서 행 클릭 시 설비 정보 세팅 (기존 rowClick 이벤트 내에 추가 가능)
const onEquiRowClick = (rowData) => {
  selectedEquiCode.value = rowData.equi_code;
  selectedEquiName.value = rowData.equi_name;
};

// 점검, 고장, 수리 버튼 눌렀을 때 실행할 함수들
const openMaintModal = (type) => {
  if (!selectedEquiCode.value) {
    Swal.fire({ text: '먼저 설비를 선택해주세요.', icon: 'warning' });
    return;
  }
  console.log(type);
  maintType.value = type;  // '0t1t', '0t2t', '0t3t'
  isMaintModalOpen.value = true;
};

</script>

<template>
  <div class="container-fluid p-3 full-height">
    <!-- 상단 검색 영역 -->
    <div class="search-area bg-white rounded p-3 mb-3 shadow-sm">
     <div class="row">
  <!-- 설비명 -->
  <div class="col-md-1">
    <label class="form-label">설비명</label>
    <input type="text" class="form-control" v-model="equiSchData.equiName" onfocus="this.select()" />
  </div>

  <!-- 설비 유형 -->
  <div class="col-md-1">
    <label class="form-label">설비 유형</label>
    <select class="form-select" v-model="equiSchData.equiType">
      <option value="">-</option>
      <option v-for="target in equiTypeCodeList" :key="target.detail_code" :value="target.detail_code">
        {{ target.detail_name }}</option>
    </select>
  </div>

  <!-- 조회 기간 -->
  <div class="col-md-3">
    <label class="form-label">조회 기간</label>
    <div class="row g-1">
      <div class="col-md-5">
        <input type="date" class="form-control" v-model="equiSchData.startDate" />
      </div>
      <div class="col-md-2 text-center">
        <span class="mt-2 d-inline-block">~</span>
      </div>
      <div class="col-md-5">
        <input type="date" class="form-control" v-model="equiSchData.endDate" />
      </div>
    </div>
  </div>

  <!-- 사용 여부 -->
  <div class="col-md-2">
    <label class="form-label">사용 여부</label>
    <div v-for="yn in equiuseYn" :key="yn.detail_code" class="form-check">
      <input class="form-check-input" type="checkbox"
             v-model="equiSchData.useYn"
             :value="yn.detail_code"
             :id="yn.detail_code" />
      <label class="form-check-label" :for="yn.detail_code">{{ yn.detail_name }}</label>
    </div>
  </div>

  <!-- 설비 상태 -->
  <div class="col-md-3">
    <label class="form-label">설비 상태</label>
    <div class="row">
      <div class="col-6" v-for="state in equiStatus" :key="state.detail_code">
        <div class="form-check">
          <input type="checkbox" class="form-check-input"
                 v-model="equiSchData.equiStatus"
                 :value="state.detail_code"
                 :id="'sch'+state.detail_code" />
          <label class="form-check-label" :for="'sch'+state.detail_code">
            {{ state.detail_name }}
          </label>
        </div>
      </div>
    </div>
  </div>

  <!-- 버튼 -->
  <div class="col-md-2 d-inline-flex  justify-content-end align-items-center mt-2">
    <button class="btn btn-secondary me-2" @click="EquiSearchReset">초기화</button>
    <button class="btn btn-primary" @click="EquiSearchHandler">조회</button>
  </div>
</div>
    </div>

    <!-- 본문 영역 -->
    <div class="content-area d-flex gap-3">
      <!-- 좌측 목록 -->
      <div class="col-md-7 d-flex flex-column overflow-auto">
        <tabulator-card class="flex-grow-1" 
        card-title="설비 목록" 
        :table-data="equiList" 
        :table-columns="equiListColumns"
        :on="tabulatorEvents" 
        :tabulatorOptions="tabulatorOptions"
        height="576px" />
      </div>

      <!-- 우측 상세 + 이력 -->
      <div class="col-md-5 d-flex flex-column overflow-hidden">
        <!-- 상세 카드 -->
        <div class="card mb-2 detail-card">
          <div class="card-header header-fixed mb-3 mt-3 d-flex align-items-center gap-2">
            <h5 class="mt-0 text-start flex-grow-1">설비 상세</h5>
            <button class="btn btn-secondary" @click="openMaintModal('0t1t')">점검</button>
            <button class="btn btn-danger" @click="openMaintModal('0t3t')">수리</button>
            <button class="btn btn-success" @click="saveEquiMaster">저장</button>
          </div>
          <div class="card-body detail-body">
            <table class="table table-bordered table-sm align-middle mb-2">
              <tbody>
                <tr>
                  <th style="width: 15%;">설비명</th>
                  <td style="width: 35%;">
                    <input type="text" class="form-control form-control-sm" v-model="equiInfo.equi_name"  onfocus="this.select()">
                  </td>
                  <th style="width: 15%;">사용여부</th>
                  <td style="width: 35%;">
                    <div v-for="yn in equiuseYn" :key="yn.detail_code" class="form-check form-check-inline">
                      <input type="radio" :value="yn.detail_code" :id="yn.detail_code" v-model="equiInfo.use_yn"
                        class="form-check-input">
                      <label :for="yn.detail_code" class="form-check-label">{{ yn.detail_name }}</label>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>모델명</th>
                  <td><input type="text" class="form-control form-control-sm" v-model="equiInfo.model_name"  onfocus="this.select()"></td>
                  <th>제조사</th>
                  <td><input type="text" class="form-control form-control-sm" v-model="equiInfo.maker"  onfocus="this.select()"></td>
                </tr>
                <tr>
                  <th>제조일</th>
                  <td><input type="date" class="form-control form-control-sm" v-model="makeDateStr"></td>
                  <th>설비 설치일</th>
                  <td><input type="date" class="form-control form-control-sm" v-model="installDateStr"></td>
                </tr>
                <tr>
                  <th>설비유형</th>
                  <td>
                    <select class="form-select form-select-sm" v-model="equiInfo.equi_type">
                      <option value="">-</option>
                      <option v-for="target in equiTypeCodeList" :key="target.detail_code" :value="target.detail_code">
                        {{ target.detail_name }}
                      </option>
                    </select>
                  </td>
                  <th>마지막 점검일</th>
                  <td>{{ equiInfo.last_check ? moment(equiInfo.last_check).format('YYYY-MM-DD HH:mm:ss') : '' }}</td>
                </tr>
                <tr>
                  <th>점검 예정일</th>
                  <td><input type="date" class="form-control form-control-sm" v-model="checkDateStr"></td>
                  <th>점검 간격</th>
                  <td>
                    <div class="d-flex align-items-center">
                      <input type="number" min="1" class="form-control form-control-sm me-1" style="width: 80%;"  onfocus="this.select()"
                        v-model="equiInfo.check_interval" @blur="intervalReset">
                      <span>일</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>비고</th>
                  <td colspan="3"><textarea class="form-control" v-model="equiInfo.equi_note"  onfocus="this.select()"></textarea></td>
                </tr>
                <tr>
                  <th>이미지</th>
                  <td colspan="3">
                    <input type="file" ref="imageInput" />
                    <div v-if="equiInfo.equi_img" class="image-preview mt-2">
                      <img :src="`/api/getimgs/${equiInfo.equi_img}`" style="max-height: 150px;" />
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

        <!-- 이력 카드 -->
        <div class="card mb-2 detail-card">

          <div class="card flex-grow-1 overflow-auto">
            <tabulator-card card-title="설비 비가동 이력" :table-data="equiMaintHistoryList"
              :table-columns="equiMaintHistoryColumns" height="137px" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 점검/수리 모달 -->
   <EquiMaint
  v-if="isMaintModalOpen"
  :type="maintType"
  :equiCode="selectedEquiCode"
  :equiName="selectedEquiName"
  :empNum="loggedInEmpNum"
  :installDate="equiInfo.install_date"
  :faultDate="equiInfo.last_check"
  :lastCheck="equiInfo.last_check"
  :nextCheck="equiInfo.check_date"
  @close="isMaintModalOpen = false"
/>
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