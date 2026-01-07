<template>
  <header class="header">
    <div class="header-container">
      <div class="header-left">
        <h1 class="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          HITL Document Extractor
        </h1>

        <nav class="nav">
          <router-link to="/" class="nav-link">Documents</router-link>
          <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
          <router-link to="/models" class="nav-link">Models</router-link>
        </nav>
      </div>

      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-value">{{ stats.total_documents }}</span>
          <span class="stat-label">Documents</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.total_corrections }}</span>
          <span class="stat-label">Corrections</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ (stats.average_confidence * 100).toFixed(1) }}%</span>
          <span class="stat-label">Avg Confidence</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  props: {
    stats: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
.header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 40px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.logo svg {
  color: #3b82f6;
}

.nav {
  display: flex;
  gap: 8px;
}

.nav-link {
  padding: 8px 16px;
  color: #6b7280;
  text-decoration: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.nav-link.router-link-active {
  background-color: #eff6ff;
  color: #3b82f6;
}

.header-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: 16px;
  }

  .header-left {
    flex-direction: column;
    gap: 16px;
  }

  .header-stats {
    gap: 20px;
  }
}
</style>