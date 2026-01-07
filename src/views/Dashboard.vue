<template>
  <div class="dashboard-page">
    <div class="page-header">
      <h2>Dashboard</h2>
      <button class="btn btn-secondary" @click="refreshData">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Refresh
      </button>
    </div>

    <div v-if="loading" class="spinner"></div>

    <div v-else>
      <!-- Overview Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #eff6ff; color: #3b82f6;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overviewStats.total_documents }}</div>
            <div class="stat-label">Total Documents</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #f0fdf4; color: #10b981;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 5H6C5.44772 5 5 5.44772 5 6V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V13M17.5858 3.58579C18.3668 2.80474 19.6332 2.80474 20.4142 3.58579C21.1953 4.36683 21.1953 5.63316 20.4142 6.41421L11.8284 15H9L9 12.1716L17.5858 3.58579Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overviewStats.total_corrections }}</div>
            <div class="stat-label">Corrections Made</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #fef3c7; color: #f59e0b;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ (overviewStats.average_confidence * 100).toFixed(1) }}%</div>
            <div class="stat-label">Avg Confidence</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #fce7f3; color: #ec4899;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overviewStats.total_sessions }}</div>
            <div class="stat-label">Active Sessions</div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <!-- Correction Stats -->
        <div class="card">
          <div class="card-header">
            <h3>Correction Statistics</h3>
          </div>
          <div class="chart-content">
            <div v-if="correctionStats.length === 0" class="empty-chart">
              No correction data available
            </div>
            <div v-else class="table-container">
              <table class="data-table">
                <thead>
                <tr>
                  <th>Field Name</th>
                  <th>Total</th>
                  <th>Corrections</th>
                  <th>Validations</th>
                  <th>Avg Time</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="stat in correctionStats.slice(0, 10)" :key="stat.field_name || 'unknown'">
                  <td class="field-name">{{ formatFieldName(stat.field_name) }}</td>
                  <td>{{ stat.total_corrections || 0 }}</td>
                  <td>
                    <span class="correction-badge">{{ stat.correction_count || 0 }}</span>
                  </td>
                  <td>
                    <span class="validation-badge">{{ stat.validation_count || 0 }}</span>
                  </td>
                  <td>{{ stat.avg_time_seconds ? stat.avg_time_seconds.toFixed(1) + 's' : 'N/A' }}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>


      <!-- Model Improvement -->
      <div class="card" v-if="modelImprovement.length > 0">
        <div class="card-header">
          <h3>Model Improvement Over Time</h3>
        </div>
        <div class="chart-content">
          <div class="improvement-timeline">
            <div
                v-for="model in modelImprovement"
                :key="model.version_name"
                class="timeline-item"
            >
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <strong>{{ model.version_name }}</strong>
                  <span class="timeline-date">{{ formatDate(model.training_date) }}</span>
                </div>
                <div class="timeline-stats">
                  <span>Corrections: {{ model.corrections_included }}</span>
                  <span>Training Size: {{ model.training_data_size }}</span>
                </div>
              </div>
            </div>
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
  name: 'Dashboard',
  setup() {
    const loading = ref(true);
    const overviewStats = ref({
      total_documents: 0,
      total_extraction_fields: 0,
      total_corrections: 0,
      total_sessions: 0,
      average_confidence: 0
    });
    const correctionStats = ref([]);
    const fieldAccuracy = ref([]);
    const documentStats = ref([]);
    const modelImprovement = ref([]);

    const loadData = async () => {
      loading.value = true;

      try {
        const [overview, corrections, accuracy, docStats, improvement] = await Promise.all([
          apiService.getOverviewStats(),
          apiService.getCorrectionStats(),
          apiService.getFieldAccuracy(),
          apiService.getDocumentStats(),
          apiService.getModelImprovement()
        ]);

        overviewStats.value = overview;

        // Keep all stats but handle nulls in display
        correctionStats.value = corrections;
        fieldAccuracy.value = accuracy;

        documentStats.value = docStats;
        modelImprovement.value = improvement;
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        loading.value = false;
      }
    };

    const refreshData = () => {
      loadData();
    };

    const formatFieldName = (name) => {
      if (!name) return 'Unknown';
      return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatStatus = (status) => {
      if (!status) return 'Unknown';
      return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };

    const getAccuracyClass = (accuracy) => {
      if (accuracy >= 0.9) return 'high';
      if (accuracy >= 0.7) return 'medium';
      return 'low';
    };

    onMounted(() => {
      loadData();
    });

    return {
      loading,
      overviewStats,
      correctionStats,
      fieldAccuracy,
      documentStats,
      modelImprovement,
      refreshData,
      formatFieldName,
      formatStatus,
      formatDate,
      getAccuracyClass
    };
  }
};
</script>

<style scoped>
.dashboard-page {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-content {
  padding: 20px;
}

.empty-chart {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  border-bottom: 2px solid #e5e7eb;
}

.data-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #374151;
}

.correction-badge,
.validation-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.correction-badge {
  background: #fef3c7;
  color: #92400e;
}

.validation-badge {
  background: #d1fae5;
  color: #065f46;
}

.accuracy-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.accuracy-item {
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.accuracy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.accuracy-value {
  font-weight: 600;
  color: #1f2937;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s;
}

.progress-fill.high {
  background: #10b981;
}

.progress-fill.medium {
  background: #f59e0b;
}

.progress-fill.low {
  background: #ef4444;
}

.accuracy-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.status-card {
  text-align: center;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.status-count {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.improvement-timeline {
  position: relative;
  padding-left: 30px;
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;
}

.timeline-marker {
  position: absolute;
  left: -30px;
  top: 0;
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #3b82f6;
}

.timeline-item:not(:last-child) .timeline-marker::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 12px;
  width: 2px;
  height: calc(100% + 24px);
  background: #e5e7eb;
}

.timeline-content {
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.timeline-date {
  font-size: 12px;
  color: #6b7280;
}

.timeline-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #6b7280;
}
</style>