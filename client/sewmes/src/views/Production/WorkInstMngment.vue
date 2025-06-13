<script setup>
import { ref, nextTick, watch,onMounted} from "vue"; 
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
    {title:"제품코드", field: "prod_code", width: 180, visible: false },
    { title: "제품명", field: "prod_name", width: 180, editor: "input" }, // 💡 field: "prdcode" -> field: "prdname"으로 수정
    { title: "지시수량", field: "inst_qty", width: 180, editor: "input" },
    { title: "납기일자", field: "dead_date", width: 180 }, // 납기일자 주문테이블에서 백엔드로 가져옴
    { title: "지시상태", field: "inst_state", hozAlign: "center" },
    { title: "담당자", field: "emp_num", width: 120, editor: "input" },
    { title: "지시서등록일자", field: "inst_reg_date", width: 150, editor: "input" },
];

const tabulatorOptions = {
    selectableRows: true, //행선택가능
    selectableRowsPersistence: false, //페이지변경시 선택상태 유지 안함
};
// --- 작업지시 데이터를 백엔드에서 불러오는 함수 정의 ---
const fetchWorkInstructions = async () => {
    try {
        // 백엔드에서 전체 작업지시 목록을 조회하는 API 엔드포인트
        const response = await axios.get('/api/allworkInst'); // 실제 API 경로로 변경하세요.
        if (response.data.success) {
            // 받아온 데이터를 workInstData.value에 할당하여 그리드 갱신
            workInstData.value = response.data.data.map((item, index) => ({
                NO: index + 1, // NO 값은 클라이언트에서 다시 부여
                work_inst_code: item.work_inst_code,
                prod_plan_code: item.prod_plan_code,
                prod_code: item.prod_code,
                prod_name: item.prod_name, // 백엔드에서 가져온 제품명
                inst_qty: item.inst_qty,
                dead_date: item.dead_date,
                inst_state: item.inst_state,
                emp_num: item.emp_num,
                inst_reg_date: item.inst_reg_date,
            }));
            console.log("작업지시 목록이 성공적으로 로드되었습니다:", workInstData.value);
        } else {
            alert(`작업지시 목록 로드 실패: ${response.data.message}`);
            console.error("작업지시 목록 로드 실패:", response.data.message);
        }
    } catch (error) {
        console.error("작업지시 목록 로드 중 오류 발생:", error);
        alert("작업지시 목록 로드 중 예상치 못한 오류가 발생했습니다.");
    }
};

// 컴포넌트가 마운트될 때 (초기 로딩 시) 작업지시 목록을 불러옵니다.
onMounted(() => {
    fetchWorkInstructions();
});


//생산계획 모달에서 데이터받아, 작업지시서 화면의 그리드에 표시될 데이터 추가하는 함수
const handleSelectedPlans = (plans) => {
     console.log("Plans received from modal:", plans); 
    const newWorkInsts = plans.map((plan, index) => ({
        
        NO: workInstData.value.length + index + 1,
        work_inst_code: ' ', //지시코드 자동생성 저장전에는 빈값
        prod_plan_code: plan.prod_plan_code,
        prod_code: plan.prod_code,
        prod_name:plan.prod_name, 
        inst_qty: plan.prod_qty,
        dead_date: plan.dead_date, //주문상세테이블과 조인해서 가져올 납기일자
        inst_state: '0s1s', //초기상태
        emp_num: '', // 담당자번호 초기화
        //inst_date: inst_reg_date 저장버튼 누르면 등록일 나오고 지시버튼 누르면 들어가는 내용
    }));
    workInstData.value = [...workInstData.value, ...newWorkInsts];

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
const searchField4 = ref(''); //담당자

//행추가 함수(생산계획 목록 없이 작업지시 생성)
const addRow = () => {    
    //새로운 행을 위한 NO값 생성
    const newNo = workInstData.value.length > 0 ? Math.max(...workInstData.value.map(item => item.NO || 0)) + 1 : 1;

    //새로운 빈 행 데이터 객체 생성
    const newRow = {
        NO: newNo,
        work_inst_code: '',
        prod_plan_code: '',
        prod_code: '',
        prod_name: '',
        inst_qty: 0, //지시수량 사용자입력
        dead_date: '',
        inst_state: '0s1s', //초기상태
        emp_num: '',
    }
    workInstData.value.push(newRow);

}

// tabulatorCardRef 컴포넌트의 ref 선언
const tabulatorCardRef = ref(null);


// 저장 함수 cell edited된 worInstaData.value를 그대로 백엔드에 보내기
// saveWorkInstructions 함수 정의 (인자를 받음)
const saveWorkInstructions = async (workInstructionsToSave) => { // 인자 이름을 명확히 변경
    try {
        if (!workInstructionsToSave || !Array.isArray(workInstructionsToSave) || workInstructionsToSave.length === 0) {
            alert("저장할 작업지시 데이터가 유효하지 않습니다.");
            return;
        }
        
        console.log("백엔드로 보낼 데이터:", workInstructionsToSave);

        // 백엔드 API 호출
        const response = await axios.post('/api/workInstMngment/save', workInstructionsToSave); 

        if (response.data.success) {
            alert("작업지시가 성공적으로 저장되었습니다!");
            
        } else {
            alert(`작업지시 저장 실패: ${response.data.message}`);
        }

    } catch (error) {
        console.error("작업지시 저장 중 오류 발생:", error);
        alert("작업지시 저장 중 예상치 못한 오류가 발생했습니다.");
    }
};

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
                <button class="btn btn-success ms-2 " @click="saveWorkInstructions(workInstData)">저장</button>
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