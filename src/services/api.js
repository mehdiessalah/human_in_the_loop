// services/api.js - API Service for backend communication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
    // Helper method for making requests
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }
    async triggerTraining() {
        return this.request('/models/train', {
            method: 'POST',
        });
    }
    // Documents
    async uploadDocument(file, documentType = null, autoExtract = true) {
        const formData = new FormData();
        formData.append('file', file);
        if (documentType) {
            formData.append('document_type', documentType);
        }

        const url = autoExtract
            ? `${API_BASE_URL}/documents/upload-and-extract?auto_extract=true`
            : `${API_BASE_URL}/documents/upload-and-extract?auto_extract=false`;

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
        }

        return await response.json();
    }

    async getDocuments(filters = {}) {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.document_type) params.append('document_type', filters.document_type);
        if (filters.limit) params.append('limit', filters.limit);

        return this.request(`/documents?${params.toString()}`);
    }

    async getDocument(documentId) {
        return this.request(`/documents/${documentId}`);
    }

    async updateDocumentStatus(documentId, status) {
        return this.request(`/documents/${documentId}/status?status=${status}`, {
            method: 'PATCH',
        });
    }

    async getDocumentFile(documentId) {
        return this.request(`/documents/${documentId}/file`);
    }

    async extractDocumentFields(documentId) {
        return this.request(`/documents/${documentId}/extract`, {
            method: 'POST',
        });
    }

    // Extraction Fields
    async getExtractionFieldsByDocument(documentId) {
        return this.request(`/extraction-fields/document/${documentId}`);
    }

    async createExtractionField(fieldData) {
        return this.request('/extraction-fields', {
            method: 'POST',
            body: JSON.stringify(fieldData),
        });
    }

    async createExtractionFieldsBulk(fieldsData) {
        return this.request('/extraction-fields/bulk', {
            method: 'POST',
            body: JSON.stringify(fieldsData),
        });
    }

    // Corrections
    async createCorrection(correctionData) {
        // Convert all UUID fields to strings
        const payload = {
            ...correctionData,
            extraction_field_id: String(correctionData.extraction_field_id),
            document_id: String(correctionData.document_id),
            session_id: correctionData.session_id ? String(correctionData.session_id) : null
        };

        return this.request('/corrections', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async getCorrectionsByDocument(documentId) {
        return this.request(`/corrections/document/${documentId}`);
    }

    async getCorrectionsBySession(sessionId) {
        return this.request(`/corrections/session/${sessionId}`);
    }

    async getCorrectionStats() {
        return this.request('/corrections/stats');
    }

    // Sessions
    async createSession(documentId) {
        return this.request('/sessions', {
            method: 'POST',
            body: JSON.stringify({ document_id: String(documentId) }),
        });
    }

    async completeSession(sessionId, data) {
        return this.request(`/sessions/${String(sessionId)}/complete`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async getSession(sessionId) {
        return this.request(`/sessions/${sessionId}`);
    }

    // Model Versions
    async getModelVersions() {
        return this.request('/models');
    }

    async getActiveModel() {
        return this.request('/models/active');
    }

    async createModelVersion(modelData) {
        return this.request('/models', {
            method: 'POST',
            body: JSON.stringify(modelData),
        });
    }

    async activateModel(modelId) {
        return this.request(`/models/${modelId}/activate`, {
            method: 'PATCH',
        });
    }

    // Field Definitions
    async getFieldDefinitions() {
        return this.request('/field-definitions');
    }

    async createFieldDefinition(fieldData) {
        return this.request('/field-definitions', {
            method: 'POST',
            body: JSON.stringify(fieldData),
        });
    }

    // Statistics
    async getDocumentStats() {
        return this.request('/stats/documents');
    }

    async getFieldAccuracy() {
        return this.request('/stats/field-accuracy');
    }

    async getModelImprovement() {
        return this.request('/stats/model-improvement');
    }

    async getOverviewStats() {
        return this.request('/stats/overview');
    }
}

export const apiService = new ApiService();