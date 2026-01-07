<template>
  <div class="annotation-page">
    <div v-if="loading" class="spinner"></div>

    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <div v-else class="annotation-container">
      <!-- Header -->
      <div class="annotation-header">
        <button class="btn btn-secondary" @click="goBack">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back to Documents
        </button>

        <div class="header-info">
          <h2>{{ document.filename }}</h2>
          <span :class="`badge badge-${document.status}`">
            {{ formatStatus(document.status) }}
          </span>
        </div>

        <div class="header-actions">
          <button
              class="btn btn-success"
              @click="completeAnnotation"
              :disabled="!hasChanges"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Complete & Save
          </button>
        </div>
      </div>

      <!-- Main Content: Split View -->
      <div class="split-view">
        <!-- Left: Document Image -->
        <div class="document-viewer">
          <div class="viewer-header">
            <h3>Document</h3>
            <div class="zoom-controls">
              <button class="btn-icon" @click="zoomOut" title="Zoom Out">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                  <path d="M8 11H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
              <button class="btn-icon" @click="zoomIn" title="Zoom In">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                  <path d="M11 8V14M8 11H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              <button class="btn-icon" @click="resetZoom" title="Reset">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20V20H4V4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="image-container" ref="imageContainer">
            <div class="image-wrapper" :style="{ transform: `scale(${zoom})` }">
              <img
                  :src="documentImageUrl"
                  alt="Document"
                  class="document-image"
                  @load="onImageLoad"
              />

              <!-- Bounding boxes overlay -->
              <div
                  v-for="field in extractedFields"
                  :key="field.id"
                  class="bounding-box"
                  :class="{
                  'active': selectedFieldId === field.id,
                  'corrected': fieldCorrections[field.id]
                }"
                  :style="getBoundingBoxStyle(field.bounding_box)"
                  @click="selectField(field.id)"
              >
                <span class="field-label">{{ field.field_name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Extraction Fields -->
        <div class="fields-editor">
          <div class="editor-header">
            <h3>Extracted Fields</h3>
            <div class="stats">
              <span class="stat">
                {{ corrections }} correction{{ corrections !== 1 ? 's' : '' }}
              </span>
              <span class="stat">
                {{ validations }} validation{{ validations !== 1 ? 's' : '' }}
              </span>
            </div>
          </div>

          <div class="fields-list">
            <div
                v-for="field in extractedFields"
                :key="field.id"
                class="field-item"
                :class="{
    'selected': selectedFieldId === field.id,
    'corrected': fieldCorrections[field.id],
    'validated': validatedFields[field.id]
  }"
            >
              <div class="field-header" @click="selectField(field.id)">
                <div class="field-title">
                  <span class="field-name">{{ formatFieldName(field.field_name) }}</span>
                  <span class="confidence" :class="getConfidenceClass(field.ai_confidence)">
                    {{ Math.round(field.ai_confidence * 100) }}% ({{ field.ai_confidence }})
                  </span>
                </div>

                <div v-if="fieldCorrections[field.id]" class="correction-indicator">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Corrected
                </div>
                <div v-else-if="validatedFields[field.id]" class="validation-indicator">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Validated
                </div>
              </div>

              <div class="field-content">
                <div class="original-value">
                  <label class="field-label-small">AI Extracted:</label>
                  <div class="value-display">{{ field.ai_extracted_value || '(empty)' }}</div>
                </div>

                <div class="correction-input">
                  <label class="field-label-small">
                    Corrected Value:
                    <span v-if="fieldCorrections[field.id]" class="required-indicator">*</span>
                  </label>
                  <input
                      type="text"
                      class="form-input"
                      :value="getCorrectedValue(field.id) || field.ai_extracted_value"
                      @input="onFieldEdit(field.id, $event.target.value, field.ai_extracted_value, field.ai_confidence)"
                      :placeholder="field.field_type === 'date' ? 'YYYY-MM-DD' : 'Enter value'"
                  />
                </div>

                <div class="field-actions">
                  <button
                      class="btn-small btn-success"
                      @click="validateField(field.id, field.ai_extracted_value)"
                      :disabled="fieldCorrections[field.id]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Validate
                  </button>

                  <button
                      v-if="fieldCorrections[field.id]"
                      class="btn-small btn-secondary"
                      @click="undoCorrection(field.id)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 7V3M3 3H7M3 3L7.5 7.5C9.5 9.5 11 10.5 13.5 10.5C16 10.5 17.5 9.5 19 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Undo
                  </button>
                </div>

                <div v-if="selectedFieldId === field.id" class="field-notes">
                  <label class="field-label-small">Notes (optional):</label>
                  <textarea
                      class="form-textarea"
                      v-model="fieldNotes[field.id]"
                      placeholder="Add any notes about this correction..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div v-if="extractedFields.length === 0" class="empty-fields">
              <p>No fields extracted yet</p>
              <button class="btn btn-primary" @click="extractFields">
                Extract Fields
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Timer Display -->
      <div class="timer-display">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Time: {{ formatTime(sessionTime) }}
      </div>
      <!-- Toast Notification -->
      <div v-if="toast.show" class="toast" :class="`toast-${toast.type}`">
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { apiService } from '../services/api';

export default {
  name: 'DocumentAnnotation',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const toast = ref({ show: false, message: '', type: '' });

    const showToast = (message, type = 'success') => {
      toast.value = { show: true, message, type };
      setTimeout(() => {
        toast.value.show = false;
      }, 2000);
    };
    const document = ref({});
    const extractedFields = ref([]);
    const corrections = ref(0);
    const validations = ref(0);
    const loading = ref(true);
    const error = ref(null);

    const documentImageUrl = ref('');
    const zoom = ref(1);
    const selectedFieldId = ref(null);

    const fieldCorrections = ref({});
    const fieldNotes = ref({});

    const sessionId = ref(null);
    const sessionStartTime = ref(Date.now());
    const sessionTime = ref(0);
    let timerInterval = null;

    const hasChanges = computed(() => {
      return corrections.value.length > 0 || validations.value > 0;
    });

    const loadDocument = async () => {
      try {
        const documentId = route.params.id;

        // Load document
        const doc = await apiService.getDocument(documentId);
        document.value = doc;

        // Load document image
        const fileData = await apiService.getDocumentFile(documentId);
        documentImageUrl.value = fileData.url;

        // Load extracted fields
        const fields = await apiService.getExtractionFieldsByDocument(documentId);
        extractedFields.value = fields;

        // Create session
        const session = await apiService.createSession(documentId);
        sessionId.value = session.id;

        loading.value = false;
      } catch (err) {
        error.value = err.message;
        loading.value = false;
      }
    };

    const extractFields = async () => {
      try {
        loading.value = true;
        await apiService.extractDocumentFields(route.params.id);
        await loadDocument();
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const onFieldEdit = (fieldId, newValue, originalValue, confidence) => {
      if (newValue !== originalValue && newValue.trim() !== '') {
        fieldCorrections.value[fieldId] = {
          original: originalValue,
          corrected: newValue,
          confidence: confidence
        };

        // Update corrections count
        corrections.value = Object.keys(fieldCorrections.value).length;

        // Visual feedback
        console.log(`Field ${fieldId} corrected: "${originalValue}" → "${newValue}"`);

        // Show toast notification
        showToast('Field corrected ✏️', 'success');
      } else {
        delete fieldCorrections.value[fieldId];
        corrections.value = Object.keys(fieldCorrections.value).length;
      }
    };

    const validatedFields = ref({});

    const validateField = (fieldId, value) => {
      validations.value++;
      validatedFields.value[fieldId] = true;

      // Visual feedback
      console.log(`Field ${fieldId} validated`);

      // Show toast notification
      showToast('Field validated ✓', 'success');
    };

    const undoCorrection = (fieldId) => {
      delete fieldCorrections.value[fieldId];
      delete fieldNotes.value[fieldId];
    };

    const getCorrectedValue = (fieldId) => {
      return fieldCorrections.value[fieldId]?.corrected;
    };

    const selectField = (fieldId) => {
      selectedFieldId.value = fieldId;
    };

    const completeAnnotation = async () => {
      try {
        console.log('Starting save process...');
        console.log('Corrections:', fieldCorrections.value);
        console.log('Validations:', validations.value);

        // Save all corrections
        const correctionPromises = Object.entries(fieldCorrections.value).map(([fieldId, correction]) => {
          console.log('Saving correction for field:', fieldId);

          return apiService.createCorrection({
            extraction_field_id: String(fieldId),
            document_id: String(document.value.id),
            original_value: correction.original || null,
            corrected_value: correction.corrected,
            correction_type: 'correction',
            time_spent_seconds: Math.floor(sessionTime.value / 1000),
            confidence_before: correction.confidence,
            notes: fieldNotes.value[fieldId] || null,
            session_id: String(sessionId.value)
          });
        });

        if (correctionPromises.length > 0) {
          await Promise.all(correctionPromises);
          console.log('All corrections saved');
        }

        // Complete session
        console.log('Completing session...');
        const sessionData = {
          total_corrections: Object.keys(fieldCorrections.value).length,
          total_validations: validations.value,
          session_duration_seconds: Math.floor(sessionTime.value / 1000)
        };
        console.log('Session data:', sessionData);

        await apiService.completeSession(String(sessionId.value), sessionData);
        console.log('Session completed');

        // Update document status
        console.log('Updating document status...');
        await apiService.updateDocumentStatus(document.value.id, 'completed');
        console.log('Document status updated');

        alert('Annotations saved successfully!');
        router.push('/');
      } catch (err) {
        console.error('Save error:', err);
        alert(`Failed to save annotations: ${err.message}`);
      }
    };

    const goBack = () => {
      if (hasChanges.value) {
        if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    };

    const imageContainer = ref(null);
    const imageWidth = ref(0);
    const imageHeight = ref(0);
    const naturalImageWidth = ref(0);
    const naturalImageHeight = ref(0);

    const getBoundingBoxStyle = (bbox) => {
      if (!bbox || !imageWidth.value || !naturalImageWidth.value) return {};

      // Calculate scale factor between natural and displayed image
      const scaleX = imageWidth.value / naturalImageWidth.value;
      const scaleY = imageHeight.value / naturalImageHeight.value;

      // Coordinates are in natural pixels, scale to display size
      return {
        left: `${bbox.x * scaleX}px`,
        top: `${bbox.y * scaleY}px`,
        width: `${bbox.width * scaleX}px`,
        height: `${bbox.height * scaleY}px`,
        position: 'absolute'
      };
    };

    const formatFieldName = (name) => {
      return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatStatus = (status) => {
      return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getConfidenceClass = (confidence) => {
      if (confidence >= 0.9) return 'high';
      if (confidence >= 0.7) return 'medium';
      return 'low';
    };

    const formatTime = (ms) => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (hours > 0) {
        return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
      }
      return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
    };

    const zoomIn = () => {
      zoom.value = Math.min(zoom.value + 0.1, 3);
    };

    const zoomOut = () => {
      zoom.value = Math.max(zoom.value - 0.1, 0.5);
    };

    const resetZoom = () => {
      zoom.value = 1;
    };

    const onImageLoad = (event) => {
      console.log('Image loaded successfully');
      // Get natural (original) image dimensions
      naturalImageWidth.value = event.target.naturalWidth;
      naturalImageHeight.value = event.target.naturalHeight;
      // Get displayed dimensions
      imageWidth.value = event.target.clientWidth;
      imageHeight.value = event.target.clientHeight;

      console.log(`Natural size: ${naturalImageWidth.value}x${naturalImageHeight.value}`);
      console.log(`Display size: ${imageWidth.value}x${imageHeight.value}`);
    };

    onMounted(() => {
      loadDocument();

      // Start timer
      timerInterval = setInterval(() => {
        sessionTime.value = Date.now() - sessionStartTime.value;
      }, 1000);
    });

    onUnmounted(() => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    });

    return {
      document,
      extractedFields,
      corrections,
      validations,
      validatedFields,
      toast,
      showToast,
      loading,
      error,
      documentImageUrl,
      zoom,
      selectedFieldId,
      fieldCorrections,
      fieldNotes,
      sessionTime,
      hasChanges,
      extractFields,
      onFieldEdit,
      validateField,
      undoCorrection,
      getCorrectedValue,
      selectField,
      completeAnnotation,
      goBack,
      getBoundingBoxStyle,
      formatFieldName,
      formatStatus,
      getConfidenceClass,
      formatTime,
      zoomIn,
      zoomOut,
      resetZoom,
      onImageLoad
    };
  }
};
</script>

<style scoped>
.annotation-page {
  height: calc(100vh - 100px);
}

.annotation-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.annotation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.header-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0 20px;
}

.header-info h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.split-view {
  display: grid;
  grid-template-columns: 1fr 500px;
  gap: 20px;
  flex: 1;
  overflow: hidden;
}

.document-viewer,
.fields-editor {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.viewer-header,
.editor-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.viewer-header h3,
.editor-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.zoom-level {
  font-size: 14px;
  color: #6b7280;
  min-width: 50px;
  text-align: center;
}

.image-container {
  flex: 1;
  overflow: auto;
  background: #f9fafb;
  position: relative;
}

.image-wrapper {
  position: relative;
  display: inline-block;
  min-width: 100%;
  min-height: 100%;
  transform-origin: top left;
  transition: transform 0.2s;
}

.document-image {
  display: block;
  max-width: 100%;
  height: auto;
}

.bounding-box {
  position: absolute;
  border: 2px solid #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  pointer-events: auto;
}

.bounding-box:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: #2563eb;
}

.bounding-box.active {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.2);
  border-width: 3px;
}

.bounding-box.corrected {
  border-color: #f59e0b;
}

.field-label {
  position: absolute;
  top: -20px;
  left: 0;
  background: #3b82f6;
  color: white;
  padding: 2px 6px;
  font-size: 11px;
  border-radius: 3px;
  white-space: nowrap;
}

.stats {
  display: flex;
  gap: 16px;
}

.stat {
  font-size: 13px;
  color: #6b7280;
}

.fields-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.field-item {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s;
}

.field-item:hover {
  border-color: #d1d5db;
}

.field-item.selected {
  border-color: #10b981;
  background: #f0fdf4;
}

.field-item.corrected {
  border-color: #f59e0b;
}

.field-header {
  cursor: pointer;
  margin-bottom: 12px;
}

.field-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.field-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.confidence {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
}

.confidence.high {
  background: #d1fae5;
  color: #065f46;
}

.confidence.medium {
  background: #fef3c7;
  color: #92400e;
}

.confidence.low {
  background: #fee2e2;
  color: #991b1b;
}

.correction-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #f59e0b;
  font-weight: 500;
}

.field-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.original-value {
  padding: 10px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.field-label-small {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.value-display {
  font-size: 14px;
  color: #1f2937;
}

.correction-input {
  display: flex;
  flex-direction: column;
}

.required-indicator {
  color: #ef4444;
}

.field-actions {
  display: flex;
  gap: 8px;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.field-notes {
  margin-top: 8px;
}

.empty-fields {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.timer-display {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1f2937;
}

.timer-display svg {
  color: #3b82f6;
}

.field-item.validated {
  border-color: #10b981;
  background: #f0fdf4;
}

.validation-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #10b981;
  font-weight: 500;
}

.toast {
  position: fixed;
  top: 80px;
  right: 20px;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.toast-success {
  background: #10b981;
  color: white;
}

.toast-error {
  background: #ef4444;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>