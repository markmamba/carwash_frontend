<template>
  <q-page>
    <div style="width: 95%; margin: 3% auto">
      <q-toolbar>
        <q-toolbar-title>Booking Management</q-toolbar-title>
        <q-btn
          @click="filterToday"
          label="Today"
          color="accent"
          class="q-mx-sm"
        />
        <q-btn
          @click="showAddBookingDialog"
          label="Add Booking"
          color="primary"
          class="q-mx-sm"
        />
        <q-btn
          @click="showFilterDialog"
          label="Filter"
          color="secondary"
          class="q-mx-sm"
        />
      </q-toolbar>

      <!-- Booking Table -->
      <q-table
        :rows="filteredBookings"
        :columns="columns"
        row-key="id"
        :rows-per-page-options="[5, 10, 20]"
        title="Bookings"
      >
        <template v-slot:body-cell-actions="props">
          <q-td align="center">
            <div style="display: flex; gap: 8px">
              <q-btn
                color="secondary"
                icon="edit"
                @click="editBooking(props.row)"
                round
                dense
                class="action-btn"
              />
              <q-btn
                v-if="props.row.payment.status == 'pending'"
                color="positive"
                icon="payment"
                @click="showPaymentDialog(props.row)"
                round
                dense
                class="action-btn"
              />
              <q-btn
                v-if="
                  props.row.status !== 'completed' ||
                  props.row.status == 'cancelled'
                "
                color="negative"
                icon="delete"
                @click="deleteBooking(props.row.id)"
                round
                dense
                class="action-btn"
              />
              <q-btn
                v-if="props.row.status !== 'completed'"
                color="info"
                icon="update"
                @click="updateBookingStatus(props.row)"
                round
                dense
                class="action-btn"
              />
            </div>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Filter Dialog -->
    <q-dialog v-model="filterDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Filter Bookings</div>
        </q-card-section>
        <q-card-section>
          <div class="date-filter">
            <q-input v-model="startDate" type="date" label="Start Date" />
            <q-input v-model="endDate" type="date" label="End Date" />
            <q-input
              v-model="customerSearch"
              label="Search Customers & Staff"
              @input="debouncedFetchCustomerList"
            />
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn @click="applyFilters" label="Apply Filters" color="primary" />
          <q-btn @click="resetFilters" label="Reset" color="negative" />
          <q-btn @click="filterDialog = false" label="Close" flat />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add/Edit Booking Dialog -->
    <q-dialog v-model="addBookingDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? "Edit Booking" : "Add Booking" }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-form
            @submit.prevent="isEditing ? updateBooking() : createBooking()"
          >
            <!-- Customer Search Button -->
            <q-btn @click="showCustomerSearchDialog" label="Search Customers" />
            <q-input
              v-model="selectedCustomerName"
              label="Selected Customer"
              readonly
            />

            <q-select
              v-model="newBooking.staff"
              label="Staff"
              :options="staffOptions"
              option-label="name"
              option-value="id"
            />
            <q-select
              v-model="newBooking.service_type"
              label="Service Type"
              :options="serviceTypes"
              option-label="name"
              option-value="id"
            />
            <q-input
              v-model="newBooking.total_payment"
              label="Total Payment"
              type="number"
            />
            <q-select
              v-model="newBooking.status"
              label="Status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              :disable="isEditing && newBooking.status === 'confirmed'"
            />
            <q-input
              v-model="newBooking.remarks"
              label="Remarks"
              type="textarea"
              class="q-mb-md"
            />
            <div class="row justify-end q-gutter-sm">
              <q-btn type="submit" label="Save" color="primary" />
              <q-btn
                @click="cancelAddBooking"
                label="Cancel"
                flat
                color="negative"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Customer Search Dialog -->
    <q-dialog v-model="customerSearchDialog">
      <q-card class="customer-search-dialog">
        <q-card-section>
          <div class="text-h6">Search Customers</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="customerSearch"
            label="Search"
            @input="debouncedFetchCustomerList"
            @keyup.enter="fetchCustomerList"
          />
          <q-list v-if="customers.length">
            <q-item
              v-for="customer in customers"
              :key="customer.id"
              clickable
              @click="selectCustomer(customer)"
            >
              <q-item-section>{{ customer.name }}</q-item-section>
            </q-item>
          </q-list>
          <q-item v-if="!customers.length">
            <q-item-section>No customers found</q-item-section>
          </q-item>
        </q-card-section>
        <q-card-actions>
          <q-btn
            @click="customerSearchDialog = false"
            label="Close"
            color="negative"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Payment Dialog -->
    <q-dialog v-model="paymentDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Process Payment</div>
          <q-input
            v-model="selectedBookingForPayment.user.name"
            label="User"
            readonly
          />
          <q-input
            v-model="selectedBookingForPayment.staff.name"
            label="Staff"
            readonly
          />
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="createPayment()">
            <q-select
              v-model="paymentMethod"
              label="Payment Method"
              :options="PAYMENT_METHODS"
              required
            />
            <q-input
              v-model="paymentAmount"
              label="Payment Amount"
              type="number"
              required
            />
            <q-input v-model="paymentRemarks" label="Remarks" />
            <q-btn type="submit" label="Save Payment" color="primary" />
            <q-btn
              @click="cancelPaymentDialog"
              label="Cancel"
              flat
              color="negative"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useQuasar } from "quasar"; // Import useQuasar
