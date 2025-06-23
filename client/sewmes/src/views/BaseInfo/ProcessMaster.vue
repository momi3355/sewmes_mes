<script setup>
import axios from 'axios';
import { ref, onMounted } from "vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import groupcodelist from "../../assets/js/utils/groupcodelist";
import Swal from 'sweetalert2';


const processData = ref([]);
const processTableRef = ref(null);
const searchProcessCode = ref('');
const searchProcessName = ref('');
const searchEquiType = ref('');

// 공통 코드 변환 객체, 함수 ======================
const euqiTypeList = ref([]);
const euqiTypeMap = ref({});

const loadEquiTypeList = async () => {
  await groupcodelist.groupCodeList('1C', euqiTypeList);
  // 리스트를 Map 형태로 변환
  euqiTypeMap.value = Object.fromEntries(
    euqiTypeList.value.map(item => [item.detail_code, item.detail_name])
  );
};
// 공통코드 변환
const convertCode = (code) => {
  return euqiTypeMap.value[code] || code;
};
// =============================

const resetSearch = async () => {
  searchProcessCode.value = '';
  searchProcessName.value = '';
  searchEquiType.value = '';
};
const searchProcess = async () => {
  const params = {};

  if (searchProcessCode.value.trim()) params.code = searchProcessCode.value.trim();   // 공정코드
  if (searchProcessName.value.trim()) params.name = searchProcessName.value.trim();   // 공정명
  if (searchEquiType.value.trim()) params.equi = searchEquiType.value.trim();   // 설비유형

  try {
    const result = await axios.get('/api/processList', { params });
    // 예시: result.data 배열로 가정
    processData.value = result.data.map((item, idx) => ({
      rowNum: idx + 1,
      processCode: item.process_code,
      processName: item.process_name,
      detail: item.detail,
      equiType: item.equi_type,
      needTime: item.need_time,
      processType: item.process_type,
      useYn: item.use_yn
    }));
    // 마지막 빈행 추가가
    processData.value.push({
      rowNum: processData.value.length + 1,
      processCode: '',
      processName: '',
      detail: '',
      equiType: '',
      needTime: '',
      processType: '',
      useYn: ''
    });
  } catch (err) {
    console.error("API 호출 오류:", err);
  }
}

const processColumns = [
  { title: "No", field: "rowNum", width: 80 },
  { title: "공정 코드", field: "processCode", width: 120 },
  { title: "공정명", field: "processName", width: 150 },
  { title: "상세", field: "detail" },
  { title: "설비 유형", field: "equiType", width: 150,
    formatter: (cell) => convertCode(cell.getValue())
  }
];

// detailField는 모든 입력값을 포함한 객체로 구성
const detailFields = ref({
  processCode: '',
  processName: '',
  detail: '',
  equiType: '',
  needTime: '',
  processType: '',
  useYn: ''
});

const saveProcess = async () => {
  const df = detailFields.value;
  console.log(df.equiType);
  // 유효성 검사
  if (!df.processName?.trim()) {
    Swal.fire({ title: "미입력", text: "공정명을 입력하세요", icon: "error" });
    return;
  }

  if (!df.detail?.trim()) {
    Swal.fire({ title: "미입력", text: "공정 상세 내용을 입력하세요", icon: "error" });
    return;
  }
  if (isNaN(Number(df.needTime))) {
    Swal.fire({ title: "오입력", text: "소요 시간은 숫자만 입력 가능합니다", icon: "error" });
    return;
  }
  // 기본값 설정
  df.equiType = df.equiType || '';
  df.needTime = df.needTime || '0';
  df.processType = df.processType || '0m3m'; // 상관없음
  df.useYn = df.useYn || '0b1b';             // 사용
  try {
    if (!df.processCode) {
      // 신규 등록
      const result = await axios.post('/api/processInsert', df);
      Swal.fire({ title: "완료", text: `신규 등록 완료: ${result.data.processCode}`, icon: "success" });
    } else {
      // 수정
      await axios.put('/api/processUpdate', df);
      Swal.fire({ title: "완료", text: "수정 완료", icon: "success" });
    }
    await searchProcess(); // 목록 갱신
    // 입력란 초기화
    detailFields.value = {
      processCode: '',
      processName: '',
      detail: '',
      equiType: '',
      needTime: '',
      processType: '0m3m',
      useYn: '0b1b'
    };
  } catch (err) {
    console.error(err);
    Swal.fire({ title: "오류", text: "등록 중 오류", icon: "error" });
  }
};

const deleteProcess = async () => {
  if (!detailFields.value.processCode) {
    Swal.fire({ title: "미선택", text: "삭제할 공정이 선택되지 않았습니다", icon: "error" });
    return;
  }

  // 확인/취소 메시지 
  const result = await Swal.fire({
    title: '공정 삭제',
    text: '정말 삭제하시겠습니까?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '예, 진행합니다',
    cancelButtonText: '취소'
  });

  if (!result.isConfirmed) return;

  try {
    await axios.delete(`/api/processDelete/${detailFields.value.processCode}`);
    Swal.fire({ title: "완료", text: "삭제 완료", icon: "success" });
    await searchProcess();
    // 폼 초기화
    detailFields.value = {
      processCode: '',
      processName: '',
      detail: '',
      equiType: '',
      needTime: '',
      processType: '0m3m',
      useYn: '0b1b'
    };
  } catch (err) {
    console.error(err);
    Swal.fire({ title: "오류", text: "삭제 중 오류 발생", icon: "error" });
  }
};


