<script setup>
import { ref, nextTick, watch } from "vue"; 
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import ProductionPlanModal from "./ProductionPlanModal.vue";
import axios from 'axios';

// 실제 작업지시 데이터
const workInstData = ref([]); //초기에는 빈값

// 작업지시컬럼
const workInstColumns = [
    {
        formatter: "rowSelection", // Tabulator.js의 행 선택 포맷터 사용
        titleFormatter: "rowSelection", // 헤더에도 전체 선택/해제 체크박스 표시
        hozAlign: "center", // 가운데 정렬
        headerSort: false, // 헤더 클릭 시 정렬 방지
        width: 80, // 컬럼 너비
        cssClass: 'tabulator-checkbox-column' // 필요에 따라 CSS 클래스 추가
    },
    { title: "NO", field: "NO", width: 80 },
    { title: "작업지시코드", field: "work_inst_code", width: 180 , visible: false },
    { title: "생산계획코드", field: "prod_plan_code", width: 180, visible: false },
    { title: "제품코드", field: "prod_code", width: 180, editor: "input" }, // 💡 field: "prdcode" -> field: "prdname"으로 수정
    { title: "지시수량", field: "inst_qty", width: 180, editor: "input" },
    { title: "납기일자", field: "dd", width: 180, editor: "input" },
    { title: "지시상태", field: "inst_state", hozAlign: "center" },
    { title: "담당자", field: "emp_num", width: 120, editor: "input" },
    { title: "지시서등록일자", field: "inst_reg_date", width: 150, editor: "input" },
];

const tabulatorOptions = {
    selectableRows: true,
    selectableRowsPersistence: false,
};

//생산계획 모달에서 데이터받아, 작업지시서 화면의 그리드에 표시될 데이터 추가하는 함수
const handleSelectedPlans = (plans) => {
    const newWorkInsts = plans.map((plan, index) => ({
        NO: workInstData.value.length + index + 1,
        work_inst_code: '', //지시코드 자동생성 저장전에는 빈값
        prod_plan_code: plan.prod_plan_code,
        prod_code: plan.prod_code, // 💡 prdname으로 매핑
        inst_qty: plan.prod_qty,
        worksd: '', // 그리드 표시용
        workdd: '', // 그리드 표시용
        dd: plan.dead_date, //주문상세테이블과 조인해서 가져올 납기일자
        state: '생산 전', //초기상태
        emp_num: '', // 담당자번호 초기화
        inst_date: '', // 지시일자 초기화
        inst_reg_date: '', // 등록일자 초기화
    }));
    workInstData.value = [...workInstData.value, ...newWorkInsts];
    // TabulatorCard의 table-data 프롭스가 업데이트되면 Tabulator 내부에서 자동으로 setData를 호출할 것으로 기대
    // 따라서 이 부분은 주석 처리 유지 (TabulatorCard.vue를 수정할 수 없기 때문)
    // if(tabulatorCardRef.value&&tabulatorCardRef.value.table){
    //   tabulatorCardRef.value.table.setData(workInstData.value);
    // }
};

// 모달 표시 상태
const isModalOpen = ref(false); //초기상태
const openModal = () => {
    isModalOpen.value = true; //isModalOpen 값 true 변경해 모달 열기
};
const closeModal = () => {
    isModalOpen.value = false;
};

//검색필드용 반응형 변수들 선언/ 입력값 컨테이너, 실제 검색 동작은 별도 함수 호출 선언
const searchField1 = ref(''); //작업일시
const searchField2 = ref(''); //제품명
const searchField3 = ref(''); //지시상태
const searchField4 = ref(''); //담당자자

//행추가 함수(생산계획 목록 없이 작업지시 생성)
const addRow = () => {
    //새로운 행을 위한 NO값 생성
    const newNo = workInstData.value.length > 0 ? Math.max(...workInstData.value.map(item => item.NO || 0)) + 1 : 1;
    //새로운 빈 행 데이터 객체 생성
    const newRow = {
        NO: newNo,
        inst_qty: 0, //지시수량 사용자입력
        inst_state: '생산 전', //초기상태
        emp_num: '',
        inst_date: '',
        inst_reg_date: '',
    }
    workInstData.value.push(newRow);
    nextTick(() => {
      if (tabulatorCardRef.value && tabulatorCardRef.value.table) {
        tabulatorCardRef.value.table.setData(workInstData.value);
      }
    });
}

// tabulatorCardRef 컴포넌트의 ref 선언
const tabulatorCardRef = ref(null);

// ✨ 추가: ref가 할당될 때까지 기다리는 watch
watch(tabulatorCardRef, (newValue) => {
    if (newValue) {
        console.log('tabulatorCardRef가 할당되었습니다:', newValue);
        // 여기서 바로 Tabulator 인스턴스에 접근하는 것은 여전히 타이밍 문제가 있을 수 있음.
        // saveWorkInstructions 함수에서 nextTick과 setTimeout을 통해 다시 시도.
    }
});

// 짧은 지연을 위한 헬퍼 함수
const delay = ms => new Promise(res => setTimeout(res, ms));


