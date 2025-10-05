<template>
  <div class="kling-gallery-container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-icon">🎨</div>
        <div class="header-text">
          <h1 class="header-title">Kling AI Image Gallery</h1>
          <p class="header-subtitle">Browse and manage your AI-generated images</p>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <div class="stat-number">{{ totalImages }}</div>
            <div class="stat-label">Total Images</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ currentPage }}</div>
            <div class="stat-label">Current Page</div>
          </div>
        </div>
      </div>
    </div>

    <!-- API Configuration Section -->
    <div class="api-config-section">
      <div class="config-card">
        <div class="config-header">
          <h3 class="config-title">🔑 API Configuration & Testing</h3>
          <button @click="toggleConfigExpanded" class="toggle-btn">
            {{ configExpanded ? '▼' : '▶' }}
          </button>
        </div>
        
        <div v-if="configExpanded" class="config-content">
          <div class="config-grid">
            <div class="form-group">
              <label class="form-label">Access Key (AK):</label>
              <input 
                v-model="accessKey" 
                type="text" 
                placeholder="Enter your Access Key"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Secret Key (SK):</label>
              <input 
                v-model="secretKey" 
                type="password" 
                placeholder="Enter your Secret Key"
                class="form-input"
              />
            </div>
          </div>

          <div class="token-section">
            <div class="form-group">
              <label class="form-label">Generated JWT Token:</label>
              <div class="token-wrapper">
                <textarea 
                  v-model="generatedToken" 
                  readonly
                  placeholder="JWT Token will appear here after generation..."
                  class="token-input"
                ></textarea>
                <div class="token-actions">
                  <button @click="generateToken" :disabled="isGeneratingToken" class="btn btn-secondary">
                    <div v-if="!isGeneratingToken" class="btn-content">
                      <span class="btn-icon">🔐</span>
                      <span>Generate Token</span>
                    </div>
                    <div v-else class="btn-content">
                      <div class="loading-spinner"></div>
                      <span>Generating...</span>
                    </div>
                  </button>
                  <button @click="copyToken" :disabled="!generatedToken" class="btn btn-outline">
                    <span class="btn-icon">📋</span>
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="token-info">
              <div class="info-item" :class="{ valid: tokenValid, invalid: tokenValid === false }">
                <span class="info-icon">{{ tokenValid ? '✅' : tokenValid === false ? '❌' : '⏳' }}</span>
                <span class="info-text">
                  {{ tokenValid ? 'Token is valid' : tokenValid === false ? 'Token is invalid or expired' : 'Token not tested yet' }}
                </span>
              </div>
              <div v-if="tokenExpiry" class="info-item">
                <span class="info-icon">⏰</span>
                <span class="info-text">Expires: {{ formatTokenExpiry(tokenExpiry) }}</span>
              </div>
            </div>
          </div>

          <div class="test-section">
            <button @click="testConnection" :disabled="isTestingConnection || !generatedToken" class="btn btn-primary">
              <div v-if="!isTestingConnection" class="btn-content">
                <span class="btn-icon">🧪</span>
                <span>Test API Connection</span>
              </div>
              <div v-else class="btn-content">
                <div class="loading-spinner"></div>
                <span>Testing...</span>
              </div>
            </button>
            
            <div v-if="connectionTestResult" class="test-result" :class="connectionTestResult.success ? 'success' : 'error'">
              <span class="result-icon">{{ connectionTestResult.success ? '✅' : '❌' }}</span>
              <span class="result-text">{{ connectionTestResult.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls Section -->
    <div class="controls-section">
      <div class="controls-card">
        <div class="controls-left">
          <button 
            @click="fetchImages" 
            :disabled="isLoading || !generatedToken"
            class="btn btn-primary"
          >
            <div v-if="!isLoading" class="btn-content">
              <span class="btn-icon">🔄</span>
              <span>Refresh Images</span>
            </div>
            <div v-else class="btn-content loading">
              <div class="loading-spinner"></div>
              <span>Loading...</span>
            </div>
          </button>
          
          <div class="page-size-selector">
            <label class="form-label">Images per page:</label>
            <select v-model="pageSize" @change="onPageSizeChange" class="form-select">
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </div>
        </div>

        <div class="controls-right">
          <div class="view-toggle">
            <button 
              @click="viewMode = 'grid'"
              :class="['view-btn', { active: viewMode === 'grid' }]"
              title="Grid View"
            >
              <span class="view-icon">⊞</span>
            </button>
            <button 
              @click="viewMode = 'list'"
              :class="['view-btn', { active: viewMode === 'list' }]"
              title="List View"
            >
              <span class="view-icon">☰</span>
            </button>
          </div>
          
          <div class="search-box">
            <input 
              v-model="searchQuery" 
              placeholder="🔍 Search images..."
              class="search-input"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && images.length === 0" class="loading-state">
      <div class="loading-content">
        <div class="loading-spinner large"></div>
        <div class="loading-text">Loading Kling AI Images...</div>
        <div class="loading-subtext">Please wait while we fetch your generated images</div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error && !isLoading" class="error-state">
      <div class="error-content">
        <div class="error-icon">❌</div>
        <div class="error-title">Failed to Load Images</div>
        <div class="error-message">{{ error }}</div>
        <button @click="fetchImages" class="btn btn-primary retry-btn">
          <span class="btn-icon">🔄</span>
          <span>Try Again</span>
        </button>
      </div>
    </div>

    <!-- Images Gallery -->
    <div v-if="!isLoading && !error && filteredImages.length > 0" class="gallery-section">
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="images-grid">
        <div 
          v-for="image in paginatedImages" 
          :key="image.id"
          class="image-card"
          @click="openImageModal(image)"
        >
          <div class="image-wrapper">
            <img 
              :src="image.url || image.thumbnail" 
              :alt="image.prompt || 'Generated Image'"
              class="image-thumbnail"
              @error="handleImageError"
              loading="lazy"
            />
            <div class="image-overlay">
              <div class="overlay-content">
                <button class="overlay-btn" title="View Full Size">
                  <span class="btn-icon">🔍</span>
                </button>
                <button class="overlay-btn" @click.stop="downloadImage(image)" title="Download">
                  <span class="btn-icon">💾</span>
                </button>
                <button class="overlay-btn" @click.stop="copyImageUrl(image)" title="Copy URL">
                  <span class="btn-icon">📋</span>
                </button>
              </div>
            </div>
          </div>
          
          <div class="image-info">
            <div class="image-title">{{ image.prompt || 'Untitled' }}</div>
            <div class="image-meta">
              <span class="meta-item">
                <span class="meta-icon">📅</span>
                <span>{{ formatDate(image.createdAt) }}</span>
              </span>
              <span class="meta-item" v-if="image.size">
                <span class="meta-icon">📐</span>
                <span>{{ image.size }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-if="viewMode === 'list'" class="images-list">
        <div 
          v-for="image in paginatedImages" 
          :key="image.id"
          class="image-list-item"
          @click="openImageModal(image)"
        >
          <div class="list-image-wrapper">
            <img 
              :src="image.url || image.thumbnail" 
              :alt="image.prompt || 'Generated Image'"
              class="list-image-thumbnail"
              @error="handleImageError"
              loading="lazy"
            />
          </div>
          
          <div class="list-image-info">
            <div class="list-image-title">{{ image.prompt || 'Untitled Image' }}</div>
            <div class="list-image-meta">
              <span class="list-meta-item">
                <span class="meta-icon">📅</span>
                <span>{{ formatDate(image.createdAt) }}</span>
              </span>
              <span class="list-meta-item" v-if="image.size">
                <span class="meta-icon">📐</span>
                <span>{{ image.size }}</span>
              </span>
              <span class="list-meta-item" v-if="image.status">
                <span class="meta-icon">🎯</span>
                <span class="status-badge" :class="getStatusClass(image.status)">{{ image.status }}</span>
              </span>
            </div>
          </div>
          
          <div class="list-image-actions">
            <button class="action-btn" @click.stop="downloadImage(image)" title="Download">
              <span class="btn-icon">💾</span>
            </button>
            <button class="action-btn" @click.stop="copyImageUrl(image)" title="Copy URL">
              <span class="btn-icon">📋</span>
            </button>
            <button class="action-btn" title="View Details">
              <span class="btn-icon">👁️</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-section">
        <div class="pagination-info">
          Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ filteredImages.length }} images
        </div>
        <div class="pagination-controls">
          <button 
            @click="goToPage(displayCurrentPage - 1)"
            :disabled="displayCurrentPage === 1"
            class="pagination-btn"
          >
            ← Previous
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="['page-btn', { active: page === displayCurrentPage }]"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="goToPage(displayCurrentPage + 1)"
            :disabled="displayCurrentPage === totalPages"
            class="pagination-btn"
          >
            Next →
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && !error && filteredImages.length === 0 && generatedToken" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">🎨</div>
        <div class="empty-title">No Images Found</div>
        <div class="empty-description">
          {{ searchQuery ? 'No images match your search criteria.' : 'No generated images available yet.' }}
        </div>
        <div class="empty-actions" v-if="!searchQuery">
          <button @click="fetchImages" class="btn btn-primary">
            <span class="btn-icon">🔄</span>
            <span>Refresh Gallery</span>
          </button>
        </div>
      </div>
    </div>

    <!-- No Token State -->
    <div v-if="!generatedToken && !isLoading && !error" class="no-token-state">
      <div class="no-token-content">
        <div class="no-token-icon">🔐</div>
        <div class="no-token-title">API Token Required</div>
        <div class="no-token-description">
          Please enter your Access Key and Secret Key above, then generate a JWT token to start fetching images.
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="selectedImage" class="modal-overlay" @click="closeImageModal">
      <div class="image-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title">{{ selectedImage.prompt || 'Generated Image' }}</div>
          <button @click="closeImageModal" class="modal-close-btn">✕</button>
        </div>
        
        <div class="modal-content">
          <div class="modal-image-wrapper">
            <img 
              :src="selectedImage.url || selectedImage.thumbnail" 
              :alt="selectedImage.prompt || 'Generated Image'"
              class="modal-image"
            />
          </div>
          
          <div class="modal-info">
            <div class="info-section">
              <h4 class="info-title">Image Details</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Created:</span>
                  <span class="info-value">{{ formatDate(selectedImage.createdAt) }}</span>
                </div>
                <div class="info-item" v-if="selectedImage.size">
                  <span class="info-label">Size:</span>
                  <span class="info-value">{{ selectedImage.size }}</span>
                </div>
                <div class="info-item" v-if="selectedImage.status">
                  <span class="info-label">Status:</span>
                  <span class="info-value">
                    <span class="status-badge" :class="getStatusClass(selectedImage.status)">
                      {{ selectedImage.status }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            
            <div class="modal-actions">
              <button @click="downloadImage(selectedImage)" class="btn btn-primary">
                <span class="btn-icon">💾</span>
                <span>Download</span>
              </button>
              <button @click="copyImageUrl(selectedImage)" class="btn btn-secondary">
                <span class="btn-icon">📋</span>
                <span>Copy URL</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { SignJWT } from 'jose';

export default {
  name: "KlingImageGallery",
  data() {
    return {
      // API Configuration
      accessKey: "AMyPJe8dEJn4Ff4MnNpReQm3PQyraAAk",
      secretKey: "ApJ3BkpPCBCRd3bPtaty8AgbYYpknfRt",
      baseURL: "https://api-singapore.klingai.com",
      generatedToken: "",
      tokenValid: null,
      tokenExpiry: null,
      isGeneratingToken: false,
      
      // UI State
      configExpanded: true,
      isTestingConnection: false,
      connectionTestResult: null,
      
      // Data
      images: [],
      filteredImages: [],
      selectedImage: null,
      
      // UI State
      isLoading: false,
      error: null,
      viewMode: 'grid', // 'grid' or 'list'
      searchQuery: '',
      
      // Pagination
      currentPage: 1,
      pageSize: 50,
      totalImages: 0,
      
      // Display pagination
      displayPageSize: 20,
      displayCurrentPage: 1
    };
  },

  computed: {
    totalPages() {
      return Math.ceil(this.filteredImages.length / this.displayPageSize);
    },

    startIndex() {
      return (this.displayCurrentPage - 1) * this.displayPageSize;
    },

    endIndex() {
      return Math.min(this.startIndex + this.displayPageSize, this.filteredImages.length);
    },

    paginatedImages() {
      return this.filteredImages.slice(this.startIndex, this.endIndex);
    },

    visiblePages() {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, this.displayCurrentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages, start + maxVisible - 1);
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      return pages;
    }
  },

  mounted() {
    // Auto-generate token if keys are available
    if (this.accessKey && this.secretKey) {
      this.generateToken();
    }
  },

  watch: {
    searchQuery() {
      this.filterImages();
      this.displayCurrentPage = 1;
    },

    accessKey() {
      this.generatedToken = "";
      this.tokenValid = null;
    },

    secretKey() {
      this.generatedToken = "";
      this.tokenValid = null;
    }
  },

  methods: {
    // JWT Token Generation using jose library
    async generateToken() {
      if (!this.accessKey || !this.secretKey) {
        this.showToast('Vui lòng nhập cả Access Key và Secret Key', 'error');
        return;
      }

      this.isGeneratingToken = true;

      try {
        const now = Math.floor(Date.now() / 1000);
        const secret = new TextEncoder().encode(this.secretKey);
        
        // Sử dụng thư viện jose để tạo JWT token
        const jwt = await new SignJWT({
          iss: this.accessKey,
          exp: now + 1800, // 30 phút
          nbf: now - 5     // 5 giây trước
        })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(now)
        .setExpirationTime(now + 1800)
        .setNotBefore(now - 5)
        .sign(secret);
        
        this.generatedToken = jwt;
        this.tokenExpiry = now + 1800;
        this.tokenValid = null; // Reset validation status
        
        this.showToast('JWT Token đã được tạo thành công!', 'success');
        console.log('Generated JWT Token:', this.generatedToken);
      } catch (error) {
        console.error('Lỗi khi tạo token:', error);
        this.showToast('Không thể tạo token: ' + error.message, 'error');
      } finally {
        this.isGeneratingToken = false;
      }
    },

    async copyToken() {
      try {
        await navigator.clipboard.writeText(this.generatedToken);
        this.showToast('Token đã được sao chép vào clipboard!', 'success');
      } catch (error) {
        this.showToast('Không thể sao chép token', 'error');
      }
    },

    toggleConfigExpanded() {
      this.configExpanded = !this.configExpanded;
    },

    formatTokenExpiry(timestamp) {
      return new Date(timestamp * 1000).toLocaleString('vi-VN');
    },

    // API Methods
    async testConnection() {
      if (!this.generatedToken) {
        this.showToast('Vui lòng tạo token trước', 'error');
        return;
      }

      this.isTestingConnection = true;
      this.connectionTestResult = null;

      try {
        const response = await fetch(`${this.baseURL}/v1/images/generations?pageNum=1&pageSize=1`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.generatedToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          this.connectionTestResult = {
            success: true,
            message: `Kết nối API thành công! Status: ${response.status}. ${data.data ? `Tìm thấy ${data.data.total || 0} hình ảnh.` : 'Sẵn sàng tải hình ảnh.'}`
          };
          this.tokenValid = true;
        } else {
          const errorData = await response.json().catch(() => ({}));
          this.connectionTestResult = {
            success: false,
            message: `Lỗi API: ${response.status} - ${errorData.message || response.statusText}`
          };
          this.tokenValid = false;
        }
      } catch (error) {
        this.connectionTestResult = {
          success: false,
          message: `Kết nối thất bại: ${error.message}`
        };
        this.tokenValid = false;
      } finally {
        this.isTestingConnection = false;
      }
    },

    async fetchImages() {
      if (!this.generatedToken) {
        this.showToast('Vui lòng tạo JWT token trước', 'error');
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const response = await fetch(
          `${this.baseURL}/v1/images/generations?pageNum=${this.currentPage}&pageSize=${this.pageSize}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.generatedToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Lỗi API: ${response.status} - ${errorData.message || response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        if (data.code === 0 || data.success !== false) {
          this.images = this.processImageData(data.data?.items || data.data || data.results || []);
          this.totalImages = data.data?.total || data.total || this.images.length;
          this.filterImages();
          this.tokenValid = true;
          this.showToast(`Đã tải ${this.images.length} hình ảnh thành công!`, 'success');
        } else {
          throw new Error(data.message || 'Không thể tải hình ảnh');
        }

      } catch (error) {
        console.error('Lỗi khi tải hình ảnh:', error);
        this.error = error.message;
        this.tokenValid = false;
        this.showToast('Không thể tải hình ảnh: ' + error.message, 'error');
      } finally {
        this.isLoading = false;
      }
    },

    processImageData(rawImages) {
      return rawImages.map((item, index) => {
        // Handle different possible API response structures
        return {
          id: item.id || item.task_id || `image_${index}`,
          url: item.url || item.image_url || item.result_url || item.output_url,
          thumbnail: item.thumbnail || item.thumb_url || item.url || item.image_url,
          prompt: item.prompt || item.description || item.text || item.input_text,
          createdAt: item.created_at || item.create_time || item.timestamp || new Date().toISOString(),
          status: item.status || 'completed',
          size: item.size || item.resolution || this.getImageSize(item),
          taskId: item.task_id || item.id
        };
      });
    },

    getImageSize(item) {
      if (item.width && item.height) {
        return `${item.width}x${item.height}`;
      }
      if (item.resolution) {
        return item.resolution;
      }
      return null;
    },

    filterImages() {
      if (!this.searchQuery.trim()) {
        this.filteredImages = [...this.images];
      } else {
        const query = this.searchQuery.toLowerCase();
        this.filteredImages = this.images.filter(image => 
          (image.prompt && image.prompt.toLowerCase().includes(query)) ||
          (image.status && image.status.toLowerCase().includes(query))
        );
      }
    },

    onPageSizeChange() {
      this.currentPage = 1;
      this.fetchImages();
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.displayCurrentPage = page;
      }
    },

    openImageModal(image) {
      this.selectedImage = image;
      document.body.style.overflow = 'hidden';
    },

    closeImageModal() {
      this.selectedImage = null;
      document.body.style.overflow = 'auto';
    },

    async downloadImage(image) {
      try {
        const response = await fetch(image.url || image.thumbnail);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `kling_image_${image.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        window.URL.revokeObjectURL(url);
        this.showToast('Hình ảnh đã được tải xuống thành công!', 'success');
      } catch (error) {
        console.error('Lỗi tải xuống:', error);
        this.showToast('Không thể tải xuống hình ảnh', 'error');
      }
    },

    async copyImageUrl(image) {
      try {
        await navigator.clipboard.writeText(image.url || image.thumbnail);
        this.showToast('URL hình ảnh đã được sao chép vào clipboard!', 'success');
      } catch (error) {
        console.error('Lỗi sao chép:', error);
        this.showToast('Không thể sao chép URL', 'error');
      }
    },

    handleImageError(event) {
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
    },

    formatDate(dateString) {
      if (!dateString) return 'Không rõ';
      try {
        return new Date(dateString).toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return 'Ngày không hợp lệ';
      }
    },

    getStatusClass(status) {
      switch (status?.toLowerCase()) {
        case 'completed':
        case 'success':
          return 'status-success';
        case 'processing':
        case 'pending':
          return 'status-processing';
        case 'failed':
        case 'error':
          return 'status-error';
        default:
          return 'status-default';
      }
    },

    showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4facfe'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
      `;
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }
  }
};
</script>

<style scoped>
.kling-gallery-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header Section */
.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.header-icon {
  font-size: 32px;
  background: rgba(255, 255, 255, 0.2);
  padding: 12px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.header-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
}

.header-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
  text-transform: uppercase;
  font-weight: 500;
}

/* API Configuration Section */
.api-config-section {
  margin-bottom: 24px;
}

.config-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #4facfe;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.config-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #4a5568;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.3s;
}

.toggle-btn:hover {
  background: #f7fafc;
}

.config-content {
  padding: 24px;
}

.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.token-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.token-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.token-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', monospace;
  background: white;
  resize: vertical;
  min-height: 80px;
  max-height: 120px;
}

.token-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.token-info {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.info-item.valid {
  color: #22543d;
}

.info-item.invalid {
  color: #742a2a;
}

.info-icon {
  font-size: 16px;
}

.info-text {
  font-weight: 500;
}

.test-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.test-result {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.test-result.success {
  background: #c6f6d5;
  color: #22543d;
}

.test-result.error {
  background: #fed7d7;
  color: #742a2a;
}

.result-icon {
  font-size: 16px;
}

/* Controls Section */
.controls-section {
  margin-bottom: 24px;
}

.controls-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.controls-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.controls-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-select {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.view-toggle {
  display: flex;
  background: #f7fafc;
  border-radius: 8px;
  padding: 4px;
}

.view-btn {
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.view-btn.active {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.view-icon {
  font-size: 16px;
}

.search-box {
  position: relative;
}

.search-input {
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  min-width: 250px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #a8a8a8 0%, #8c8c8c 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(168, 168, 168, 0.3);
}

.btn-outline {
  background: transparent;
  border: 2px solid #e2e8f0;
  color: #4a5568;
}

.btn-outline:hover:not(:disabled) {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon {
  font-size: 16px;
}

/* Loading States */
.loading-state {
  background: white;
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.loading-content {
  max-width: 400px;
  margin: 0 auto;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4facfe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.large {
  width: 48px;
  height: 48px;
  border-width: 4px;
  margin-bottom: 20px;
}

.loading-text {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.loading-subtext {
  font-size: 14px;
  color: #718096;
}

/* Error State */
.error-state {
  background: white;
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.error-content {
  max-width: 400px;
  margin: 0 auto;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.error-title {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
}

.error-message {
  font-size: 16px;
  color: #718096;
  margin-bottom: 24px;
  line-height: 1.6;
}

.retry-btn {
  margin-top: 16px;
}

/* No Token State */
.no-token-state {
  background: white;
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.no-token-content {
  max-width: 400px;
  margin: 0 auto;
}

.no-token-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.no-token-title {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
}

.no-token-description {
  font-size: 16px;
  color: #718096;
  line-height: 1.6;
}

/* Images Grid */
.gallery-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.image-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
}

.image-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.image-wrapper {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.image-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.image-card:hover .image-thumbnail {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.overlay-content {
  display: flex;
  gap: 12px;
}

.overlay-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.overlay-btn:hover {
  background: white;
  transform: scale(1.1);
}

.image-info {
  padding: 16px;
}

.image-title {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.image-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #718096;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  font-size: 12px;
}

/* Images List */
.images-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.image-list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.image-list-item:hover {
  background: #edf2f7;
  transform: translateX(4px);
}

.list-image-wrapper {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.list-image-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.list-image-info {
  flex: 1;
  min-width: 0;
}

.list-image-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
  line-height: 1.4;
}

.list-image-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: #718096;
}

.list-meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.list-image-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

/* Status Badges */
.status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-success {
  background: #c6f6d5;
  color: #22543d;
}

.status-processing {
  background: #fed7d7;
  color: #742a2a;
}

.status-error {
  background: #fed7d7;
  color: #742a2a;
}

.status-default {
  background: #e2e8f0;
  color: #4a5568;
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.pagination-info {
  font-size: 14px;
  color: #718096;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 40px;
  text-align: center;
}

.page-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.page-btn.active {
  background: #4facfe;
  color: white;
  border-color: #4facfe;
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
}

.empty-description {
  font-size: 16px;
  color: #718096;
  line-height: 1.6;
  margin-bottom: 24px;
}

.empty-actions {
  display: flex;
  justify-content: center;
}

/* Image Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.image-modal {
  background: white;
  border-radius: 16px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.3s;
}

.modal-close-btn:hover {
  background: #f7fafc;
}

.modal-content {
  display: flex;
  max-height: calc(90vh - 80px);
}

.modal-image-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  min-height: 400px;
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.modal-info {
  width: 300px;
  padding: 24px;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section {
  flex: 1;
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 16px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: #718096;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #2d3748;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .header-stats {
    justify-content: center;
  }

  .config-grid {
    grid-template-columns: 1fr;
  }

  .controls-card {
    flex-direction: column;
    gap: 16px;
  }

  .controls-left,
  .controls-right {
    width: 100%;
    justify-content: center;
  }

  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  .modal-content {
    flex-direction: column;
  }

  .modal-info {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .kling-gallery-container {
    padding: 16px;
  }

  .header-section {
    padding: 20px;
  }

  .config-content {
    padding: 20px;
  }

  .token-wrapper {
    flex-direction: column;
  }

  .token-actions {
    flex-direction: row;
  }

  .controls-card {
    padding: 16px;
  }

  .controls-left,
  .controls-right {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    min-width: auto;
    width: 100%;
  }

  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .image-list-item {
    flex-direction: column;
    text-align: center;
  }

  .list-image-wrapper {
    width: 120px;
    height: 120px;
  }

  .pagination-section {
    flex-direction: column;
    gap: 16px;
  }

  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }

  .modal-overlay {
    padding: 10px;
  }

  .image-modal {
    max-width: 95vw;
    max-height: 95vh;
  }

  .test-section {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}
</style>