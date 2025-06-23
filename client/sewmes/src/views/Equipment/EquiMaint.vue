<script setup>
import { reactive, ref, computed } from 'vue';
import moment from 'moment';

const emit = defineEmits(['save', 'close']);

const props = defineProps({
  type: { type: String, required: true }, // '0t1t' 점검, '0t3t' 수리
  equiCode: { type: String, required: true },
  equiName: { type: String, required: true },
  empNum: { type: String, required: true },
  installDate: String,
  faultDate: String,
  faultReason: String,
  lastCheck: String,
  nextCheck: String,
});

const form = reactive({
  reason: '',
  result: '',
  duration: '',
  memo: '',
  start_date: '',
  end_date: '',
});

const installDateStr = computed(() => props.installDate ? moment(props.installDate).format('YYYY-MM-DD') : '-');
const faultDateStr = computed(() => props.faultDate ? moment(props.faultDate).format('YYYY-MM-DD HH:mm') : '-');
const lastCheckStr = computed(() => props.lastCheck ? moment(props.lastCheck).format('YYYY-MM-DD HH:mm') : '-');
const nextCheckStr = computed(() => props.nextCheck ? moment(props.nextCheck).format('YYYY-MM-DD HH:mm') : '-');
const endDateStr = computed(() => form.end_date ? moment(form.end_date).format('YYYY-MM-DD HH:mm') : '-');

const onStartClick = () => {
  const now = moment().format('YYYY-MM-DDTHH:mm');
  form.start_date = now;
};

const onEndClick = () => {
  if (!form.start_date) {
    alert('시작일시가 먼저 입력되어야 합니다.');
    return;
  }
  form.end_date = moment().format('YYYY-MM-DDTHH:mm');
};

const onSaveClick = async () => {
  if (!form.start_date) {
    alert('작업 시작일시를 입력해주세요.');
    return;
  }
  if (!form.result) {
    alert('결과를 선택해주세요.');
    return;
  }

  const payload = {
    equi_code: props.equiCode,
    maint_detail: props.type,
    maint_reason: form.reason,
    start_date: form.start_date,
    end_date: form.end_date || form.start_date,
    maint_duration: form.duration || null,
    maint_result: form.result,
    maint_note: form.memo,
    emp_num: props.empNum,
  };

  // try {
    // await axios.post('/api/equipment/maint/save', payload);
    alert('저장되었습니다.');
    emit('close');
  // } catch (err) {
    // console.error(err);
    // alert('저장에 실패했습니다.');
  // }
};
</script>

<template>
  <div class="modal fade show d-block" tabindex="-1" aria-modal="true" role="dialog" style="background-color: rgba(0,0,0,0.3);">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        <div class="modal-header d-flex justify-content-between align-items-center">
          <h5 class="modal-title fw-bold">{{ props.type === '0t3t' ? '설비 수리' : '설비 점검' }}</h5>
          <button type="button" class="btn-close" @click="emit('close')" aria-label="Close">×</button>
          <div class="text-end mt-3">
            <button type="button" class="btn btn-primary me-1" @click="onStartClick">시작</button>
            <button type="button" class="btn btn-danger me-1" @click="onEndClick">종료</button>
            <button type="button" class="btn btn-success" @click="onSaveClick">저장</button>
          </div>
        </div>

        <div class="modal-body">
          
          <table class="table table-bordered table-sm align-middle">
            <tbody>
              <tr>
                <th>설비명</th>
                <td>{{ props.equiName }}</td>
                <th>설비코드</th>
                <td>{{ props.equiCode }}</td>
              </tr>
              <tr>
                <th>설비 설치일</th>
                <td>{{ installDateStr }}</td>
                <th v-if="props.type === '0t3t'">고장일시</th>
                <td v-if="props.type === '0t3t'">{{ faultDateStr }}</td>
                <th v-if="props.type === '0t1t'">마지막 점검일</th>
                <td v-if="props.type === '0t1t'">{{ lastCheckStr }}</td>
              </tr>
              <tr>
                <th>상태</th>
                <td>
                  <div class="form-check form-check-inline" v-for="opt in (props.type === '0t3t' ? ['가능', '고장'] : ['적합', '부적합'])" :key="opt">
                    <input class="form-check-input" type="radio" :id="opt" :value="opt" v-model="form.result" />
                    <label class="form-check-label" :for="opt">{{ opt }}</label>
                  </div>
                </td>
                <th>작업자</th>
                <td>{{ props.empNum }}</td>
              </tr>
              <tr>
                <th>{{ props.type === '0t3t' ? '수리내용(사유)' : '점검내용(사유)' }}</th>
                <td colspan="3">
                  <textarea class="form-control form-control-sm" rows="2" v-model="form.reason" />
                </td>
              </tr>
              <tr>
                <th>{{ props.type === '0t3t' ? '수리결과' : '점검결과' }}</th>
                <td>{{ form.result || '-' }}</td>
                <th>{{ props.type === '0t3t' ? '수리자' : '점검자' }}</th>
                <td>{{ props.empNum }}</td>
              </tr>
              <tr>
                <th>소요시간 (분)</th>
                <td>
                  <input type="number" min="0" class="form-control form-control-sm d-inline-block" style="width: 100px;" v-model="form.duration" />
                </td>
                <th v-if="props.type === '0t3t'">수리일시</th>
                <td v-if="props.type === '0t3t'">{{ form.end_date ? moment(form.end_date).format('YYYY-MM-DD HH:mm') : '-' }}</td>
                <th v-if="props.type === '0t1t'"></th>
                <td v-if="props.type === '0t1t'"></td>
              </tr>
              <tr>
                <th>비고</th>
                <td colspan="3">
                  <textarea class="form-control form-control-sm" rows="2" v-model="form.memo" />
                </td>
              </tr>
            </tbody>
          </table>

          
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}
</style>
