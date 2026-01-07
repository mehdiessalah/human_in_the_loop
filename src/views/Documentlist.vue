<template>
  <div class="documents-page">
    <div class="page-header">
      <h2>Documents</h2>
      <button class="btn btn-primary" @click="showUploadModal = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4V20M12 4L8 8M12 4L16 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Upload Document
      </button>
    </div>

    <!-- Filters -->
    <div class="card filters-card">
      <div class="filters">
        <div class="filter-group">
          <label class="form-label">Status</label>
          <select v-model="filters.status" class="form-select" @change="loadDocuments">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="form-label">Document Type</label>
          <select v-model="filters.document_type" class="form-select" @change="loadDocuments">
            <option value="">All Types</option>
            <option value="invoice">Invoice</option>
            <option value="receipt">Receipt</option>
            <option value="form">Form</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        <button class="btn btn-secondary" @click="resetFilters">
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="spinner"></div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <!-- Documents Table -->
    <div v-else class="card">
      <table class="table" v-if="documents.length > 0">
        <thead>
        <tr>
          <th>Filename</th>
          <th>Type</th>
          <th>Status</th>
          <th>Upload Date</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="doc in documents" :key="doc.id">
          <td class="filename">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ doc.filename }}
          </td>
          <td>
            <span class="type-badge">{{ doc.document_type || 'Unknown' }}</span>
          </td>
          <td>
              <span :class="`badge badge-${doc.status}`">
                {{ formatStatus(doc.status) }}
              </span>
          </td>
          <td>{{ formatDate(doc.upload_date) }}</td>
          <td>
            <div class="actions">
              <button
                  class="btn-icon"
                  @click="viewDocument(doc.id)"
                  title="View & Edit"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>

              <button
                  v-if="doc.status === 'pending'"
                  class="btn-icon btn-icon-primary"
                  @click="extractFields(doc.id)"
                  title="Extract Fields"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3H15M9 3C9 3.55228 8.55228 4 8 4H6C5.44772 4 5 4.44772 5 5V19C5 19.5523 5.44772 20 6 20H8C8.55228 20 9 20.4477 9 21M9 3C9 3.55228 9.44772 4 10 4H14C14.5523 4 15 3.55228 15 3M15 3C15 3.55228 15.4477 4 16 4H18C18.5523 4 19 4.44772 19 5V19C19 19.5523 18.5523 20 18 20H16C15.4477 20 15 20.4477 15 21M9 21H15M9 21C9 20.4477 9.44772 20 10 20H14C14.5523 20 15 20.4477 15 21" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>

              <button
                  class="btn-icon btn-icon-danger"
                  @click="deleteDocument(doc.id)"
                  title="Delete"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>

      <div v-else class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3>No documents found</h3>
        <p>Upload your first document to get started</p>
        <button class="btn btn-primary" @click="showUploadModal = true">
          Upload Document
        </button>
      </div>
    </div>

    <!-- Upload Modal -->
    <UploadModal
        v-if="showUploadModal"
        @close="showUploadModal = false"
        @uploaded="onDocumentUploaded"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiService } from '../services/api';
import UploadModal from '../components/Uploadmodal.vue';

export default {
  name: 'DocumentList',
  components: {
    UploadModal
  },
  setup() {
    const router = useRouter();
    const documents = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const showUploadModal = ref(false);

    const filters = ref({
      status: '',
      document_type: '',
      limit: 50
    });

    const loadDocuments = async () => {
      loading.value = true;
      error.value = null;

      try {
        const data = await apiService.getDocuments(filters.value);
        // Sort documents: rejected status at the end
        documents.value = data.sort((a, b) => {
          if (a.status === 'rejected' && b.status !== 'rejected') return 1;
          if (a.status !== 'rejected' && b.status === 'rejected') return -1;
          return 0;
        });
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const resetFilters = () => {
      filters.value = {
        status: '',
        document_type: '',
        limit: 50
      };
      loadDocuments();
    };

    const viewDocument = (documentId) => {
      router.push(`/documents/${documentId}`);
    };

    const extractFields = async (documentId) => {
      try {
        await apiService.extractDocumentFields(documentId);
        await loadDocuments();
        router.push(`/documents/${documentId}`);
      } catch (err) {
        alert(`Failed to extract fields: ${err.message}`);
      }
    };

    const deleteDocument = async (documentId) => {
      if (confirm('Are you sure you want to delete this document?')) {
        try {
          await apiService.updateDocumentStatus(documentId, 'rejected'); // Use 'rejected' instead
          await loadDocuments();
        } catch (err) {
          alert(`Failed to delete document: ${err.message}`);
        }
      }
    };

    const onDocumentUploaded = () => {
      showUploadModal.value = false;
      loadDocuments();
    };

    const formatStatus = (status) => {
      return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    onMounted(() => {
      loadDocuments();
    });

    return {
      documents,
      loading,
      error,
      filters,
      showUploadModal,
      loadDocuments,
      resetFilters,
      viewDocument,
      extractFields,
      deleteDocument,
      onDocumentUploaded,
      formatStatus,
      formatDate
    };
  }
};
</script>

<style scoped>
.documents-page {
  padding: 20px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.filters-card {
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 20px;
  align-items: flex-end;
}

.filter-group {
  flex: 1;
  max-width: 250px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background-color: #f9fafb;
}

.table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
}

.table td {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #374151;
}

.table tbody tr:hover {
  background-color: #f9fafb;
}

.filename {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.filename svg {
  color: #6b7280;
}

.type-badge {
  display: inline-block;
  padding: 4px 10px;
  background-color: #f3f4f6;
  color: #4b5563;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  padding: 8px;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  color: #374151;
}

.btn-icon-primary {
  color: #3b82f6;
  border-color: #93c5fd;
}

.btn-icon-primary:hover {
  background-color: #eff6ff;
  border-color: #3b82f6;
}

.btn-icon-danger {
  color: #ef4444;
  border-color: #fca5a5;
}

.btn-icon-danger:hover {
  background-color: #fef2f2;
  border-color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state svg {
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  color: #1f2937;
  margin-bottom: 8px;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 24px;
}
</style>