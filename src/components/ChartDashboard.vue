<template>
  <div>
    <line-chart :chart-data="data" />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
);

export default defineComponent({
  name: "ChartjsLineChart",
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  components: {
    LineChart: Line,
  },
});
</script>

<style scoped>
/* Add styles for the chart if necessary */
</style>
