<script setup>
import { ref, watch, nextTick } from 'vue';
import axios from 'axios';
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";

const props = defineProps({
    isModalOpen: Boolean
});

const productionPlans = ref([]); // 생산계획 데이터
const tabulatorCardRef = ref(null); // TabulatorCard의 getTabulator 메서드에 접근하기 위한 ref

const modalTableColumns = [
    // ... 컬럼 정의 (이전 코드 유지) ...
    { formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center", headerSort: false, width: 40, cssClass: 'tabulator-checkbox-column' },
    { title: "생산계획코드", field: "prod_plan_code", width: 150 },
    { title: "제품코드", field: "prod_code", width: 150 },
    { title: "생산계획수량", field: "prod_qty", width: 150 },
    { title: "생산계획등록일자", field: "reg_date", width: 150 },
    { title: "납기일자", field: "dead_date", width: 150 }
];

const fetchProductionPlans = async () => {
    console.log("fetchProductionPlans 함수 시작...");
    try {
        const response = await axios.get('/api/production-plans', {
            params: { complete: 'N' }
        });

        console.log("1. API 응답 전체 (response):", response);
        console.log("2. API 응답 데이터 (response.data):", response.data);
        console.log("3. API 응답 데이터의 data 속성 (response.data.data):", response.data.data);

        if (response.data.success) {
            let receivedData = [];
           
            if (response.data.data) { // response.data.data가 존재하는 경우에만 처리
                if (Array.isArray(response.data.data)) {
                    // 이미 배열인 경우 그대로 사용
                    receivedData = response.data.data;
                } else if (typeof response.data.data === 'object' && response.data.data !== null) {
                    // 단일 객체인 경우, 해당 객체를 요소로 하는 배열로 변환
                    receivedData = [response.data.data];
                }
                // 그 외의 경우 (null, undefined, 문자열 등) receivedData는 빈 배열로 유지
            }

            console.log("3-1. receivedData (할당 직전):", JSON.parse(JSON.stringify(receivedData)));

            productionPlans.value = receivedData; // 생산계획 데이터 업데이트

            console.log("4. productionPlans.value에 최종 할당된 값 (fetch 함수 내부, 실제 데이터):", JSON.parse(JSON.stringify(productionPlans.value)));

            nextTick(() => {
                console.log(">>> nextTick 콜백 실행 중.");
                console.log(">>> nextTick: tabulatorCardRef.value:", tabulatorCardRef.value);
                if (tabulatorCardRef.value && tabulatorCardRef.value.getTabulator()) {
                    console.log(">>> nextTick: TabulatorCard 인스턴스 확인. 데이터 설정 시도.");
                    tabulatorCardRef.value.getTabulator().setData(productionPlans.value)
                        .then(() => {
                            console.log(">>> nextTick: TabulatorCard에 데이터 설정 성공!");
                        })
                        .catch(error => {
                            console.error(">>> nextTick: TabulatorCard setData 오류:", error);
                        });
                } else {
                    console.warn("TabulatorCard 인스턴스가 아직 준비되지 않아 nextTick에서 setData를 호출할 수 없습니다.");
                }
            });

        } else {
            console.error("생산계획 데이터 로드 실패:", response.data.message);
            alert(`생산계획 데이터 로드 실패: ${response.data.message}`);
        }
    } catch (error) {
        console.error("생산계획 데이터 로드 중 오류 발생:", error);
    } finally {
        console.log("fetchProductionPlans 함수 종료.");
    }
};

watch(() => props.isModalOpen, (isOpen) => {
    if (isOpen) {
        console.log("모달 열림 감지: 데이터 로드 시작.");
        fetchProductionPlans();
    } else {
        // 이 부분은 현재 문제가 해결될 때까지 주석 처리하는 것을 고려해볼 수 있습니다.
        // productionPlans.value = [];
        console.log("모달 닫힘 감지: productionPlans 초기화.");
    }
}, { immediate: true });

const emit = defineEmits(['closeModal', 'selectPlans']);

const handleSelectedPlans = (plans) => {
    if (tabulatorCardRef.value && tabulatorCardRef.value.getTabulator()) {
        const selectedData = tabulatorCardRef.value.getTabulator().getSelectedData();
        if (selectedData.length > 0) {
            console.log("선택된 생산계획:", selectedData);
            emit('selectPlans', selectedData);
            emit('closeModal');
        } else {
            alert("생산계획을 선택해주세요.");
        }
    }
};

const handleCloseModal = () => {
    emit('closeModal');
};
</script>

<template>
    <div class="modal-overlay" v-if="props.isModalOpen">
        <div class="modal-content">
            <h2>생산계획서 목록</h2>
            <TabulatorCard
                ref="tabulatorCardRef"  cardTitle="생산계획 목록"
                :tableData="productionPlans"        :tableColumns="modalTableColumns" :tabulatorOptions="{ pagination: false, selectable: true }" >
                <template #actions>
                    </template>
            </TabulatorCard>

            <div class="modal-actions">
                <button class="btn btn-primary" @click="handleSelectedPlans">선택</button>
                <button class="btn btn-secondary ms-2" @click="handleCloseModal">닫기</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 기존 스타일 유지 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 80%; /* 모달 너비 조절 */
    max-width: 900px; /* 최대 너비 설정 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
}

.modal-grid {
    flex-grow: 1; /* 그리드가 사용 가능한 공간을 채우도록 함 */
    margin-bottom: 20px; /* 버튼과의 간격 */
    /* Tabulator 높이를 CSS로 제어하려면 height: 300px; 등을 여기에 넣을 수도 있음 */
}

.modal-actions {
    text-align: right;
}
</style>