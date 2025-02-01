<template>
  <q-page style="width: 90%; margin: 3% auto">
    <q-toolbar>
      <q-toolbar-title>Payments</q-toolbar-title>
      <q-btn
        @click="showAddPaymentDialog"
        label="Add Payment"
        color="primary"
      />
    </q-toolbar>
    <q-table
      :rows="filteredPayments"
      :columns="columns"
      row-key="id"
      :rows-per-page-options="[5, 10, 20]"
    >
      <template v-slot:body-cell-actions="props">
        <q-td class="action-column">
          <q-btn
            color="secondary"
            round
            dense
            class="action-btn"
            icon="edit"
            @click="editPayment(props.row)"
          />
          <q-btn
            dense
            round
            icon="delete"
            color="negative"
            class="action-btn"
            @click="deletePayment(props.row.id)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Add/Edit Payment Dialog -->
    <q-dialog v-model="paymentDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Payment</div>
        </q-card-section>
        <q-card-section>
          <q-select
            v-model="paymentForm.user"
            :options="userOptions"
            label="User"
            dense
            option-label="name"
            option-value="id"
          />
          <q-select
            v-model="paymentForm.payment_method"
            :options="paymentMethods"
            label="Payment Method"
            dense
          />
          <q-input
            v-model="paymentForm.total_payment"
            label="Total Payment"
            type="number"
            dense
          />
          <q-select
            v-model="paymentForm.status"
            :options="statusOptions"
            label="Status"
            dense
          />
          <q-input
            v-model="paymentForm.remarks"
            label="Remarks"
            type="textarea"
            dense
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="negative"
            @click="cancelPaymentDialog"
          />
          <q-btn flat label="Save" color="positive" @click="savePayment" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useQuasar } from "quasar";
import PaymentAPI from "../apis/services/payment.js";

const $q = useQuasar();
const payments = ref([]);
const paymentDialog = ref(false);
const isEditing = ref(false);
const selectedPaymentId = ref(null);

const paymentForm = ref({
  user: null,
  payment_method: null,
  total_payment: 0,
  status: "pending",
  remarks: "",
});

const paymentMethods = [
  { label: "G-Cash", value: "gcash" },
  { label: "Cash", value: "cash" },
  { label: "Bank Transfer", value: "bank_transfer" },
];
const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
];

const columns = [
  { name: "id", label: "ID", field: "id", align: "left", sortable: true },
  {
    name: "user",
    label: "User",
    align: "left",
    field: (row) => `${row.user.first_name} ${row.user.last_name}`,
    format: (val, row) => `${row.user.first_name} ${row.user.last_name}`,
    sortable: true,
  },
  {
    name: "payment_method",
    label: "Method",
    field: "payment_method",
    align: "left",
  },
  {
    name: "total_payment",
    label: "Amount",
    field: "total_payment",
    align: "center",
    format: (val) => `$${val}`,
  },
  {
    name: "staff",
    label: "Staff",
    align: "left",
    field: (row) => `${row.staff.first_name} ${row.staff.last_name}`,
    format: (val, row) => `${row.staff.first_name} ${row.staff.last_name}`,
    sortable: true,
  },
  {
    name: "status",
    label: "Status",
    field: "status",
    align: "center",
    align: "center",
  },
  { name: "remarks", label: "Remarks", field: "remarks", align: "left" },
  { name: "actions", label: "Actions", field: "actions", align: "center" },
];

const filteredPayments = computed(() => payments.value || []);
console.log("Filtered Payments:", filteredPayments.value);

const fetchPayments = async () => {
  console.log("Fetching payments...");
  try {
    const response = await PaymentAPI.getPayments();
    payments.value = response || [];
    console.log("Fetched payments:", payments.value);
  } catch (error) {
    console.error("Error fetching payments:", error);
    payments.value = [];
  }
};

// Show Add Payment Dialog
const showAddPaymentDialog = () => {
  paymentDialog.value = true;
  isEditing.value = false;
  paymentForm.value = {
    user: null,
    payment_method: null,
    total_payment: 0,
    status: "pending",
    remarks: "",
  };
};

// Save Payment
const savePayment = async () => {
  try {
    const paymentData = { ...paymentForm.value };
    if (isEditing.value && selectedPaymentId.value) {
      await PaymentAPI.updatePayment(selectedPaymentId.value, paymentData);
      $q.notify({ type: "positive", message: "Payment updated successfully!" });
    } else {
      await PaymentAPI.createPayment(paymentData);
      $q.notify({ type: "positive", message: "Payment added successfully!" });
    }
    fetchPayments();
    paymentDialog.value = false;
  } catch (error) {
    console.error("Error saving payment:", error);
    $q.notify({ type: "negative", message: "Failed to save payment." });
  }
};

// Edit Payment
const editPayment = (payment) => {
  isEditing.value = true;
  selectedPaymentId.value = payment.id;
  paymentForm.value = { ...payment };
  paymentDialog.value = true;
};

// Delete Payment
const deletePayment = async (paymentId) => {
  const confirm = await $q.dialog({
    title: "Delete Payment",
    message: "Are you sure you want to delete this payment?",
    ok: { label: "Yes", color: "negative" },
    cancel: { label: "No" },
  });

  if (confirm) {
    try {
      await PaymentAPI.deletePayment(paymentId);
      fetchPayments();
      $q.notify({ type: "positive", message: "Payment deleted successfully!" });
    } catch (error) {
      console.error("Error deleting payment:", error);
      $q.notify({ type: "negative", message: "Failed to delete payment." });
    }
  }
};
onMounted(() => {
  fetchPayments();
});
</script>

<style scoped>
.action-btn {
  margin: 0 4px;
}
.action-column {
  display: flex;
  justify-content: center;
  align-items: center;
}
.customer-search-dialog {
  min-width: 500px;
}
</style>