import BookingAPI from "../apis/services/booking.js";
import { fetchCustomers, fetchStaff } from "../apis/users/user.js";
import { fetchServices } from "../apis/services/service.js";
import PaymentAPI from "../apis/services/payment.js";

const $q = useQuasar();

const bookings = ref([]);
const addBookingDialog = ref(false);
const customerSearchDialog = ref(false);
const filterDialog = ref(false);
const isEditing = ref(false);
const selectedBookingId = ref(null);
const staffOptions = ref([]);
const serviceTypes = ref([]);
const customerSearch = ref("");
const customers = ref([]);
const selectedCustomerName = ref("");
const paymentDialog = ref(false);
const paymentAmount = ref(0);
const paymentRemarks = ref("");
const paymentMethod = ref(null);
const selectedBookingForPayment = ref(null);
const startDate = ref(null);
const endDate = ref(null);

const newBooking = ref({
  total_payment: 0,
  staff: null,
  user: null,
  remarks: "",
  service_type: null,
  status: null,
});

const statusOptions = ref([
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
]);

const paymentStatus = ref([
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
]);

const PAYMENT_METHODS = [
  { label: "G-Cash", value: "gcash" },
  { label: "Cash", value: "cash" },
  { label: "Bank Transfer", value: "bank_transfer" },
];

const paymentInfo = ref({
  paidAmount: 0,
  paymentStatus: "pending",
  staffPercentage: 0,
});

const showCustomerSearchDialog = () => {
  customerSearchDialog.value = true;
};

const showPaymentDialog = (booking) => {
  selectedBookingForPayment.value = booking;
  paymentDialog.value = true;
};

const cancelPaymentDialog = () => {
  paymentDialog.value = false;
  paymentAmount.value = 0;
  paymentRemarks.value = "";
};

const getStatusLabel = (status) => {
  const option = statusOptions.value.find((opt) => opt.value === status);
  return option ? option.label : status;
};

const getPaymentStatusLabel = (status) => {
  const option = paymentStatus.value.find((opt) => opt.value === status);
  return option ? option.label : status;
};

watch(
  () => newBooking.value.service_type,
  (newServiceType) => {
    if (newServiceType) {
      const selectedService = serviceTypes.value.find(
        (service) => service.id === newServiceType.id
      );
      if (selectedService) {
        newBooking.value.total_payment = parseFloat(selectedService.price) || 0;
      } else {
        newBooking.value.total_payment = 0;
      }
    } else {
      newBooking.value.total_payment = 0;
    }
  }
);

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

const fetchStaffMembers = async () => {
  try {
    const staffData = await fetchStaff();
    staffOptions.value = staffData.map((staff) => ({
      id: staff.id,
      name: `${staff.first_name} ${staff.last_name}`,
    }));
  } catch (error) {
    console.error("Failed to fetch staff members:", error);
  }
};

const fetchServiceTypes = async () => {
  try {
    const servicesData = await fetchServices();
    serviceTypes.value = servicesData.map((service) => ({
      id: service.id,
      name: service.name,
      price: service.price || 0,
    }));
  } catch (error) {
    console.error("Failed to fetch services:", error);
  }
};

const fetchCustomerList = async () => {
  if (customerSearch.value.length < 2) {
    customers.value = [];
    return;
  }
  try {
    const customerData = await fetchCustomers(customerSearch.value);
    customers.value = customerData.map((customer) => ({
      id: customer.id,
      name: `${customer.first_name} ${customer.last_name}`,
    }));
  } catch (error) {
    console.error("Failed to fetch customers:", error);
  }
};

