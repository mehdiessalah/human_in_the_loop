<template>
  <div class="models-page">
    <div class="page-header">
      <h2>Model Versions</h2>
      <button class="btn btn-primary" @click="showTrainingModal = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4V20M12 4L8 8M12 4L16 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Train New Model
      </button>
    </div>

    <div v-if="loading" class="spinner"></div>

    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <div v-else>
      <!-- Active Model -->
      <div v-if="activeModel" class="card active-model-card">
        <div class="card-header">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Active Model
          </h3>
        </div>
        <div class="model-details">
          <div class="model-info-grid">
            <div class="info-item">
              <span class="info-label">Version</span>
              <span class="info-value">{{ activeModel.version_name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Type</span>
              <span class="info-value">{{ activeModel.model_type || 'LayoutLMv3' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Training Date</span>
              <span class="info-value">{{ formatDate(activeModel.training_date) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Training Data Size</span>
              <span class="info-value">{{ activeModel.training_data_size || 0 }} samples</span>
            </div>
            <div class="info-item">
              <span class="info-label">Corrections Included</span>
              <span class="info-value">{{ activeModel.corrections_included || 0 }}</span>
            </div>
          </div>

          <div v-if="activeModel.performance_metrics" class="metrics-section">
            <h4>Performance Metrics</h4>
            <div class="metrics-grid">
              <div
                  v-for="(value, key) in activeModel.performance_metrics"
                  :key="key"
                  class="metric-item"
              >
                <span class="metric-label">{{ formatMetricName(key) }}</span>
                <span class="metric-value">{{ formatMetricValue(value) }}</span>
              </div>
            </div>
          </div>

          <div v-if="activeModel.notes" class="notes-section">
            <h4>Notes</h4>
            <p>{{ activeModel.notes }}</p>
          </div>
        </div>
      </div>

      <!-- Model History -->
      <div class="card">
        <div class="card-header">
          <h3>Model History</h3>
          <span class="model-count">{{ models.length }} version{{ models.length !== 1 ? 's' : '' }}</span>
        </div>

        <div v-if="models.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>No models trained yet</h3>
          <p>Train your first model with correction data</p>
          <button class="btn btn-primary" @click="showTrainingModal = true">
            Train New Model
          </button>
        </div>

        <div v-else class="models-list">
          <div
              v-for="model in models"
              :key="model.id"
              class="model-item"
              :class="{ 'active': model.is_active }"
          >
            <div class="model-header">
              <div class="model-title">
                <h4>{{ model.version_name }}</h4>
                <span v-if="model.is_active" class="badge badge-completed">Active</span>
              </div>
              <div class="model-meta">
                <span class="meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  {{ formatDate(model.training_date) }}
                </span>
                <span class="meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  {{ model.training_data_size || 0 }} samples
                </span>
                <span class="meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 5H6C5.44772 5 5 5.44772 5 6V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V13M17.5858 3.58579C18.3668 2.80474 19.6332 2.80474 20.4142 3.58579C21.1953 4.36683 21.1953 5.63316 20.4142 6.41421L11.8284 15H9L9 12.1716L17.5858 3.58579Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ model.corrections_included || 0 }} corrections
                </span>
              </div>
            </div>

            <div v-if="model.performance_metrics" class="model-metrics">
              <div
                  v-for="(value, key) in model.performance_metrics"
                  :key="key"
                  class="metric-chip"
              >
                <span class="metric-name">{{ formatMetricName(key) }}</span>
                <span class="metric-val">{{ formatMetricValue(value) }}</span>
              </div>
            </div>

            <div v-if="model.notes" class="model-notes">
              {{ model.notes }}
            </div>

            <div class="model-actions">
              <button
                  v-if="!model.is_active"
                  class="btn-small btn-primary"
                  @click="activateModel(model.id)"
              >
                Activate
              </button>
              <button class="btn-small btn-secondary">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Training Modal -->
    <div v-if="showTrainingModal" class="modal-overlay" @click.self="showTrainingModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Train New Model</h3>
          <button class="close-btn" @click="showTrainingModal = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="alert alert-info">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="8" r="1" fill="currentColor"/>
            </svg>
            <p>Training a new model will use all collected corrections to improve extraction accuracy. This process may take several minutes.</p>
          </div>

          <p style="margin-top: 16px; color: #6b7280;">To train a new model, run the training script:</p>
          <div class="code-block">
            <code>python train_model.py</code>
          </div>

          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showTrainingModal = false">
              Cancel
            </button>
            <button class="btn btn-primary" @click="startTraining">
              Start Training
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { apiService } from '../services/api';

export default {
  name: 'Models',
  setup() {
    const models = ref([]);
    const activeModel = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const showTrainingModal = ref(false);

    const startTraining = async () => {
      try {
        await apiService.triggerTraining();
        alert('Training started! This will take several minutes. Check the Models page later to see the new version.');
        showTrainingModal.value = false;
      } catch (err) {
        alert(`Failed to start training: ${err.message}`);
      }
    };

    const loadModels = async () => {
      loading.value = true;
      error.value = null;

      try {
        const [allModels, active] = await Promise.all([
          apiService.getModelVersions(),
          apiService.getActiveModel()
        ]);

        models.value = allModels;
        if (active && !active.message) {
          activeModel.value = active;
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const activateModel = async (modelId) => {
      if (!confirm('Are you sure you want to activate this model? The current active model will be deactivated.')) {
        return;
      }

      try {
        await apiService.activateModel(modelId);
        alert('Model activated successfully! Please restart your backend server for changes to take effect.');
        await loadModels();
      } catch (err) {
        alert(`Failed to activate model: ${err.message}`);
      }
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const formatMetricName = (name) => {
      return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatMetricValue = (value) => {
      if (typeof value === 'number') {
        if (value < 1) {
          return (value * 100).toFixed(2) + '%';
        }
        return value.toFixed(4);
      }
      return value;
    };

    onMounted(() => {
      loadModels();
    });

    return {
      models,
      activeModel,
      loading,
      error,
      showTrainingModal,
      startTraining,
      loadModels,
      activateModel,
      formatDate,
      formatMetricName,
      formatMetricValue
    };
  }
};
</script>

<style scoped>
.models-page {
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

.active-model-card {
  margin-bottom: 24px;
  border: 2px solid #10b981;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}

.card-header svg {
  color: #10b981;
}

.model-count {
  font-size: 14px;
  color: #6b7280;
}

.model-details {
  padding: 20px;
}

.model-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 600;
}

.info-value {
  font-size: 16px;
  color: #1f2937;
  font-weight: 500;
}

.metrics-section,
.notes-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.metrics-section h4,
.notes-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.metric-item {
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 12px;
  color: #6b7280;
}

.metric-value {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.notes-section p {
  color: #6b7280;
  line-height: 1.6;
}

.models-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.model-item {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.model-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.model-item.active {
  border-color: #10b981;
  background: #f0fdf4;
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.model-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.model-title h4 {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
}

.model-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
}

.meta-item svg {
  color: #9ca3af;
}

.model-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.metric-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #f3f4f6;
  border-radius: 12px;
  font-size: 12px;
}

.metric-name {
  color: #6b7280;
}

.metric-val {
  font-weight: 600;
  color: #1f2937;
}

.model-notes {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
  font-style: italic;
}

.model-actions {
  display: flex;
  gap: 8px;
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

.code-block {
  background: #1f2937;
  color: #10b981;
  padding: 12px 16px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  margin-top: 12px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.modal-body {
  padding: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>