<template>
  <q-page class="flex flex-center">
    <div class="q-pa-lg total-chart">
      <!-- Total Bookings Summary -->
      <div class="bookings-summary-container q-gutter-md">
        <!-- Total Completed Bookings -->
        <q-card class="booking-card total-bookings">
          <div class="q-mb-md text-h6">Total Bookings</div>
          <div class="text-h4 text-primary">{{ totalBookings }}</div>
        </q-card>

        <!-- Weekly Bookings -->
        <q-card class="booking-card weekly-bookings">
          <div class="q-mb-md text-h6">This Week</div>
          <div class="text-h4 text-accent">{{ weeklyBookings }}</div>
        </q-card>

        <!-- Monthly Bookings -->
        <q-card class="booking-card monthly-bookings">
          <div class="q-mb-md text-h6">This Month</div>
          <div class="text-h4 text-secondary">{{ monthlyBookings }}</div>
        </q-card>
      </div>

      <!-- Filter Button -->
      <q-btn
        @click="openFilterModal"
        label="Filter"
        color="primary"
        class="filter-btn"
      />

      <!-- Filter Modal -->
      <q-dialog v-model="filterModal" persistent>
        <q-card class="filter-modal">
          <q-card-section>
            <q-select
              filled
              v-model="selectedPeriod"
              :options="periodOptions"
              label="Select Time Period"
              @change="fetchData"
            />
            <q-select
              filled
              v-model="selectedYear"
              :options="yearOptions"
              label="Select Year"
              @change="fetchData"
            />
          </q-card-section>

          <q-card-actions>
            <q-btn
              label="Close"
              color="secondary"
              @click="filterModal = false"
            />
            <q-btn label="Update" color="primary" @click="fetchData" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Chart Container -->
      <div class="chart-container q-card q-pa-md">
        <apexchart
          v-if="
            chartData.datasets[0].data.length > 0 ||
            chartData.datasets[1].data.length > 0
          "
          type="bar"
          :options="chartOptions"
          :series="chartData.datasets"
        />
        <p v-else>No data available for the selected period.</p>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from "vue";
import ReportAPI from "src/apis/finance/report";
import VueApexCharts from "vue3-apexcharts";

export default {
  components: {
    apexchart: VueApexCharts,
  },
  setup() {
    const periodOptions = [
      { label: "Weekly", value: "week" },
      { label: "Monthly", value: "month" },
      { label: "Yearly", value: "year" },
    ];

    const selectedPeriod = ref(periodOptions[1]);
    const selectedYear = ref(new Date().getFullYear());
    const filterModal = ref(false);
    const totalBookings = ref(0);
    const weeklyBookings = ref(0);
    const monthlyBookings = ref(0);

    const chartData = ref({
      labels: [],
      datasets: [
        {
          name: "Earnings",
          data: [],
        },
        {
          name: "Expenses",
          data: [],
        },
      ],
    });

    const chartOptions = ref({
      chart: { type: "bar" },
      title: { text: "Earnings vs Expenses" },
      xaxis: { categories: [] },
      yaxis: {
        tickAmount: 5,
        min: 0,
        labels: {
          formatter: (value) => value.toFixed(2),
        },
      },
      plotOptions: { bar: { horizontal: false } },
      dataLabels: { enabled: true },
    });

    const yearOptions = Array.from({ length: 10 }, (_, i) => ({
      label: `${new Date().getFullYear() - i}`,
      value: new Date().getFullYear() - i,
    }));

    const fetchCompletedBookings = async () => {
      try {
        const response = await ReportAPI.getCompletedBookings();
        totalBookings.value = response.total_completed_bookings || 0;
        weeklyBookings.value = response.weekly_completed_bookings || 0;
        monthlyBookings.value = response.monthly_completed_bookings || 0;
      } catch (error) {
        console.error("Error fetching booking data:", error);
      }
    };

    const fetchData = async () => {
      try {
        const filterParams = {
          period: selectedPeriod.value,
          year: selectedYear.value,
        };

        const response = await ReportAPI.getFinancialReport(filterParams);

        if (selectedPeriod.value.value === "month") {
          const incomeData = response.monthly_income || {};
          const expenseData = response.monthly_expenses || {};

          chartData.value.labels = Object.keys(incomeData);
          chartData.value.datasets[0].data = Object.values(incomeData);
          chartData.value.datasets[1].data = Object.values(expenseData);
        } else if (selectedPeriod.value.value === "year") {
          const incomeData = response.yearly_income || {};
          const expenseData = response.yearly_expenses || {};

          chartData.value.labels = Object.keys(incomeData);
          chartData.value.datasets[0].data = Object.values(incomeData);
          chartData.value.datasets[1].data = Object.values(expenseData);
        } else if (selectedPeriod.value.value === "week") {
          const incomeData = response.weekly_income || {};
          const expenseData = response.weekly_expenses || {};

          chartData.value.labels = Object.keys(incomeData);
          chartData.value.datasets[0].data = Object.values(incomeData);
          chartData.value.datasets[1].data = Object.values(expenseData);
        }

        chartOptions.value.xaxis.categories = chartData.value.labels;
        chartOptions.value = { ...chartOptions.value };
      } catch (error) {
        console.error("Error fetching finance report:", error);
      }
    };

    const openFilterModal = () => {
      filterModal.value = true;
    };

    onMounted(() => {
      fetchData();
      fetchCompletedBookings();
    });

    return {
      selectedPeriod,
      selectedYear,
      filterModal,
      chartData,
      chartOptions,
      periodOptions,
      yearOptions,
      totalBookings,
      weeklyBookings,
      monthlyBookings,
      fetchData,
      openFilterModal,
      fetchCompletedBookings,
    };
  },
};
</script>

<style scoped>
.total-chart {
  width: 70%;
}

.filter-modal {
  width: 500px;
}

.filter-btn {
  position: absolute;
  top: 10px;
  left: 10px;
}

.bookings-summary-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.booking-card {
  width: 30%;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background-color: #fff;
}

.total-bookings .text-primary {
  color: #007bff;
}

.weekly-bookings .text-accent {
  color: #ff9800;
}

.monthly-bookings .text-secondary {
  color: #4caf50;
}

.chart-container {
  width: 100%;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>