const selectCustomer = (customer) => {
  newBooking.value.customer_id = customer.id;
  selectedCustomerName.value = customer.name;
  customerSearch.value = "";
  customers.value = [];
  customerSearchDialog.value = false;
};

const debouncedFetchCustomerList = debounce(fetchCustomerList, 300);

const columns = [
  { name: "id", label: "ID", align: "left", field: "id", sortable: true },
  {
    name: "user",
    label: "Customer",
    align: "left",
    field: "user",
    sortable: true,
    format: (val) => val.name,
  },
  {
    name: "staff",
    label: "Staff",
    align: "left",
    field: "staff",
    sortable: true,
    format: (val) => val.name,
  },
  {
    name: "service_type",
    label: "Service Type",
    align: "left",
    field: "service_type",
  },
  {
    name: "total_payment",
    label: "Total Payment",
    align: "right",
    field: "total_payment",
    sortable: true,
  },
  {
    name: "status",
    label: "Booking Status",
    align: "center",
    field: "status",
    format: (val) => getStatusLabel(val),
  },
  {
    name: "total_payment",
    label: "Paid Amount",
    align: "center",
    field: "payment",
    sortable: true,
    format: (val) => (val ? val.total_payment : ""),
  },
  {
    name: "payment_status",
    label: "Payment Status",
    align: "center",
    field: "payment",
    sortable: true,
    format: (val) => (val ? getPaymentStatusLabel(val.status) : ""),
  },
  {
    name: "staff_percentage",
    label: "Staff Percentage",
    align: "right",
    field: "payment",
    sortable: true,
    format: (val) => (val ? val.staff_payment_percentage : ""),
  },
  {
    name: "remarks",
    label: "Remarks",
    align: "left",
    field: "remarks",
    sortable: false,
  },
  {
    name: "actions",
    label: "Actions",
    align: "center",
    field: "actions",
    sortable: false,
  },
];

const applyFilters = () => {
  filterDialog.value = false;
  fetchBookings();
};

const resetFilters = () => {
  startDate.value = null;
  endDate.value = null;
  customerSearch.value = "";
};

const showFilterDialog = () => {
  filterDialog.value = true;
};

const filteredBookings = computed(() => {
  return bookings.value.filter((booking) => {
    const bookingDate = new Date(booking.booking_date)
      .toISOString()
      .split("T")[0];

    const matchesDate =
      (startDate.value === null || bookingDate >= startDate.value) &&
      (endDate.value === null || bookingDate <= endDate.value);

    const matchesCustomerSearch =
      !customerSearch.value ||
      booking.user.name
        .toLowerCase()
        .includes(customerSearch.value.toLowerCase());

    return matchesDate && matchesCustomerSearch;
  });
});

const filterToday = () => {
  const today = new Date().toISOString().split("T")[0];
  startDate.value = today;
  endDate.value = today;
};

const fetchBookings = async () => {
  try {
    const response = await BookingAPI.getAllBookings();
    bookings.value = response.data.map((booking) => ({
      ...booking,
      user: {
        id: booking.user.id,
        name: `${booking.user.first_name} ${booking.user.last_name}`,
      },
      staff: {
        id: booking.staff.id,
        name: `${booking.staff.first_name} ${booking.staff.last_name}`,
      },
      total_payment: parseFloat(booking.total_payment) || 0,
    }));
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
  }
};

const showAddBookingDialog = () => {
  isEditing.value = false;
  newBooking.value = {
    total_payment: "",
    staff: null,
    user: null,
    remarks: "",
    service_type: null,
    status: null,
  };
  addBookingDialog.value = true;
};

const cancelAddBooking = () => {
  addBookingDialog.value = false;
};

