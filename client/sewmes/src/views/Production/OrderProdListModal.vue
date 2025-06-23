<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import Swal from 'sweetalert2';


const props = defineProps({
    isModalOpen: Boolean
});

const orderProdList = ref([]); // 주문제품 목록
const tabulatorCardRef = ref(null); // TabulatorCard의 getTabulator 메서드에 접근하기 위한 ref

const modalTableColumns = [
    // ... 컬럼 정의 (이전 코드 유지) ...
    {
      formatter: "rowSelection", titleFormatter: "rowSelection",
      hozAlign: "center", headerSort: false, width: 40,
      cssClass: 'tabulator-checkbox-column'
    },
    { title: "주문상세코드", field: "orderDetailCode", width: 150 },
    { title: "품번", field: "prodCode", width: 150 },
    { title: "품명", field: "prodName", width: 150 },
    { title: "주문수량", field: "totalQty", width: 150 },
    { title: "납기일자", field: "deadDate", width: 150 },
    { title: "주문코드", field: "orderCode", width: 150 }
];

const fetchOrderProdList = async () => {
    const params = {};
    params.state = '0n1n';
    try {
        const result = await axios.get('/api/orderProdList', { params });

        orderProdList.value = result.data.map((item, idx) => ({
        rowNum: idx + 1,
        orderDetailCode: item.order_detail_code,
        orderCode: item.order_code,
        prodCode: item.prod_code,
        prodName: item.prod_name,
        deadDate: formatDate(item.dead_date),
        totalQty: formatInt(item.total_qty)
    }));
  } catch (err) {
    console.error("API 호출 오류:", err);
  }
};

watch(() => props.isModalOpen, (isOpen) => {
    if (isOpen) {
        console.log("모달 열림 감지: 데이터 로드 시작.");
        fetchOrderProdList();
    } else {
        // 이 부분은 현재 문제가 해결될 때까지 주석 처리하는 것을 고려해볼 수 있습니다.
        // productionPlans.value = [];
        console.log("모달 닫힘 감지: productionPlans 초기화.");
    }
}, { immediate: true });

const emit = defineEmits(['closeModal', 'selectOrder']);

const handleSelectedOrder = (plans) => {
    if (tabulatorCardRef.value && tabulatorCardRef.value.getTabulator()) {
        const selectedData = tabulatorCardRef.value.getTabulator().getSelectedData();
        if (selectedData.length > 0) {
            console.log("선택된 주문목록:", selectedData);
            emit('selectOrder', selectedData);
            emit('closeModal');
        } else {
            Swal.fire({ title: "미선택", text: "주문 목록을 선택해주세요", icon: "error" });
        }
    }
};

const handleCloseModal = () => {
    emit('closeModal');
};
// 형태 변환
const formatDate = (str) => {
  if (!str) return '';
  return new Date(str).toISOString().slice(0, 10);
};
const formatInt = (val) => {
  return parseInt(val, 10);
};
const tabulatorEvent = [
  {
    eventName: "rowClick",
    eventAction: 
      async (e, row) => {
        row.toggleSelect()

      const tableInstance = tabulatorCardRef.value?.$el?.querySelector('.tabulator')?.__tabulator__;
      if (tableInstance) {
        tableInstance.redraw(true);
      }
    }
  }
];
</script>

<template>
    <div class="modal-overlay" v-if="props.isModalOpen">
        <div class="modal-content">
            <TabulatorCard
                ref="tabulatorCardRef"
                cardTitle="주문제품 목록"
                :tableData="orderProdList"
                :tableColumns="modalTableColumns"
                :on="tabulatorEvent"
                :tabulatorOptions="{
                    pagination: false,
                    selectable: true,
                }" >
            </TabulatorCard>

            <div class="modal-actions">
                <button class="btn btn-primary" @click="handleSelectedOrder">선택</button>
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
    max-width: 1000px; /* 최대 너비 설정 */
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