// 저장 함수
const saveWorkInstructions = async () => {
    try {
        console.log('--- saveWorkInstructions 시작 ---');
        console.log('workInstData.value (현재 Vue 반응형 데이터):', workInstData.value); //

        // 1. TabulatorCard 컴포넌트의 Vue 인스턴스가 ref에 할당될 때까지 기다림
        let retryCount = 0;
        while (!tabulatorCardRef.value && retryCount < 10) { // 최대 10번 시도 (1초)
            console.log(`tabulatorCardRef.value가 아직 null입니다. 재시도 (${retryCount + 1}/10)...`);
            await delay(100); // 100ms 대기
            retryCount++;
        }

        if (!tabulatorCardRef.value) {
            alert("TabulatorCard 컴포넌트 인스턴스를 찾을 수 없습니다. 페이지 로딩 후 다시 시도해주세요.");
            console.error("TabulatorCard 인스턴스가 존재하지 않습니다.");
            console.log('--- saveWorkInstructions 종료 (TabulatorCard 인스턴스 없음) ---');
            return;
        }

        // 2. Vue의 DOM 업데이트를 기다림
        await nextTick(); //
        console.log('nextTick 완료. tabulatorCardRef.value.$el:', tabulatorCardRef.value.$el);

        // 3. Tabulator 라이브러리 초기화가 완료될 시간을 벌어줌 (가장 중요)
        //    TabulatorCard 내부에서 Tabulator 초기화가 비동기적으로 이루어질 수 있음
        await delay(200); // 200ms 대기 (필요시 이 값을 늘려보세요)
        console.log('200ms 지연 완료. 이제 Tabulator 인스턴스에 접근 시도.');

        const table = tabulatorCardRef.value?.$el?.__tabulator;
        console.log('Tabulator 인스턴스 (table):', table); //

        if (!table) {
            alert("Tabulator 테이블 인스턴스를 찾을 수 없습니다. 페이지 로딩 후 다시 시도해주세요. (재시도 필요)"); //
            console.error("Tabulator 인스턴스가 존재하지 않습니다. (tabulatorCardRef.value?.$el?.__tabulator 값이 null 또는 undefined)"); //
            console.log('--- saveWorkInstructions 종료 (Tabulator 인스턴스 없음) ---');
            return;
        }

        // 💡 수정: 선택된 행만 가져오도록 변경
        const rawData = table.getSelectedData();
        console.log('Tabulator에서 가져온 rawData (선택된 행만):', rawData);

        // 필요한 작업지시 데이터 가져오기 (DB 스키마에 맞게 필터링)
        const dataToSave = rawData.map(row => ({
            // NO: row.NO, // NO는 DB에 저장되지 않는 임시 번호이므로 제외
            work_inst_code: row.work_inst_code,
            prod_plan_code: row.prod_plan_code,
            inst_qty: row.inst_qty,
            prod_code:row.prod_code,
            
        }));
        console.log('저장할데이터 (dataToSave - 선택된 행):', dataToSave);

        // 데이터가 없는 경우 알림
        if (dataToSave.length === 0) {
            alert("선택된 작업지시 데이터가 없습니다.");
            console.log('--- saveWorkInstructions 종료 (선택된 데이터 없음) ---');
            return;
        }

        // Axios를 사용하여 데이터 전송
        console.log('Axios POST 요청 시작. 경로: /workInstMngment/save');
        const response = await axios.post('/workInstMngment/save', {
            workInstructions: dataToSave
        });
        console.log('Axios POST 요청 응답:', response);

        // 성공/실패 응답 처리
        if (response.data.success) {
            alert("선택된 작업지시가 성공적으로 저장되었습니다.");
            console.log('--- saveWorkInstructions 성공적으로 완료 ---');
        } else {
            console.error("작업지시 저장 실패", response.data.message);
            console.log('--- saveWorkInstructions 실패 (서버 응답 오류) ---');
        }
    } catch (error) {
        console.error("작업지시 저장 중 오류 발생:", error);
        if (error.response) {
            console.error("서버 오류:", error.response.data);
        } else if (error.request) {
            console.error("네트워크 오류: 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요.");
        } else {
            console.error(`예상치 못한 오류: ${error.message}`);
        }
        console.log('--- saveWorkInstructions 종료 (예외 발생) ---');
    }
}
</script>

<template>
    <div class="container-fluid p-3">
        <div class="row search-color">
            <div class="row mb-3">
                <div class="col-md-2">
                    <label class="form-label">작업일시</label>
                    <input type="text" class="form-control" v-model="searchField1">
                </div>
                <div class="col-md-2">
                    <label class="form-label">제품명</label>
                    <input type="text" class="form-control" v-model="searchField2">
                </div>
                <div class="col-md-2">
                    <label class="form-label"> 지시상태</label>
                    <input type="text" class="form-control" v-model="searchField3">
                </div>
                <div class="col-md-2">
                    <label class="form-label">담당자</label>
                    <input type="text" class="form-control" v-model="searchField4">
                </div>
                <div class="col-md-2 d-flex align-items-end">
                    <button class="btn btn-secondary me-2" @click="resetbtn">초기화</button>
                    <button class="btn btn-primary" @click="searchAllField">조회</button>
                </div>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-12">
                <button class="btn btn-info" @click="openModal">생산계획서 불러오기</button>
                <button class="btn btn-success ms-2 " @click="saveWorkInstructions">저장</button>
                <button class="btn btn-secondary ms-2" @click="addRow">행추가</button>
            </div>
        </div>

        <div class="col-12 mt-4">
            <tabulator-card
                ref="tabulatorCardRef"
                card-title="작업지시서 작성"
                :table-data="workInstData"
                :table-columns="workInstColumns"
                :tabulatorOptions="tabulatorOptions"
            />
        </div>

        <ProductionPlanModal
            v-bind:isModalOpen="isModalOpen"
            v-on:select-plans="handleSelectedPlans"
            v-on:close-modal="closeModal"
        />
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