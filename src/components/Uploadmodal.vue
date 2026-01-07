<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal">
      <div class="modal-header">
        <h3>Upload Document</h3>
        <button class="close-btn" @click="close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="uploading" class="upload-progress">
          <div class="spinner"></div>
          <p>Uploading {{ uploadProgress }} of {{ totalFiles }} files...</p>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" :style="{ width: (uploadProgress / totalFiles * 100) + '%' }"></div>
          </div>
          <p class="progress-text">Extracting fields from each document...</p>
        </div>

        <form v-else @submit.prevent="handleUpload">
          <!-- File Upload Area -->
          <div
              class="file-drop-area"
              :class="{ 'dragging': isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              @click="triggerFileInput"
          >
            <input
                type="file"
                ref="fileInput"
                @change="handleFileSelect"
                accept="image/*,.pdf"
                multiple
                style="display: none;"
            />

            <div v-if="selectedFiles.length === 0" class="drop-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4V20M12 4L8 8M12 4L16 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <p class="drop-text">Drag & drop documents here</p>
              <p class="drop-subtext">or click to browse (multiple files supported)</p>
              <p class="file-types">Supports: JPG, PNG, PDF</p>
            </div>

            <div v-else class="files-preview-list">
              <div class="files-header">
                <span>{{ selectedFiles.length }} file{{ selectedFiles.length !== 1 ? 's' : '' }} selected</span>
                <button type="button" class="btn-text" @click.stop="removeAllFiles">
                  Clear All
                </button>
              </div>
              <div
                  v-for="(file, index) in selectedFiles"
                  :key="index"
                  class="file-preview"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="file-info">
                  <p class="filename">{{ file.name }}</p>
                  <p class="filesize">{{ formatFileSize(file.size) }}</p>
                </div>
                <button type="button" class="remove-file" @click.stop="removeFile(index)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Document Type -->
          <div class="form-group">
            <label class="form-label">Document Type</label>
            <select v-model="documentType" class="form-select">
              <option value="">Select type...</option>
              <option value="invoice">Invoice</option>
              <option value="receipt">Receipt</option>
              <option value="form">Form</option>
              <option value="contract">Contract</option>
              <option value="other">Other</option>
            </select>
          </div>

          <!-- Auto Extract -->
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="autoExtract" />
              <span>Automatically extract fields after upload</span>
            </label>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="alert alert-error">
            {{ error }}
          </div>

          <!-- Actions -->
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="close">
              Cancel
            </button>
            <button
                type="submit"
                class="btn btn-primary"
                :disabled="selectedFiles.length === 0 || uploading"
            >
              Upload {{ selectedFiles.length > 0 ? `(${selectedFiles.length})` : '' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { apiService } from '../services/api';

export default {
  name: 'UploadModal',
  emits: ['close', 'uploaded'],
  setup(props, { emit }) {
    const fileInput = ref(null);
    const selectedFiles = ref([]);
    const documentType = ref('');
    const autoExtract = ref(true);
    const isDragging = ref(false);
    const uploading = ref(false);
    const error = ref(null);

    const triggerFileInput = () => {
      fileInput.value?.click();
    };

    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files);
      if (files.length > 0) {
        selectedFiles.value = files;
      }
    };

    const handleDrop = (event) => {
      isDragging.value = false;
      const files = Array.from(event.dataTransfer.files);
      if (files.length > 0) {
        selectedFiles.value = files;
      }
    };

    const removeFile = (index) => {
      selectedFiles.value.splice(index, 1);
      if (selectedFiles.value.length === 0 && fileInput.value) {
        fileInput.value.value = '';
      }
    };

    const removeAllFiles = () => {
      selectedFiles.value = [];
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const uploadProgress = ref(0);
    const totalFiles = ref(0);

    const handleUpload = async () => {
      if (selectedFiles.value.length === 0) return;

      uploading.value = true;
      error.value = null;
      uploadProgress.value = 0;
      totalFiles.value = selectedFiles.value.length;

      try {
        let successCount = 0;

        for (let i = 0; i < selectedFiles.value.length; i++) {
          try {
            await apiService.uploadDocument(
                selectedFiles.value[i],
                documentType.value,
                autoExtract.value
            );
            successCount++;
            uploadProgress.value = i + 1;
          } catch (err) {
            console.error(`Failed to upload ${selectedFiles.value[i].name}:`, err);
          }
        }

        if (successCount === selectedFiles.value.length) {
          emit('uploaded');
        } else {
          error.value = `Uploaded ${successCount} of ${selectedFiles.value.length} files successfully`;
          // Still emit uploaded to refresh the list
          setTimeout(() => emit('uploaded'), 2000);
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        uploading.value = false;
      }
    };

    const close = () => {
      if (!uploading.value) {
        emit('close');
      }
    };

    return {
      fileInput,
      selectedFiles,
      documentType,
      autoExtract,
      isDragging,
      uploading,
      uploadProgress,
      totalFiles,
      error,
      triggerFileInput,
      handleFileSelect,
      handleDrop,
      removeFile,
      removeAllFiles,
      formatFileSize,
      handleUpload,
      close
    };
  }
};
</script>

<style scoped>
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
  max-width: 500px;
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

.upload-progress {
  text-align: center;
  padding: 40px 20px;
}

.upload-progress p {
  margin-top: 20px;
  color: #6b7280;
}

.file-drop-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
}

.file-drop-area:hover {
  border-color: #3b82f6;
  background: #f9fafb;
}

.file-drop-area.dragging {
  border-color: #3b82f6;
  background: #eff6ff;
}

.drop-placeholder svg {
  color: #9ca3af;
  margin-bottom: 16px;
}

.drop-text {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.drop-subtext {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
}

.file-types {
  font-size: 12px;
  color: #9ca3af;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.file-preview svg {
  color: #3b82f6;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  text-align: left;
}

.filename {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.filesize {
  font-size: 12px;
  color: #6b7280;
}

.remove-file {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: #6b7280;
  border-radius: 4px;
  transition: all 0.2s;
}

.remove-file:hover {
  background: #fee2e2;
  color: #ef4444;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.files-preview-list {
  max-height: 300px;
  overflow-y: auto;
}

.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
}

.btn-text {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-text:hover {
  background: #eff6ff;
}

.file-preview {
  margin-bottom: 8px;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin: 12px 0;
}

.progress-bar-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s;
}

.progress-text {
  font-size: 13px;
  color: #6b7280;
  margin-top: 8px;
}
</style>