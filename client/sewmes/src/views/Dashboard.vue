<script setup>
import VueApexCharts from "vue3-apexcharts";
import { ref, onMounted } from "vue";
import axios from "axios";

const planVsInstSeries = ref([]);
const planVsInstOptions = ref({
  chart: { type: "bar" },
  plotOptions: { bar: { columnWidth: "40%" } },
  xaxis: { categories: [] },
  title: { text: "생산계획 vs 작업지시" },
});

const instProgressSeries = ref([]);
const instProgressOptions = ref({
  chart: { type: "bar" },
  plotOptions: { bar: { horizontal: true, barHeight: "50%" } },
  xaxis: { categories: [], max: 100, title: { text: "완료율 (%)" } },
  title: { text: "작업지시별 공정 완료율" },
});

const dailyProdSeries = ref([]);
const dailyProdOptions = ref({
  chart: { type: "area", zoom: { enabled: false } },
  stroke: { curve: "smooth" },
  xaxis: { categories: [] },
  title: { text: "일별 생산량 흐름" },
});

onMounted(async () => {
  const [planRes, progressRes, prodRes] = await Promise.all([
  axios.get('/api/mainChart/production'),
  axios.get('/api/mainChart/complete'),
  axios.get('/api/mainChart/dateOutput'),
  ]);

  // 1. 생산계획 vs 작업지시
  const planData = planRes.data;
  planVsInstOptions.value.xaxis.categories = planData.map((r) => r.reg_date);
  planVsInstSeries.value = [
    { name: "계획 수량", data: planData.map((r) => r.plan_qty) },
    { name: "작업지시 수량", data: planData.map((r) => r.process_qty) },
  ];

  // 2. 작업지시별 공정 완료율
  const progressData = progressRes.data;
  instProgressOptions.value.xaxis.categories = progressData.map((r) => r.work_inst_code);
  instProgressSeries.value = [
    {
      name: "완료율",
      data: progressData.map((r) =>
        r.total_processes === 0 ? 0 : Math.round((r.completed_processes / r.total_processes) * 100)
      ),
    },
  ];

  // 3. 일별 생산량 흐름
  const prodData = prodRes.data;
  dailyProdOptions.value.xaxis.categories = prodData.map((r) => r.work_date);
  dailyProdSeries.value = [
    {
      name: "생산량",
      data: prodData.map((r) => r.daily_prod_qty),
    },
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
                <VueApexCharts type="bar" height="350" :options="planVsInstOptions" :series="planVsInstSeries" />
              </div>
            </div>
          </div>
        </div>

        <!-- 작업지시별 공정 완료율 -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <VueApexCharts type="bar" height="350" :options="instProgressOptions" :series="instProgressSeries" />
              </div>
            </div>
          </div>
        </div>

        <!-- 일별 생산량 흐름 -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <VueApexCharts type="area" height="350" :options="dailyProdOptions" :series="dailyProdSeries" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>