// Bookings API request
const createBooking = async () => {
  try {
    const bookingData = {
      total_payment: newBooking.value.total_payment,
      staff: newBooking.value.staff.value,
      user: newBooking.value.customer_id,
      remarks: newBooking.value.remarks,
      service_type: newBooking.value.service_type.name,
      status: newBooking.value.status.value,
    };

    const response = await BookingAPI.createBooking(bookingData);
    const newBookingEntry = {
      ...response.data,
      user: {
        id: response.data.user.id,
        name: `${response.data.user.first_name} ${response.data.user.last_name}`,
      },
      staff: {
        id: response.data.staff.id,
        name: `${response.data.staff.first_name} ${response.data.staff.last_name}`,
      },
    };
    bookings.value.push(newBookingEntry);
    addBookingDialog.value = false;
    newBooking.value = {
      total_payment: 0,
      staff: "",
      remarks: "",
      service_type: null,
      status: "pending",
    };
    $q.notify({
      type: "positive",
      message: "Booking created successfully!",
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    $q.notify({
      type: "negative",
      message: "Failed to create booking. Please try again.",
    });
  }
};

const editBooking = (booking) => {
  isEditing.value = true;
  selectedBookingId.value = booking.id;
  newBooking.value = {
    total_payment: booking.total_payment,
    staff: booking.staff.name,
    remarks: booking.remarks,
    service_type: booking.service_type,
    status: booking.status,
    user: booking.user.id,
  };
  selectedCustomerName.value = booking.user.name;

  if (booking.service_type) {
    const selectedService = serviceTypes.value.find(
      (service) => service.id === booking.service_type.id
    );
    if (selectedService) {
      newBooking.value.total_payment = parseFloat(selectedService.price) || 0;
    }
  }

  addBookingDialog.value = true;
};

const updateBooking = async () => {
  console.log("update: ", newBooking.value);
  try {
    const bookingData = {
      total_payment: newBooking.value.total_payment,
      staff_id: newBooking.value.staff,
      user_id: newBooking.value.user,
      remarks: newBooking.value.remarks,
      service_type: newBooking.value.service_type,
      status: newBooking.value.status,
    };

    const response = await BookingAPI.updateBooking(
      selectedBookingId.value,
      bookingData
    );
    const updatedBooking = {
      ...response.data,
      user: {
        id: response.data.user.id,
        name: `${response.data.user.first_name} ${response.data.user.last_name}`,
      },
      staff: {
        id: response.data.staff.id,
        name: `${response.data.staff.first_name} ${response.data.staff.last_name}`,
      },
    };

    const index = bookings.value.findIndex(
      (booking) => booking.id === selectedBookingId.value
    );
    if (index !== -1) {
      bookings.value.splice(index, 1, updatedBooking);
    }

    addBookingDialog.value = false;
    newBooking.value = {
      total_payment: 0,
      staff: "",
      remarks: "",
      service_type: null,
      status: "pending",
    };

    $q.notify({
      type: "positive",
      message: "Booking updated successfully!",
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    $q.notify({
      type: "negative",
      message: "Failed to update booking. Please try again.",
    });
  }
};

const updateBookingStatus = async (booking) => {
  try {
    const updatedStatus = {
      status: "completed",
    };

    const response = await BookingAPI.updateBookingStatus(
      booking.id,
      updatedStatus
    );
    const index = bookings.value.findIndex((b) => b.id === booking.id);
    if (index !== -1) {
      bookings.value[index].status = response.data.status;
    }

    $q.notify({
      type: "positive",
      message: "Booking status updated successfully!",
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    $q.notify({
      type: "negative",
      message: "Failed to update booking status. Please try again.",
    });
  }
};

const deleteBooking = async (bookingId) => {
  const confirm = await $q.dialog({
    title: "Delete Booking",
    message: "Are you sure you want to delete this booking?",
    ok: { label: "Yes", color: "negative" },
    cancel: { label: "No" },
  });

  if (confirm) {
    try {
      await BookingAPI.deleteBooking(bookingId);
      bookings.value = bookings.value.filter(
        (booking) => booking.id !== bookingId
      );
      $q.notify({
        type: "positive",
        message: "Booking deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting booking:", error);
      $q.notify({
        type: "negative",
        message: "Failed to delete booking. Please try again.",
      });
    }
  }
};

// Payment API request
const createPayment = async () => {
  if (!selectedBookingForPayment.value) return;

  const paymentData = {
    booking_id: selectedBookingForPayment.value.id,
    total_payment: paymentAmount.value,
    payment_method: paymentMethod.value.value,
    remarks: paymentRemarks.value,
    user: selectedBookingForPayment.value.user.id,
    staff: selectedBookingForPayment.value.staff.id,
    status: "completed",
  };

  try {
    await PaymentAPI.createPayment(paymentData);
    $q.notify({
      type: "positive",
      message: "Payment recorded successfully!",
    });
    paymentDialog.value = false;
  } catch (error) {
    console.error("Error recording payment:", error);
    $q.notify({
      type: "negative",
      message: "Failed to record payment. Please try again.",
    });
  } finally {
    cancelPaymentDialog();
  }
};

onMounted(() => {
  fetchStaffMembers();
  fetchServiceTypes();
  fetchBookings();
});
</script>

<style scoped>
.action-btn {
  width: 10px;
  height: 10px;
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
