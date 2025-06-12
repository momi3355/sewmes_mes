<script setup>
import axios from 'axios';
import { ref, shallowRef, computed, onBeforeMount, onMounted } from "vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import { useRouter } from 'vue-router';

const router = useRouter();

const processData = ref([]);
const processTableRef = ref(null);

const searchProcessCode = ref('');
const searchProcessName = ref('');
const searchEquiType = ref('');

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
  { title: "상세", field: "detail", width: 150 },
  { title: "설비 유형", field: "equiType", width: 150 }
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
  // 유효성 검사
  if (!df.processName?.trim()) {
    alert("공정명을 입력하세요.");
    return;
  }

  if (!df.detail?.trim()) {
    alert("공정 상세 내용을 입력하세요.");
    return;
  }
  if (isNaN(Number(df.needTime))) {
    alert("소요 시간은 숫자만 입력 가능합니다.");
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
      alert(`신규 등록 완료: ${result.data.processCode}`);
    } else {
      // 수정
      await axios.put('/api/processUpdate', df);
      alert("수정 완료");
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
    alert("등록 중 오류");
  }
};

const deleteProcess = async () => {
  if (!detailFields.value.processCode) {
    alert("삭제할 공정이 선택되지 않았습니다.");
    return;
  }

  const confirmed = confirm("정말 삭제하시겠습니까?");
  if (!confirmed) return;

  try {
    await axios.delete(`/api/processDelete/${detailFields.value.processCode}`);
    alert("삭제 완료");
    await getProcessList();
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
    alert("삭제 중 오류 발생");
  }
};

onBeforeMount(() => {
  // getProcessList();
})
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
</script>

<template>
  <div class="container-fluid p-3">
    <div class="row search-color">  
    <!-- 상단 검색 영역 -->
    <div class="row mb-3">
      <div class="col-md-2">
        <label class="form-label">공정코드</label>
        <input type="text" class="form-control" v-model="searchProcessCode">
      </div>
      <div class="col-md-2">
        <label class="form-label">공정명</label>
        <input type="text" class="form-control" v-model="searchProcessName">
      </div>
      <div class="col-md-2">
        <label class="form-label">설비 유형</label>
        <input type="text" class="form-control" v-model="searchEquiType">
      </div>
      <div class="col-md-4 d-flex align-items-end">
        <button class="btn btn-primary me-2" @click="searchProcess" style="margin-right: 10px;">조회</button>
        <button class="btn btn-secondary" @click="resetSearch">초기화</button>
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
                <input type="text" class="form-control" v-model="detailFields.equiType">
              </div>
              <div class="col-md-12">
                <label class="form-label">소요시간</label>
                <input type="text" class="form-control" v-model="detailFields.needTime">
              </div>
              <div class="col-md-12">
                <div class="form-label">작업 구분</div>
                <div>
                  <label><input type="radio" value="0m1m" v-model="detailFields.processType"> 내작업</label>
                  <label><input type="radio" value="0m2m" v-model="detailFields.processType"> 외주</label>
                  <label><input type="radio" value="0m3m" v-model="detailFields.processType" checked> 상관없음</label>
                </div>
              </div>
              <div class="col-md-12">
                <div class="form-label">사용 여부</div>
                <div>
                  <label><input type="radio" value="0b1b" v-model="detailFields.useYn" checked> 사용</label>
                  <label><input type="radio" value="0b2b" v-model="detailFields.useYn"> 비사용</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 우측 하단 이력 그리드 (옵션)
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
        </div> -->

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