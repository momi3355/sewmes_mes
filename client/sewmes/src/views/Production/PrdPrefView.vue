<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import moment from 'moment';
import Swal from "sweetalert2"; // SweetAlert2 추가

// ArgonButton, DefaultInfoCard, TabulatorCard 컴포넌트 임포트
import ArgonButton from "@/components/ArgonButton.vue";
import DefaultInfoCard from "@/examples/Cards/DefaultInfoCard.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import groupcodelist from "../../assets/js/utils/groupcodelist";
// 검색 필드 정의 (생산실적 검색 필드)
const searchField1 = ref(""); // 작업일시
const searchField2 = ref(""); // 공정분류
const searchField3 = ref(""); // 지시코드
const searchField4 = ref(""); // 담당자

// --- 생산실적 데이터 ---
const productPrefData = ref([]);

// Tabulator 컬럼 정의
const prodPrefColumns = [
   { title: "지시코드", field: "work_perf_code", width: 120, hozAlign: "center"},
  { title: "지시코드", field: "work_inst_code", width: 200 },
  { title: "공정명", field: "process_name", width: 180 },
  { title: "공정순서", field: "process_seq", width: 150, hozAlign: "right" },
  { title: "제품명", field: "prod_name", width: 200 },
  { title: "투입량", field: "input_qty", width: 150, hozAlign: "right" },
  { title: "생산량", field: "prod_qty", width: 150 , hozAlign: "right"},
  { title: "불량수량", field: "defect_qty", width: 150, hozAlign: "right" },
  { title: "작업시작일", field: "work_start_date", width: 220 ,
        hozAlign: "right", formatter: function(cell){
            const value = cell.getValue();
            return value ? moment(value).format('YYYY-MM-DD') : ''; // 값이 있을 때만 포맷, 없으면 빈 문자열
        }
  },
  { title: "작업종료일", field: "work_end_date", width: 220 ,
        hozAlign: "right", formatter: function(cell){
            const value = cell.getValue();
            return value ? moment(value).format('YYYY-MM-DD') : ''; // 값이 있을 때만 포맷, 없으면 빈 문자열
        }},
];

// 상세 보기 섹션에 표시될 선택된 제품 데이터
const perfdetailinfo = ref(null);
// 불량 유형 드롭다운에 바인딩될 값
const newDefectType = ref("");
// 비고(Notes) 입력 필드에 바인딩될 값
const newNotes = ref("");


const defecttypeList = ref([]);


// 검색 필드 초기화
const resetbtn = () => {
  searchField1.value = "";
  searchField2.value = "";
  searchField3.value = "";
  searchField4.value = "";
  // 실제 데이터 재조회 또는 필터링 로직 구현 (예: searchAllField();)
};
//초기 데이터로딩 함수
const fetchInitialData = async () => {
    try {
        const response = await axios.get('/api/getprdPrefAll'); // 백엔드 API 호출
        if (response.status === 200) {
            productPrefData.value = response.data; // 받아온 데이터를 productPrefData에 할당
            console.log("초기 데이터 로드 성공:", productPrefData.value); // 확인용 로그
        } else {
            console.error("초기 데이터 로드 실패:", response.data.message);
            alert("초기 데이터 로드 실패: " + (response.data.message || "알 수 없는 오류"));
        }
    } catch (error) {
        console.error("API 호출 중 오류 발생:", error);
        alert("서버 연결 오류 또는 데이터 로드 실패: " + error.message);
    }
};
// 검색 실행 (예시)
const searchAllField = () => {
  // 실제 검색 API 호출 또는 productPrefData 필터링 로직 구현
  alert(
    `검색 조건: ${searchField1.value}, ${searchField2.value}, ${searchField3.value}, ${searchField4.value}`
  );
  // 여기에 필터링된 데이터를 productPrefData.value에 할당
  // 예: productPrefData.value = originalFullData.filter(...)
};