const tabulatorEvent = [
  {
    eventName: "rowClick",
    eventAction: (e, row) => {
      const rowData = row.getData();
      if (!rowData.processCode) {
        // 빈 행일 경우 초기화
        detailFields.value = {
          processCode: '',
          processName: '',
          detail: '',
          equiType: '',
          needTime: '',
          processType: '0m3m', // 상관없음
          useYn: '0b1b'         // 사용
        };
      } else {
        detailFields.value = {
          processCode: rowData.processCode,
          processName: rowData.processName,
          detail: rowData.detail,
          equiType: rowData.equiType,
          needTime: rowData.needTime,
          processType: rowData.processType,
          useYn: rowData.useYn
        };
      }
    }
  }
];

onMounted(() => {
  loadEquiTypeList();
  searchProcess();
  groupcodelist.groupCodeList('1C',euqiTypeList);
})
</script>

<template>
  <div class="container-fluid p-3">
    <div class="search-area bg-white rounded p-3 mb-3 shadow-sm">  
    <!-- 상단 검색 영역 -->
    <div class="row">
      <div class="col-md-2">
        <label class="form-label search-label">공정코드</label>
        <input type="text" class="form-control" v-model="searchProcessCode">
      </div>
      <div class="col-md-2">
        <label class="form-label search-label">공정명</label>
        <input type="text" class="form-control" v-model="searchProcessName">
      </div>
      <div class="col-md-2">
        <label class="form-label search-label">설비 유형</label>
        <select class="form-select" v-model="searchEquiType">
          <option value="">선택하세요</option>
          <option v-for="type in euqiTypeList":key="type.detail_code" :value="type.detail_code">
            {{ type.detail_name }}
          </option>
        </select>
      </div>
      <div class="col-md-2 d-flex align-items-end gap-2">
        <button class="btn btn-outline-secondary w-50" @click="resetSearch">초기화</button>
        <button class="btn btn-primary w-50" @click="searchProcess">조회</button>
      </div>
    </div>
    </div>

    <!-- 중간 본문: 좌측 테이블 / 우측 상세 -->
    <div class="row">
      <!-- 좌측 Tabulator 영역 -->
      <div class="col-md-7">
        <tabulator-card
          ref="processTableRef"
          card-title="공정 목록"
          :height="550"
          :table-data="processData"
          :table-columns="processColumns"
          :on="tabulatorEvent"
        />
      </div>

      <!-- 우측 상세 항목 -->
      <div class="col-md-5">
        <div class="card mb-3">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span>공정 등록</span>
            <div>
              <button class="btn btn-sm btn-success" @click="saveProcess" style="margin-right: 10px;">저장</button>
              <button class="btn btn-sm btn-delete" @click="deleteProcess" style="background-color: red; color: black;">삭제</button>
            </div>
          </div>
          <div class="card-body">
            <div class="row mb-2">
              <div class="col-md-12">
                <label class="form-label">공정 코드(자동)</label>
                <input type="text" class="form-control" v-model="detailFields.processCode" disabled>
              </div>
              <div class="col-md-12">
                <label class="form-label">공정 이름(필수)</label>
                <input type="text" class="form-control" v-model="detailFields.processName">
              </div>
              <div class="col-md-12">
                <label class="form-label">공정 상세(필수)</label>
                <input type="text" class="form-control" v-model="detailFields.detail">
              </div>
              <div class="col-md-12">
                <label class="form-label">설비 유형</label>
                <select class="form-select" v-model="detailFields.equiType">
                  <option value="">선택하세요</option>
                  <option v-for="type in euqiTypeList":key="type.detail_code" :value="type.detail_code">
                    {{ type.detail_name }}
                  </option>
                </select>
              </div>
              <div class="col-md-12">
                <label class="form-label">소요시간</label>
                <input type="text" class="form-control" v-model="detailFields.needTime">
              </div>
              <div class="col-md-12">
                <div class="form-label">작업 구분</div>
                <div class="form-check use-radio">
                  <input class="form-check-input" type="radio" value="0m1m" id="form-0m1m" v-model="detailFields.processType">
                  <label class="form-check-label" for="form-0m1m">내작업</label>
                </div>
                <div class="form-check use-radio">
                  <input class="form-check-input" type="radio" value="0m2m" id="form-0m2m" v-model="detailFields.processType">
                  <label class="form-check-label" for="form-0m2m">외주</label>
                </div>
                <div class="form-check use-radio">
                  <input class="form-check-input" type="radio" value="0m3m" id="form-0m3m" v-model="detailFields.processType" checked>
                  <label class="form-check-label" for="form-0m3m">상관없음</label>
                </div>
              </div>
              <div class="col-md-12">
                <div class="form-label">사용 여부</div>
                <div class="form-check use-radio">
                  <input class="form-check-input" type="radio" value="0b1b" id="form-0b1b" v-model="detailFields.useYn" checked>
                  <label class="form-check-label" for="form-0b1b">사용</label>
                </div>
                <div class="form-check use-radio">
                  <input class="form-check-input" type="radio" value="0b2b" id="form-0b2b" v-model="detailFields.useYn">
                  <label class="form-check-label" for="form-0b2b">비사용</label>
                </div>
              </div>
            </div>
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
.use-radio {
  display: inline-block;
  padding-right: 15px;
}
.search-label {
  font-size: medium;
}
.full-height {
  height: 840px;
  display: flex;
  flex-direction: column;
}
</style>  