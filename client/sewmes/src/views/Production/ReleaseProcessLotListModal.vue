<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';

import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import { dateFormatter } from '../../assets/js/utils/tableFormatter';

const props = defineProps({
  isModalOpen: Boolean,
  prodCode: String,
});
const emit = defineEmits(['closeModal']);

const table = ref(null);

const releaseLotData = ref([]);
const releaseLotColumns = [
  { formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center", headerSort: false, width: 40, cssClass: 'tabulator-checkbox-column' },
  { title: "LOT", field: "lot" },
  { title: "재고수량", field: "stock_qty", width: 150 },
  { title: "단위", field: "unit", width: 150 },
  { title: "입고수량", field: "inbound_qty", width: 150 },
  { 
    title: "입고날짜",
    field: "inbound_date",
    width: 230,
    formatter: dateFormatter,
    formatterParams: {
      dateformat: "YYYY-MM-DD",
    },
  },
];

const fetchReleaseLotList = async () => {
  const lots = await axios.get("/api/prdReceive/lot", {
    params: {
      code: props.prodCode,
    }
  });
  releaseLotData.value = lots.data;
}

watch(() => props.isModalOpen, (isOpen) => {
  if (isOpen) {
    fetchReleaseLotList();
  }
}, { immediate: true });

const handleCloseModal = () => {
  emit('closeModal');
};

const selectedSave = () => {
  const tabulator = table.value.getTabulator();
  const selectedData = tabulator.getSelectedData();

  if (!selectedData.length) {
    alert("선택한 행이 없습니다.");
    return;
  }

  emit('saved', selectedData); //전달
  handleCloseModal(); //닫기
};
</script>

<template>
  <div class="modal-overlay" v-if="props.isModalOpen">
    <div class="modal-content">
      <TabulatorCard
          ref="table"
          :tableData="releaseLotData"
          cardTitle="출고 LOT 리스트"
          :tableColumns="releaseLotColumns"
          :tabulatorOptions="{ selectable: true }" >
      </TabulatorCard>

      <div class="modal-actions">
        <button class="btn btn-primary" @click="selectedSave">선택</button>
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
  max-width: 1350px; /* 최대 너비 설정 */
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
