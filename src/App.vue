<template>
  <div id="app">
    <Header :stats="overviewStats" />

    <div class="container">
      <router-view />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { apiService } from './services/api';
import Header from './components/Header.vue';

export default {
  name: 'App',
  components: {
    Header
  },
  setup() {
    const overviewStats = ref({
      total_documents: 0,
      total_extraction_fields: 0,
      total_corrections: 0,
      total_sessions: 0,
      average_confidence: 0
    });

    const fetchOverviewStats = async () => {
      try {
        const stats = await apiService.getOverviewStats();
        overviewStats.value = stats;
      } catch (error) {
        console.error('Failed to fetch overview stats:', error);
      }
    };

    onMounted(() => {
      fetchOverviewStats();
      // Refresh stats every 30 seconds
      setInterval(fetchOverviewStats, 30000);
    });

    return {
      overviewStats
    };
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* Global button styles */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-success {
  background-color: #10b981;
  color: white;
}

.btn-success:hover {
  background-color: #059669;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

/* Card styles */
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

/* Form styles */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Badge styles */
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.badge-in-progress {
  background-color: #dbeafe;
  color: #1e40af;
}

.badge-completed {
  background-color: #d1fae5;
  color: #065f46;
}

.badge-rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Loading spinner */
.spinner {
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 40px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Alert styles */
.alert {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.alert-error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.alert-info {
  background-color: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

/* Utility classes */
.text-center {
  text-align: center;
}

.mt-10 {
  margin-top: 10px;
}

.mt-20 {
  margin-top: 20px;
}

.mb-10 {
  margin-bottom: 10px;
}

.mb-20 {
  margin-bottom: 20px;
}

.flex {
  display: flex;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.gap-10 {
  gap: 10px;
}

.gap-20 {
  gap: 20px;
}
</style>