// 불량 유형 및 비고 저장 함수 ✨ 이 함수를 아래와 같이 수정합니다.
const saveDefectType = async () => {
  // 1. 상세 정보가 선택되었는지 확인
  if (!perfdetailinfo.value) {
    Swal.fire({
      title: "제품 선택 필요",
      text: "상세 정보를 업데이트할 제품을 선택하세요.",
      icon: "warning",
    });
    return;
  }

  // 2. 현재 상세 정보 (업데이트 대상) 참조
  const productToUpdate = perfdetailinfo.value;

  // 3. 업데이트 전의 원본 값 백업 (알림 메시지용)
  const originalDefectType = productToUpdate.defect_type;
  const originalNotes = productToUpdate.notes;

  try {
    // 4. 백엔드 업데이트 API 호출 (PUT 요청)
    const response = await axios.put('/api/production/defect-update', {
      work_inst_code: productToUpdate.work_inst_code, // 백엔드에서 WHERE 절에 사용할 키
      defect_type: newDefectType.value,              // 드롭다운에서 선택된 새 불량 유형
      notes: newNotes.value                          // 텍스트 필드에 입력된 새 비고
    });

    if (response.status === 200) {
      // 5. API 호출 성공 시, 프론트엔드 데이터 동기화

      // 5-1. 메인 테이블 (productPrefData) 업데이트
      // Tabulator가 이 변경을 감지하고 UI를 갱신할 수 있도록 직접 값을 업데이트합니다.
      const index = productPrefData.value.findIndex(
        (p) => p.work_inst_code === productToUpdate.work_inst_code
      );
      if (index !== -1) {
        productPrefData.value[index].defect_type = newDefectType.value;
        productPrefData.value[index].notes = newNotes.value;
      }

      // 5-2. 상세 보기 UI (perfdetailinfo) 업데이트
      perfdetailinfo.value.defect_type = newDefectType.value;
      perfdetailinfo.value.notes = newNotes.value;

      // 6. 성공 알림 표시 (SweetAlert2)
      const oldDefectTypeName = defecttypeList.value.find(
        (type) => type.detail_code === originalDefectType
      )?.detail_name || originalDefectType; // 원본 불량 유형 코드 -> 이름
      const newDefectTypeName = defecttypeList.value.find(
        (type) => type.detail_code === newDefectType.value
      )?.detail_name || newDefectType.value; // 새 불량 유형 코드 -> 이름

      Swal.fire({
        title: "저장 성공",
        html: `**[${productToUpdate.work_inst_code}]**<br>불량 유형: "${oldDefectTypeName}" ➡️ "${newDefectTypeName}"<br>비고: "${originalNotes || ''}" ➡️ "${newNotes.value || ''}"`,
        icon: "success",
      });
    } else {
      // 7. API 응답 상태 코드가 200이 아닐 경우 (백엔드에서 실패 응답)
      console.error("저장 실패 (API 응답 오류):", response.data.message);
      Swal.fire({
        title: "저장 실패",
        text: response.data.message || "데이터 저장 중 오류가 발생했습니다.",
        icon: "error",
      });
    }
  } catch (error) {
    // 8. 네트워크 오류 또는 기타 예외 발생 시
    console.error("저장 실패 (네트워크 또는 서버 오류):", error);
    Swal.fire({
      title: "서버 연결 오류",
      text: "데이터를 저장하는 도중 서버와 통신 오류가 발생했습니다.",
      icon: "error",
    });
  }
};

const tabulatorOptions = {
  selectableRows: 1, // 단일 행 선택 허용

};

const tabulatorEvents=[
  {
    eventName:"rowClick",
    eventAction:async(e,row)=> {
      const rowData = row.getData(); // 클릭된 행의 Tabulator 내부 데이터

      // 1. 상세 정보 API 호출 전에 빠르게 UI 입력 필드에 현재 값 반영
      // rowData에 defect_type과 notes(pref_note)가 있다면 바로 사용
      newDefectType.value = rowData.defect_type || "";
      newNotes.value = rowData.notes || ""; // 백엔드에서 pref_note를 notes로 alias 했으므로 notes 사용

      // 2. 상세 정보 UI 초기화 (데이터 로딩 중임을 시각적으로 보여줌)
      perfdetailinfo.value = null;

      try {
        // 3. 백엔드 상세 조회 API 호출
        // URL 파라미터로 work_inst_code 전달
        const response = await axios.get(`/api/getPrdPerf/${rowData.work_perf_code}`);

        if (response.status === 200 && response.data) {
          // 4. API 응답 성공 시, perfdetailinfo에 상세 데이터 할당
          perfdetailinfo.value = response.data;
          console.log("상세 데이터 로드 성공:", perfdetailinfo.value);

          // 5. API 응답 데이터로 입력 필드 재확인 또는 업데이트 (선택 사항)
          // 보통 백엔드 상세 조회 API가 가장 정확한 데이터를 주므로, 재할당하는 것이 좋습니다.
          newDefectType.value = perfdetailinfo.value.defect_type || "";
          newNotes.value = perfdetailinfo.value.notes || "";

        } else {
          console.error("상세 데이터 로드 실패:", response.data.message || "데이터 없음");
          Swal.fire("상세 정보 로드 실패", response.data.message || "상세 데이터를 불러오지 못했습니다.", "error");
          perfdetailinfo.value = null; // 실패 시 상세 정보 초기화
          newDefectType.value = ""; // 입력 필드도 초기화
          newNotes.value = "";
        }
      } catch (error) {
        console.error("상세 데이터 API 호출 중 오류 발생:", error);
        Swal.fire("서버 연결 오류", "상세 데이터를 불러오는 도중 오류가 발생했습니다.", "error");
        perfdetailinfo.value = null; // 오류 시 상세 정보 초기화
        newDefectType.value = ""; // 입력 필드도 초기화
        newNotes.value = "";
      }
    }
  }
]

