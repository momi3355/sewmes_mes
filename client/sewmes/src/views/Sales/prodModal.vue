<!-- <template>
  <div v-if="isModalOpen" class="modal-overlay">

    <div class="modal-content">
      <h3 class="modal-title">제품 선택</h3>

      <div class="search-bar">
        <div>
          <label>제품명:</label>
          <input v-model="productName" placeholder="제품검색" />
        </div>
        <div>
          <label>품목:</label>
          <input v-model="productCategory" placeholder="품목검색" />
        </div>
      </div>

      <div class="table-wrapper">
        <table class="product-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>순번</th>
              <th>제품코드</th>
              <th>제품명</th>
              <th>품목</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(product, index) in product" :key="index">
              <td>
                <input type="checkbox" v-model="selected" :value="product" />
              </td>
              <td>{{ product.num }}</td>
              <td>{{ product.prodcode }}</td>
              <td>{{ product.prodname }}</td>
              <td>{{ product.category }}</td>
            </tr>
          </tbody>
        </table>
      </div>
            <div class="modal-actions">
                <button class="btn btn-primary" @click="handleSelectedPlans">선택</button>
                <button class="btn btn-secondary ms-2" @click="handleCloseModal">닫기</button>
            </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref, defineEmits, watch } from 'vue';

const selected = ref([]);
const product = ref([]);
const emit = defineEmits(["selectPlans", "closeModal"]);

const props = defineProps({
  isModalOpen: Boolean,
  modalType: String  // "product" | "semiProduct"
});

// 모달 열릴 때마다 데이터 새로 불러오기
watch(() => props.isModalOpen, async (newVal) => {
  if (newVal) {
    await loadProductList();
  }
});

const loadProductList = async () => {
  try {
    let apiUrl = '';

    // ✅ 모달 타입에 따라 API 분기
    if (props.modalType === 'product') {
      apiUrl = '/api/productList';
    } else if (props.modalType === 'semiProduct') {
      apiUrl = '/api/semiProductList';
    } else {
      console.error('❌ Unknown modalType:', props.modalType);
      return;
    }

    const res = await axios.get(apiUrl);

    // ✅ 데이터 구조 통일화 (둘 다 같은 필드로 변환)
    product.value = res.data.map((item, index) => ({
      num: index + 1,
      prodcode: item.prod_code,
      prodname: item.prod_name,
      category: item.category,
      color: item.color || '',   // 반제품에 color, size 없을 수도 있으니 빈값으로 처리
      size: item.size || '',
      standard: item.standard || ''
    }));

    selected.value = [];  // 모달 열릴 때마다 선택 초기화

    console.log('📦 모달 DB에서 받아온 데이터:', product.value);
  } catch (error) {
    console.error('❌ 모달 제품 목록 로딩 실패:', error.message);
  }
};

const handleSelectedPlans = () => {
  emit('selectPlans', selected.value);
  emit('closeModal');
  console.log('✅ 선택된 제품:', selected.value);
};

const handleCloseModal = () => {
  emit('closeModal');
};
</script>


<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-size: 20px;
  margin-bottom: 16px;
  font-weight: bold;
}

.search-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.search-bar label {
  margin-right: 8px;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.product-table th, .product-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.product-table th {
  background: #f5f5f5;
}

.modal-footer {
  text-align: center;
}

.select-btn {
  background: #4CAF50;
  color: white;
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}
.modal-actions {
    text-align: right;
}
</style> -->


<!-- 기존 코드 삭제 XXXXXXXXX -->
<template>
  <div v-if="isModalOpen" class="modal-overlay">

    <div class="modal-content">
      <h3 class="modal-title">제품 선택</h3>

      <div class="search-bar">
        <div>
          <label>제품명:</label>
          <input v-model="productName" placeholder="제품검색" />
        </div>
        <div>
          <label>품목:</label>
          <input v-model="productCategory" placeholder="품목검색" />
        </div>
      </div>

      <div class="table-wrapper">
        <table class="product-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>순번</th>
              <th>제품코드</th>
              <th>제품명</th>
              <th>품목</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(product, index) in product" :key="index">
              <td>
                <input type="checkbox" v-model="selected" :value="product" />
              </td>
              <td>{{ product.num }}</td>
              <td>{{ product.prodcode }}</td>
              <td>{{ product.prodname }}</td>
              <td>{{ product.category }}</td>
            </tr>
          </tbody>
        </table>
      </div>
            <div class="modal-actions">
                <button class="btn btn-primary" @click="handleSelectedPlans">선택</button>
                <button class="btn btn-secondary ms-2" @click="handleCloseModal">닫기</button>
            </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

const selected = ref([]);
const product = ref([]);
const emit = defineEmits(["selectPlans"])

const props = defineProps({
  isModalOpen: Boolean,
  modalType: "product" | "outProduct" 
});

// const emit = defineEmits(['closeModal', 'selected']);


const handleSelectedPlans = () => {
  emit('selectPlans', selected.value);
  emit('closeModal');
  console.log(selected);
};

const handleCloseModal = () => {
  emit('closeModal');
};

onMounted(async()=>{
try{
  const res = await axios.get('/api/productList');

  // 완제품 목록 출력
    product.value = res.data.map((product, index) => ({
      num: index +1,
      prodcode: product.prod_code,
      prodname: product.prod_name,
      category: product.category,
      color: product.color,
      size: product.size,
      standard : product.standard
    }));

    console.log('📦 모달 DB에서 받아온 데이터:', product.value);
  } catch (error) {
    console.error('❌ 모달 제품 목록 로딩 실패:', error.message);
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-size: 20px;
  margin-bottom: 16px;
  font-weight: bold;
}

.search-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.search-bar label {
  margin-right: 8px;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.product-table th, .product-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.product-table th {
  background: #f5f5f5;
}

.modal-footer {
  text-align: center;
}

.select-btn {
  background: #4CAF50;
  color: white;
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}
.modal-actions {
    text-align: right;
}
</style>
