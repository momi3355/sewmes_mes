<script setup>
import axios from 'axios';
import Swal from 'sweetalert2';
import { defineProps, defineEmits, ref, computed, onMounted, watch } from 'vue';

const materialQualityTest = ref([]);

const props = defineProps({
  isOpen: Boolean,
  checkData: Object,
  userInfo: Object,
});

const emit = defineEmits(['close', 'save', 'refresh']);

// 총 불합격 수량 계산
const defectTotal = computed(() => {
  return (materialQualityTest.value).reduce((sum, val) => sum + Number(val.defect_qty), 0);
});

// 합격 수량 계산
const passQty = computed(() =>{
  const calculatedQty = props.checkData.order_qty - defectTotal.value;
  return calculatedQty < 0 ? 0 : calculatedQty;
});

const fetchTestItems = async () => {
  try {
    const result = await axios.get('/api/matquality');
    const baseItems = result.data.map(item => ({
      qualityCode: item.quality_code,
      testName: item.test_name,
      testMethod: item.test_method,
      defect_qty: 0
    }));
    materialQualityTest.value = baseItems;
    //console.log(materialQualityTest.value);
  } catch (err) {
    console.error('검사 항목 조회 실패:', err);
  }
};

onMounted(() => {
  if (props.isOpen) fetchTestItems();
});
watch(() => props.isOpen, (opened) => {
  if (opened) fetchTestItems();
});
const close = () => emit('close');

const save = async () => {
  //console.log('checkData', props.checkData);
  //console.log('userInfo', props.userInfo);
  //console.log('qualiityData', materialQualityTest.value);

  const hasNegative = materialQualityTest.value.some(e => e.defect_qty < 0);
  if (hasNegative){
    Swal.fire({
      title: "입력 오류",
      text: "불합격 수량은 음수를 입력할 수 없습니다.",
      icon: "error"
    });
    return;
  }
  if (defectTotal.value > props.checkData.order_qty){
    Swal.fire({
      title: "수량 오류",
      text: "불합격 수량은 검사수량을 초과할 수 없습니다.",
      icon: "error"
    });
    return;
  }


  const inboundData = {
    inboundCheckCode: props.checkData.inbound_check_code,
    userCode: props.userInfo.emp_num,
    materialCode: props.checkData.material_code,
    qualityData: materialQualityTest.value.map(e => ({
        quality_code: e.qualityCode,
        defect_qty: e.defect_qty,
    })),
    passQty: passQty.value,
  };
  
  try{
    const result = await axios.post('/api/material/complete-check', inboundData);

    if (result?.status === 200) {
     await Swal.fire({
       title: "성공",
       text: "자재가 입고처리 되었습니다.",
       icon: "success"
      });

     emit('save')
     emit('close')
     emit('refresh')
    }
  } catch (err) {
    // console.error('저장 실패: ', err);
    //   Swal.fire({
    //   title: "오류",
    //   text: "저장에 실패했습니다.",
    //   icon: "error"
    }
  }


// async function onComplete(){
//   try{
//     await save()
//     emit('close')
//     emit('refresh')
//   } catch (error) {
//     console.error('저장 실패: ', error)
//     alert('저장에 실패했습니다.')
//   }
// };

</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <h4>품질 검사</h4>
      <p><strong>자재명:</strong> {{ props.checkData.material_name }}</p>
      <p><strong>검수수량:</strong> {{ props.checkData.order_qty }}</p>

      <table class="table table-bordered mt-3">
        <thead>
          <tr>
            <th style="width: 25%;">항목</th>
            <th style="width: 55%;">검사방법</th>
            <th style="width: 20%;">불합격개수</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(test, idx) in materialQualityTest" :key="test.qualityCode">
            <td>{{ test.testName }}</td>
            <td>{{ test.testMethod }}</td>
            <td>
              <input
                type="number"
                class="form-control"
                v-model.number="test.defect_qty"
                min="0"
                style="width: 80px;"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div class="mt-3">
        <p><strong>합격수량:</strong> {{ passQty }}</p>
        <p><strong>불합격수량:</strong> {{ defectTotal }}</p>
        <p><strong>검수자:</strong> {{ userInfo.emp_name }}</p>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-3">
        <button class="btn btn-primary" @click="save">검사완료</button>
        <button class="btn btn-secondary" @click="close">취소</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 30px;
  width: 700px;
  border-radius: 10px;
}
</style>