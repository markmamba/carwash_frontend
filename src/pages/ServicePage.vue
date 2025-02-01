<template>
  <q-page>
    <div style="width: 90%; margin: 3% auto">
      <q-toolbar class="q-mb-md">
        <q-space />
        <q-btn
          color="primary"
          label="Add Service"
          @click="showAddServiceModal"
        />
      </q-toolbar>
      <q-table
        :rows="services"
        :columns="columns"
        row-key="id"
        class="service-table"
      >
        <template v-slot:body-cell-actions="props">
          <q-td class="action-column">
            <q-btn
              color="secondary"
              icon="edit"
              @click="editService(props.row)"
              round
              dense
              class="action-btn"
            />
            <q-btn
              color="negative"
              icon="delete"
              @click="deleteService(props.row.id)"
              round
              dense
              class="action-btn"
            />
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Add/Edit Service Modal -->
    <q-dialog v-model="isServiceModalOpen" persistent>
      <q-card style="min-width: 400px; min-height: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? "Edit Service" : "Add New Service" }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="currentService.name" label="Service Name" />
          <q-input v-model="currentService.price" label="Price" type="number" />
          <q-input v-model="currentService.description" label="Description" />
        </q-card-section>

        <q-card-actions>
          <q-btn label="Cancel" color="negative" @click="closeServiceModal" />
          <q-btn
            :label="isEditing ? 'Update' : 'Add'"
            color="primary"
            @click="isEditing ? updateService() : addService()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import {
  fetchServices,
  createService,
  deleteService,
  updateService, // Import update function
} from "../apis/services/service";

export default {
  name: "ServicePage",
  props: ["title"],
  data() {
    return {
      services: [],
      columns: [
        { name: "name", label: "Service Name", align: "left", field: "name" },
        { name: "price", label: "Price", align: "left", field: "price" },
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
        },
      ],
      isServiceModalOpen: false,
      isEditing: false,
      currentService: {
        id: null,
        name: "",
        price: null,
        description: "",
      },
    };
  },
  async created() {
    await this.loadServices();
  },
  methods: {
    async loadServices() {
      try {
        this.services = await fetchServices();
      } catch (error) {
        console.error("Error fetching services:", error.message);
      }
    },
    showAddServiceModal() {
      this.isEditing = false; // Reset edit state
      this.resetCurrentService();
      this.isServiceModalOpen = true;
    },
    closeServiceModal() {
      this.isServiceModalOpen = false;
      this.resetCurrentService();
    },
    resetCurrentService() {
      this.currentService = {
        id: null,
        name: "",
        price: null,
        description: "",
      };
    },
    async addService() {
      try {
        const createdService = await createService(this.currentService);
        this.services.push(createdService);
        this.closeServiceModal();

        this.$q.notify({
          type: "positive",
          message: "Service added successfully!",
          position: "top",
          timeout: 3000,
        });
      } catch (error) {
        console.error("Error adding service:", error.message);
        this.$q.notify({
          type: "negative",
          message: "Error adding service. Please try again.",
          position: "top",
          timeout: 3000,
        });
      }
    },
    editService(service) {
      this.isEditing = true;
      this.currentService = { ...service }; // Populate currentService with the selected service's data
      this.isServiceModalOpen = true;
    },
    async updateService() {
      try {
        await updateService(this.currentService.id, this.currentService); // Pass both ID and data
        const index = this.services.findIndex(
          (s) => s.id === this.currentService.id
        );
        if (index !== -1) {
          this.services.splice(index, 1, this.currentService); // Update the service in the array
        }
        this.closeServiceModal();

        this.$q.notify({
          type: "positive",
          message: "Service updated successfully!",
          position: "top",
          timeout: 3000,
        });
      } catch (error) {
        console.error("Error updating service:", error.message);
        this.$q.notify({
          type: "negative",
          message: "Error updating service. Please try again.",
          position: "top",
          timeout: 3000,
        });
      }
    },
    async deleteService(serviceId) {
      try {
        await deleteService(serviceId);
        this.services = this.services.filter(
          (service) => service.id !== serviceId
        );

        this.$q.notify({
          type: "positive",
          message: "Service deleted successfully!",
          position: "top",
          timeout: 3000,
        });
      } catch (error) {
        console.error("Error deleting service:", error.message);
        this.$q.notify({
          type: "negative",
          message: "Error deleting service. Please try again.",
          position: "top",
          timeout: 3000,
        });
      }
    },
  },
};
</script>

<style scoped>
.service-table {
  font-size: 1.5em;
}

.service-table .q-td {
  padding: 16px;
}

.service-table .q-th {
  font-size: 1.5em;
  padding: 16px;
}
.action-btn {
  margin-right: 8px;
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