onMounted(() => {
  groupcodelist.groupCodeList('0Q', defecttypeList);
  fetchInitialData();
});
</script>

<template>
  <div class="container-fluid p-3">
    <div class="row search-color">
      <div class="row mb-3">
        <div class="col-md-2">
          <label class="form-label" for="work_start_date">조회 기간</label>
          <input type="text" class="form-control" v-model="searchField1" />
        </div>
        <div class="col-md-2">
          <label class="form-label">공정분류</label>
          <input type="text" class="form-control" v-model="searchField2" />
        </div>
        <div class="col-md-2">
          <label class="form-label">지시코드</label>
          <input type="text" class="form-control" v-model="searchField3" />
        </div>
        <div class="col-md-2">
          <label class="form-label">담당자</label>
          <input type="text" class="form-control" v-model="searchField4" />
        </div>
        <div class="col-md-2 d-flex align-items-end">
          <button class="btn btn-secondary me-2" @click="resetbtn">초기화</button>
          <button class="btn btn-primary" @click="searchAllField">조회</button>
        </div>
      </div>
    </div>
    <div class="row mt-4">
      <div class="col-8">
        <tabulator-card
          card-title="생산실적목록"
          :table-data="productPrefData"
          :table-columns="prodPrefColumns"
          :tabulator-options="tabulatorOptions"
          :on="tabulatorEvents"
        />
      </div>

      <div class="col-4"> <div class="card h-100">
          <div class="card-header pb-0 p-3">
            <h6 class="mb-0">생산 불량 상세</h6>
          </div>
          <div class="card-body p-3">
            <template v-if="perfdetailinfo">
              <div class="mb-3">
                <label class="form-label">지시코드:</label>
                <p class="form-control-static">{{ perfdetailinfo.work_inst_code }}</p>
              </div>
              <div class="mb-3">
                <label class="form-label">제품명:</label>
                <p class="form-control-static">{{ perfdetailinfo.prod_name }}</p>
              </div>
              <div class="mb-3">
                <label class="form-label">불량수량:</label>
                <p class="form-control-static">{{ perfdetailinfo.defect_qty }}</p>
              </div>

              <div class="mb-3">
                <label for="defectTypeSelect" class="form-label">불량유형:</label>
                <select id="defectTypeSelect" class="form-select" v-model="newDefectType">
                  <option value="">-- 선택 --</option>
                  <option
                    v-for="type in defecttypeList"
                    :key="type.detail_code"
                    :value="type.detail_code"
                  >
                    {{ type.detail_name }}
                  </option>
                </select>
              </div>
                <div class="mb-3">
                    <label class="form-label">공정명(상세):</label>
                    <p class="form-control-static">{{ perfdetailinfo.process_name }}</p>
                </div>
              <div class="mb-3">
                <label class="form-label">담당자(상세):</label>
                <p class="form-control-static">{{ perfdetailinfo.emp_name || perfdetailinfo.emp_num }}</p>
              </div>
              <div class="mb-3">
                <label for="notesInput" class="form-label">비고:</label>
                <textarea id="notesInput" class="form-control" rows="3" v-model="newNotes"></textarea>
              </div>

              <div class="d-flex justify-content-end">
                <button class="btn btn-primary" @click="saveDefectType">저장</button>
              </div>
            </template>
            <template v-else>
              <p class="text-center text-muted">테이블에서 행을 클릭하여 상세 정보를 확인하세요.</p>
            </template>
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
  background-color: #fff;
}
.card {
  border-radius: 15px;
}
.form-control-static {
  padding-top: calc(0.375rem + 1px);
  padding-bottom: calc(0.375rem + 1px);
  margin-bottom: 0;
  line-height: 1.5;
  background-color: #e9ecef; /* Light background for static text */
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding-left: 0.75rem;
}

.selected-row {
  background-color: #e0f7fa !important; /* 연한 하늘색 */
  font-weight: bold; /* 텍스트 굵게 */
  border-left: 3px solid #007bff; /* 왼쪽 테두리 강조선 */
}
</style>