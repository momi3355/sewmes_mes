<script setup>
import {TabulatorFull as Tabulator} from 'tabulator-tables'; 
import 'tabulator-tables/dist/css/tabulator_site.min.css';

import MiniStatisticsCard from "@/examples/Cards/MiniStatisticsCard.vue";
import { ref } from "vue";

let table = ref(new Tabulator("#example-table", {
  //table setup options
}));

</script>

<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="row">
        <div class="col-lg-3 col-md-6">
          <mini-statistics-card
              title="Sales"
              value="$103,430"
              description="<span
                class='text-sm font-weight-bolder text-success'
                >+5%</span> than last month"
            />
        </div>
        </div>
        <div class="row">
        <div class="col-lg-3 col-md-6">
        <div class="col-lg-3 col-md-6" style="background-color: #FFF; width: 150px; height: 150px; border-radius: 1rem;"></div>
        <div class="col-lg-3 col-md-6" style="background-color: #FFF; width: 150px; height: 150px; border-radius: 1rem;"></div>
        </div>
        </div>
      </div>
      
    </div>
  </div>
</template>