<script setup>
import VueApexCharts from "vue3-apexcharts";
import { ref, onMounted } from "vue";
import axios from "axios";

// 생산계획 / 작업지시
const planVsInstSeries = ref([]);
const planVsInstOptions = ref({
  chart: { type: "bar", toolbar: { show: false } },
  plotOptions: { bar: { columnWidth: "40%" } },
  xaxis: { type: "category", categories: [] },
  title: { text: "생산계획 / 작업지시" },
});

// 작업지시별 공정 완료 현황 (스택형 막대 차트)
const instProgressSeries = ref([]);
const instProgressOptions = ref({
  chart: { type: "bar", stacked: true, toolbar: { show: false } },
  plotOptions: { bar: { horizontal: false, columnWidth: "50%" } },
  xaxis: {
    categories: [],
    title: { text: "작업지시" },
  },
  yaxis: {
    title: { text: "공정 수" },
  },
  title: { text: "작업지시별 공정 진행 현황" },
  legend: { position: "bottom" }
});

// 일별 생산량 흐름
const dailyProdSeries = ref([]);
const dailyProdOptions = ref({
  chart: { type: "area", zoom: { enabled: false }, toolbar: { show: false } },
  stroke: { curve: "smooth" },
  xaxis: { type: "category", categories: [] },
  title: { text: "일별 생산량 흐름" },
});

onMounted(async () => {
  const [planRes, progressRes, prodRes] = await Promise.all([
    axios.get('/api/mainChart/production'),
    axios.get('/api/mainChart/complete'),
    axios.get('/api/mainChart/dateOutput'),
  ]);

  // 1. 생산계획 / 작업지시
  const planData = planRes.data;
  planVsInstOptions.value.xaxis.categories = planData.map(r => {
    const d = new Date(r.reg_date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });
  planVsInstSeries.value = [
    { name: "생산계획량", data: planData.map(r => r.total_plan_qty) },
    { name: "작업지시량", data: planData.map(r => r.total_inst_qty) },
    { name: "투입량", data: planData.map(r => r.total_input_qty) },
    { name: "생산량", data: planData.map(r => r.total_prod_qty) },
    { name: "불량량", data: planData.map(r => r.total_defect_qty) },
  ];

  // 2. 작업지시별 공정 진행 현황 (스택형 바차트)
  const progressData = progressRes.data;
  instProgressOptions.value.xaxis.categories = progressData.map(r => r.work_inst_code);
  instProgressSeries.value = [
    {
      name: "완료",
      data: progressData.map(r => Number(r.completed_processes) || 0),
    },
    {
      name: "미완료",
      data: progressData.map(r => {
        const total = Number(r.total_processes) || 0;
        const completed = Number(r.completed_processes) || 0;
        return total - completed;
      }),
    }
  ];

  // 3. 일별 생산량 흐름
  const prodData = prodRes.data;
  dailyProdOptions.value.xaxis.categories = prodData.map(r => {
    const d = new Date(r.work_date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });
  dailyProdSeries.value = [
    { name: "생산량", data: prodData.map(r => r.daily_prod_qty) },
  ];
});
</script>

<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-lg-12">
        <!-- 생산계획 vs 작업지시 -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <VueApexCharts
                  type="bar"
                  height="350"
                  :options="planVsInstOptions"
                  :series="planVsInstSeries"
                />
              </div>
            </div>
          </div>
        </div>

       <!-- 작업지시별 공정 완료율 & 일별 생산량 흐름 (한 줄 두 칸) -->
<div class="row mb-4">
  <div class="col-md-6">
    <div class="card">
      <div class="card-body">
        <VueApexCharts
          type="bar"
          height="350"
          :options="instProgressOptions"
          :series="instProgressSeries"
        />
      </div>
    </div>
  </div>

  <div class="col-md-6">
    <div class="card">
      <div class="card-body">
        <VueApexCharts
          type="area"
          height="350"
          :options="dailyProdOptions"
          :series="dailyProdSeries"
        />
      </div>
    </div>
  </div>
</div>

      </div>
    </div>
  </div>
</template>