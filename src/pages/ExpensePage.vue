<template>
  <q-page>
    <div style="width: 90%; margin: 3% auto">
      <q-toolbar>
        <q-toolbar-title>Expense Tracker</q-toolbar-title>
        <q-btn
          @click="showAddExpenseDialog"
          label="Add Expense"
          color="primary"
        />
      </q-toolbar>

      <q-table
        :rows="expenses"
        :columns="columns"
        row-key="id"
        :rows-per-page-options="[5, 10, 20]"
        title="Expenses"
      >
        <!-- Scoped slot for actions column -->
        <template v-slot:body-cell-actions="props">
          <q-td class="action-column">
            <q-btn
              color="secondary"
              icon="edit"
              @click="editExpense(props.row)"
              round
              dense
              class="action-btn"
            />
            <q-btn
              color="negative"
              icon="delete"
              @click="deleteExpense(props.row.id)"
              round
              dense
              class="action-btn"
            />
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Add/Edit Expense Dialog -->
    <q-dialog v-model="addExpenseDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? "Edit Expense" : "Add Expense" }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="isEditing ? updateExpense() : createExpense()">
            <q-input v-model="newExpense.amount" label="Amount" type="number" />
            <q-select
              v-model="newExpense.category"
              label="Category"
              :options="categories"
            />
            <q-input v-model="newExpense.description" label="Description" />
            <q-btn type="submit" label="Save" color="primary" />
            <q-btn
              @click="cancelAddExpense"
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
import { ref, onMounted } from "vue";
import ExpenseAPI from "../apis/finance/expense";

const expenses = ref([]);
const addExpenseDialog = ref(false);
const isEditing = ref(false); // Track if editing or creating a new expense
const selectedExpenseId = ref(null); // Track the selected expense for editing

const newExpense = ref({
  amount: "",
  category: "",
  description: "",
});
const categories = [
  { label: "Supplies", value: "supplies" },
  { label: "Salaries", value: "salaries" },
  { label: "Utilities", value: "utilities" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Marketing", value: "marketing" },
];

// Table columns configuration
const columns = [
  { name: "id", label: "ID", align: "left", field: "id", sortable: true },
  {
    name: "amount",
    label: "Amount",
    align: "left",
    field: "amount",
    sortable: true,
  },
  {
    name: "category",
    label: "Category",
    align: "left",
    field: "category",
    sortable: true,
  },
  { name: "date", label: "Date", align: "left", field: "date", sortable: true },
  {
    name: "description",
    label: "Description",
    align: "left",
    field: "description",
  },
  {
    name: "actions",
    label: "Actions",
    align: "center",
    field: "actions",
    sortable: false,
  },
];

// Fetch all expenses
async function fetchExpenses() {
  try {
    const response = await ExpenseAPI.getAllExpenses();
    expenses.value = response.data;
  } catch (error) {
    console.error("Error fetching expenses:", error);
  }
}

// Create a new expense
async function createExpense() {
  try {
    await ExpenseAPI.createExpense(newExpense.value);
    fetchExpenses(); // Refresh the list
    addExpenseDialog.value = false;
    newExpense.value = {}; // Reset the form
  } catch (error) {
    console.error("Error creating expense:", error);
  }
}

// Show the Add Expense dialog
function showAddExpenseDialog() {
  isEditing.value = false; // Ensure this is an add action
  addExpenseDialog.value = true;
}

// Show the Edit Expense dialog
function editExpense(row) {
  isEditing.value = true;
  selectedExpenseId.value = row.id; // Store the selected expense ID
  newExpense.value = { ...row }; // Fill the form with the current expense data
  addExpenseDialog.value = true; // Open the dialog
}

// Update an existing expense
async function updateExpense() {
  try {
    await ExpenseAPI.updateExpense(selectedExpenseId.value, newExpense.value);
    fetchExpenses(); // Refresh the list
    addExpenseDialog.value = false;
    newExpense.value = {}; // Reset the form
  } catch (error) {
    console.error("Error updating expense:", error);
  }
}

// Delete an expense
async function deleteExpense(id) {
  try {
    await ExpenseAPI.deleteExpense(id);
    fetchExpenses(); // Refresh the list
  } catch (error) {
    console.error("Error deleting expense:", error);
  }
}

// Cancel the Add/Edit operation
function cancelAddExpense() {
  addExpenseDialog.value = false;
  newExpense.value = {}; // Reset the form
}

onMounted(() => {
  fetchExpenses();
});
</script>

<style scoped>
.action-btn {
  margin-right: 10%;
}
.action-column {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
