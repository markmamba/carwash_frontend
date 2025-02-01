<template>
  <q-page>
    <div style="width: 80%; margin: 3% auto">
      <q-toolbar class="q-mb-md">
        <q-space />
        <q-btn color="primary" label="Add User" @click="showAddUserModal" />
      </q-toolbar>

      <q-table :rows="users" :columns="columns" row-key="id" class="user-table">
        <template v-slot:body-cell-actions="props">
          <q-td class="action-column">
            <q-btn
              color="secondary"
              icon="edit"
              @click="editUser(props.row)"
              round
              dense
              class="action-btn"
            />
            <q-btn
              color="negative"
              icon="delete"
              @click="deleteUser(props.row.id)"
              round
              dense
              class="action-btn"
            />
          </q-td>
        </template>
      </q-table>

      <!-- Add/Edit User Modal -->
      <q-dialog v-model="isUserModalOpen" persistent>
        <q-card style="min-width: 400px">
          <q-card-section>
            <div class="text-h6">
              {{ isEditing ? "Edit User" : "Add New User" }}
            </div>
          </q-card-section>

          <q-card-section>
            <q-input v-model="currentUser.first_name" label="First Name" />
            <q-input v-model="currentUser.last_name" label="Last Name" />
            <q-input v-model="currentUser.username" label="Username" />
            <q-input v-model="currentUser.email" label="Email" />
            <q-select
              v-model="currentUser.user_type"
              label="User Type"
              :options="userTypes"
            />
            <q-input v-model="currentUser.phone_number" label="Phone Number" />
            <q-input v-model="currentUser.address" label="Address" />
            <q-input v-model="currentUser.plate_no" label="Plate Number" />
            <q-input
              v-model="currentUser.password"
              label="Password"
              type="password"
            />
          </q-card-section>

          <q-card-actions>
            <q-btn label="Cancel" color="negative" @click="closeUserModal" />
            <q-btn
              :label="isEditing ? 'Update' : 'Add'"
              color="primary"
              @click="isEditing ? handleUpdateUser() : handleAddUser()"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import {
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
} from "../apis/users/user";

export default {
  name: "UserManagementPage",
  props: ["title"],
  data() {
    return {
      users: [],
      columns: [
        {
          name: "first_name",
          label: "First Name",
          align: "left",
          field: "first_name",
        },
        {
          name: "last_name",
          label: "Last Name",
          align: "left",
          field: "last_name",
        },
        {
          name: "username",
          label: "Username",
          align: "left",
          field: "username",
        },
        { name: "email", label: "Email", align: "left", field: "email" },
        {
          name: "user_type",
          label: "User Type",
          align: "left",
          field: "user_type",
        },
        {
          name: "phone_number",
          label: "Phone Number",
          align: "left",
          field: "phone_number",
        },
        { name: "address", label: "Address", align: "left", field: "address" },
        {
          name: "plate_no",
          label: "Plate Number",
          align: "left",
          field: "plate_no",
        },
        {
          name: "actions",
          label: "Actions",
          align: "center",
          field: "actions",
        },
      ],
      isUserModalOpen: false,
      isEditing: false,
      currentUser: this.getEmptyUser(),
      userTypes: ["customer", "staff", "admin"],
    };
  },
  async created() {
    await this.loadUsers();
  },
  methods: {
    getEmptyUser() {
      return {
        id: null,
        username: "",
        email: "",
        user_type: "",
        phone_number: "",
        address: "",
        plate_no: "",
        password: "",
      };
    },
    async loadUsers() {
      try {
        this.users = await fetchUsers();
      } catch (error) {
        console.error("Error loading users:", error);
        this.$q.notify({
          type: "negative",
          message: "Error loading users",
          position: "top",
          timeout: 3000,
        });
      }
    },
    showAddUserModal() {
      this.isEditing = false;
      this.currentUser = this.getEmptyUser(); // Reset form data
      this.isUserModalOpen = true;
    },
    editUser(user) {
      this.isEditing = true;
      this.currentUser = { ...user }; // Load selected user data into form
      this.isUserModalOpen = true;
    },
    closeUserModal() {
      this.isUserModalOpen = false;
    },
    async handleAddUser() {
      try {
        const newUser = await addUser(this.currentUser);
        this.users.push(newUser);
        this.closeUserModal();
        this.$q.notify({
          type: "positive",
          message: "User added successfully",
          position: "top",
          timeout: 3000,
        });
      } catch (error) {
        console.error("Error adding user:", error);
        this.$q.notify({
          type: "negative",
          message: "Error adding user",
          position: "top",
          timeout: 3000,
        });
      }
    },
    async handleUpdateUser() {
      try {
        const updatedUser = await updateUser(
          this.currentUser.id,
          this.currentUser
        );
        const index = this.users.findIndex(
          (user) => user.id === this.currentUser.id
        );
        if (index !== -1) {
          this.users.splice(index, 1, updatedUser);
        }
        this.closeUserModal();
        this.$q.notify({
          type: "positive",
          message: "User updated successfully",
          position: "top",
          timeout: 3000,
        });
      } catch (error) {
        console.error("Error updating user:", error);
        this.$q.notify({
          type: "negative",
          message: "Error updating user",
          position: "top",
          timeout: 3000,
        });
      }
    },
    async deleteUser(userId) {
      try {
        await deleteUser(userId);
        this.users = this.users.filter((user) => user.id !== userId);
        this.$q.notify({
          type: "positive",
          message: "User deleted successfully",
          position: "top",
          timeout: 3000,
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        this.$q.notify({
          type: "negative",
          message: "Error deleting user",
          position: "top",
          timeout: 3000,
        });
      }
    },
  },
};
</script>

<style scoped>
.user-table {
  font-size: 1.5em;
}

.user-table .q-td {
  padding: 16px;
}

.user-table .q-th {
  font-size: 1.5em;
  padding: 16px;
}
.action-btn {
  margin-right: 10%;
}
.action-column {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
