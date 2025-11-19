class ImageConverter {
    constructor() {
        this.files = [];
        this.quality = 0.8;
        this.conversionMode = 'webp';
        this.targetWidth = 1920;
        this.targetHeight = 1080;
        this.maintainAspectRatio = true;
        this.isConverting = false;
        this.totalOriginalSize = 0;
        this.totalConvertedSize = 0;
        this.renamePrefix = '';
        this.preserveExif = false;
        this.history = this.loadHistory();
        this.urlList = [];
        this.presets = this.loadPresets();
        
        // Individual file transformations
        this.fileTransforms = new Map();
        
        // PageSpeed properties with YOUR API key
        this.pagespeedStrategy = 'mobile';
        this.pagespeedApiKey = 'AIzaSyAnhmyxMHIsJdvyka_SgD4KHltFL9g7WPg';
        
        this.initializeElements();
        this.bindEvents();
        this.renderHistory();
        this.renderPresets();
        this.updateSidebarStats();
        this.initializeNotifications();
    }

    initializeElements() {
        // Main elements
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.qualityControl = document.getElementById('qualityControl');
        this.qualitySlider = document.getElementById('qualitySlider');
        this.qualityValue = document.getElementById('qualityValue');
        this.conversionModeInfo = document.getElementById('conversionModeInfo');
        this.actionButtons = document.getElementById('actionButtons');
        this.convertBtn = document.getElementById('convertBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.downloadAllBtn = document.getElementById('downloadAllBtn');
        this.progressSection = document.getElementById('progressSection');
        this.progressText = document.getElementById('progressText');
        this.progressBarFill = document.getElementById('progressBarFill');
        this.currentFileInfo = document.getElementById('currentFileInfo');
        this.statsGrid = document.getElementById('statsGrid');
        this.fileList = document.getElementById('fileList');
        this.bulkActions = document.getElementById('bulkActions');
        
        // Stats elements
        this.totalFilesEl = document.getElementById('totalFiles');
        this.completedFilesEl = document.getElementById('completedFiles');
        this.remainingFilesEl = document.getElementById('remainingFiles');
        this.totalSavingsEl = document.getElementById('totalSavings');
        
        // Conversion mode radio buttons
        this.modeWebpOnly = document.getElementById('modeWebpOnly');
        this.modeResizeOnly = document.getElementById('modeResizeOnly');
        this.modeBoth = document.getElementById('modeBoth');
        
        // Quality and resize sections
        this.qualitySection = document.getElementById('qualitySection');
        this.resizeSection = document.getElementById('resizeSection');
        
        // Dimension controls
        this.widthInput = document.getElementById('widthInput');
        this.heightInput = document.getElementById('heightInput');
        this.aspectRatioBtn = document.getElementById('aspectRatioBtn');
        this.dimensionHint = document.getElementById('dimensionHint');
        
        // Rename & EXIF
        this.renameInput = document.getElementById('renamePrefix');
        this.renamePreview = document.getElementById('renamePreview');
        this.preserveExifToggle = document.getElementById('preserveExif');
        
        // Bulk action buttons
        this.sortBySizeBtn = document.getElementById('sortBySizeBtn');
        this.sortBySavingsBtn = document.getElementById('sortBySavingsBtn');
        this.removeFailedBtn = document.getElementById('removeFailedBtn');
        this.reconvertFailedBtn = document.getElementById('reconvertFailedBtn');
        this.duplicateDetectorBtn = document.getElementById('duplicateDetectorBtn');
        
        // Sidebar elements
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.sidebarClose = document.getElementById('sidebarClose');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.navItems = document.querySelectorAll('.nav-item');
        this.contentSections = document.querySelectorAll('.content-section');
        this.sidebarTotalConversions = document.getElementById('sidebarTotalConversions');
        this.sidebarSpaceSaved = document.getElementById('sidebarSpaceSaved');
        
        // URL upload elements
        this.toggleUrlUploadBtn = document.getElementById('toggleUrlUpload');
        this.urlUploadSection = document.getElementById('urlUploadSection');
        this.urlInput = document.getElementById('urlInput');
        this.urlAddBtn = document.getElementById('urlAddBtn');
        this.urlListEl = document.getElementById('urlList');
        
        // History elements
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        
        // Statistics elements
        this.statTotalConversions = document.getElementById('statTotalConversions');
        this.statTotalSaved = document.getElementById('statTotalSaved');
        this.statAvgSavings = document.getElementById('statAvgSavings');
        this.statTotalFiles = document.getElementById('statTotalFiles');
        
        // Live Preview Panel
        this.livePreviewPanel = document.getElementById('livePreviewPanel');
        this.previewPanelContent = document.getElementById('previewPanelContent');
        this.previewToggle = document.getElementById('previewToggle');
        this.reopenPreviewBtn = document.getElementById('reopenPreviewBtn');
        
        // Preset elements
        this.savePresetBtn = document.getElementById('savePresetBtn');
        this.presetModal = document.getElementById('presetModal');
        this.closePresetModal = document.getElementById('closePresetModal');
        this.presetNameInput = document.getElementById('presetNameInput');
        this.confirmSavePreset = document.getElementById('confirmSavePreset');
        this.presetsGrid = document.getElementById('presetsGrid');
        
        // Duplicate modal
        this.duplicateModal = document.getElementById('duplicateModal');
        this.closeDuplicateModal = document.getElementById('closeDuplicateModal');
        this.duplicateResults = document.getElementById('duplicateResults');
        
        // Changelog elements
        this.changelogBtns = document.querySelectorAll('.changelog-btn');
        this.changelogViewer = document.getElementById('changelogViewer');
        this.closeChangelog = document.getElementById('closeChangelog');
        this.changelogTitle = document.getElementById('changelogTitle');
        this.changelogOld = document.getElementById('changelogOld');
        this.changelogNew = document.getElementById('changelogNew');
        
        // PageSpeed elements
        this.pagespeedUrl = document.getElementById('pagespeedUrl');
        this.analyzePageSpeedBtn = document.getElementById('analyzePageSpeedBtn');
        this.pagespeedLoading = document.getElementById('pagespeedLoading');
        this.pagespeedResults = document.getElementById('pagespeedResults');
        this.deviceBtns = document.querySelectorAll('.device-btn');
    }

    bindEvents() {
        // Upload events
        this.uploadZone.addEventListener('click', () => this.fileInput.click());
        this.uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadZone.addEventListener('drop', this.handleDrop.bind(this));
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        
        // Quality control
        this.qualitySlider.addEventListener('input', this.handleQualityChange.bind(this));
        
        // Conversion mode
        this.modeWebpOnly.addEventListener('change', this.handleModeChange.bind(this));
        this.modeResizeOnly.addEventListener('change', this.handleModeChange.bind(this));
        this.modeBoth.addEventListener('change', this.handleModeChange.bind(this));
        
        // Aspect ratio toggle
        this.aspectRatioBtn.addEventListener('click', this.toggleAspectRatio.bind(this));
        
        // Dimension inputs
        this.widthInput.addEventListener('input', this.handleWidthChange.bind(this));
        this.heightInput.addEventListener('input', this.handleHeightChange.bind(this));
        
        // Action buttons
        this.convertBtn.addEventListener('click', this.startConversion.bind(this));
        this.clearBtn.addEventListener('click', this.clearAll.bind(this));
        this.downloadAllBtn.addEventListener('click', this.downloadAll.bind(this));
        
        // Rename and EXIF
        this.renameInput.addEventListener('input', this.handleRenameInput.bind(this));
        this.preserveExifToggle.addEventListener('change', this.handleExifToggle.bind(this));
        
        // Bulk actions
        this.sortBySizeBtn.addEventListener('click', () => this.sortFiles('size'));
        this.sortBySavingsBtn.addEventListener('click', () => this.sortFiles('savings'));
        this.removeFailedBtn.addEventListener('click', this.removeFailed.bind(this));
        this.reconvertFailedBtn.addEventListener('click', this.reconvertFailed.bind(this));
        this.duplicateDetectorBtn.addEventListener('click', this.openDuplicateDetector.bind(this));
        
        // Sidebar events
        this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        this.sidebarClose.addEventListener('click', () => this.toggleSidebar());
        this.sidebarOverlay.addEventListener('click', () => this.toggleSidebar());
        
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.switchSection(section);
                this.toggleSidebar();
            });
        });
        
        // URL upload events
        this.toggleUrlUploadBtn.addEventListener('click', () => {
            this.urlUploadSection.classList.toggle('d-none');
        });
        
        this.urlAddBtn.addEventListener('click', this.addUrlToList.bind(this));
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addUrlToList();
            }
        });
        
        // History events
        this.clearHistoryBtn.addEventListener('click', this.clearHistory.bind(this));
        
        // Live Preview Panel events
        this.previewToggle.addEventListener('click', () => this.togglePreviewPanel());
        this.reopenPreviewBtn.addEventListener('click', () => this.togglePreviewPanel());
        
        // Preset events
        this.savePresetBtn.addEventListener('click', () => this.openPresetModal());
        this.closePresetModal.addEventListener('click', () => this.closeModal(this.presetModal));
        this.confirmSavePreset.addEventListener('click', () => this.savePreset());
        
        // Duplicate modal
        this.closeDuplicateModal.addEventListener('click', () => this.closeModal(this.duplicateModal));
        
        // Changelog events
        this.changelogBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const file = btn.getAttribute('data-file');
                this.showChangelog(file);
            });
        });
        
        if (this.closeChangelog) {
            this.closeChangelog.addEventListener('click', () => {
                this.changelogViewer.classList.add('d-none');
            });
        }
        
        // PageSpeed events
        if (this.analyzePageSpeedBtn) {
            this.analyzePageSpeedBtn.addEventListener('click', () => this.analyzePageSpeed());
        }
        
        if (this.pagespeedUrl) {
            this.pagespeedUrl.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.analyzePageSpeed();
                }
            });
        }
        
        if (this.deviceBtns) {
            this.deviceBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.deviceBtns.forEach(b => b.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    this.pagespeedStrategy = e.currentTarget.getAttribute('data-strategy');
                });
            });
        }
        
        // Close modals on background click
        [this.duplicateModal, this.presetModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.closeModal(modal);
                    }
                });
            }
        });
    }

    // Sidebar methods
    toggleSidebar() {
        this.sidebar.classList.toggle('active');
        this.sidebarOverlay.classList.toggle('active');
    }

    switchSection(sectionName) {
        this.navItems.forEach(item => item.classList.remove('active'));
        this.contentSections.forEach(section => section.classList.remove('active'));
        
        const targetNav = document.querySelector(`[data-section="${sectionName}"]`);
        const targetSection = document.getElementById(`${sectionName}Section`);
        
        if (targetNav) targetNav.classList.add('active');
        if (targetSection) targetSection.classList.add('active');
    }

    updateSidebarStats() {
        const totalConversions = this.history.reduce((sum, item) => sum + item.fileCount, 0);
        const totalSaved = this.history.reduce((sum, item) => sum + (item.originalSize - item.convertedSize), 0);
        
        this.sidebarTotalConversions.textContent = totalConversions;
        this.sidebarSpaceSaved.textContent = this.formatFileSize(totalSaved);
    }

    initializeNotifications() {
        const notificationCenter = document.getElementById('notificationsCenter');
        const closeNotificationBtn = document.getElementById('closeNotification');
        const reopenNotificationBtn = document.getElementById('reopenNotification');
        
        if (!notificationCenter || !closeNotificationBtn || !reopenNotificationBtn) return;
        
        // Check if notification was previously closed
        const notificationClosed = localStorage.getItem('notificationClosed');
        
        // Show notification on page load (after small delay for better effect)
        setTimeout(() => {
            if (!notificationClosed) {
                notificationCenter.classList.add('active');
            } else {
                reopenNotificationBtn.classList.add('visible');
            }
        }, 500);
        
        // Close notification
        closeNotificationBtn.addEventListener('click', () => {
            notificationCenter.classList.add('closing');
            
            setTimeout(() => {
                notificationCenter.classList.remove('active', 'closing');
                reopenNotificationBtn.classList.add('visible');
                
                // Remember that user closed it
                localStorage.setItem('notificationClosed', 'true');
            }, 500);
        });
        
        // Reopen notification
        reopenNotificationBtn.addEventListener('click', () => {
            reopenNotificationBtn.classList.remove('visible');
            
            setTimeout(() => {
                notificationCenter.classList.add('active');
                
                // Remove the "closed" flag
                localStorage.removeItem('notificationClosed');
            }, 100);
        });
    }

    // Conversion mode handling
    handleModeChange(e) {
        this.conversionMode = e.target.value;
        
        const infoTexts = {
            'webp': 'Images will be converted to WebP format only',
            'resize': 'Images will be resized (keeps original format)',
            'both': 'Images will be resized AND converted to WebP for maximum savings!'
        };
        
        this.conversionModeInfo.textContent = infoTexts[this.conversionMode];
        
        if (this.conversionMode === 'webp') {
            this.qualitySection.classList.remove('d-none');
            this.resizeSection.classList.add('d-none');
        } else if (this.conversionMode === 'resize') {
            this.qualitySection.classList.add('d-none');
            this.resizeSection.classList.remove('d-none');
        } else if (this.conversionMode === 'both') {
            this.qualitySection.classList.remove('d-none');
            this.resizeSection.classList.remove('d-none');
        }
        
        if (this.files.length > 0) {
            this.renderFileList();
        }
    }

    toggleAspectRatio() {
        this.maintainAspectRatio = !this.maintainAspectRatio;
        
        if (this.maintainAspectRatio) {
            this.aspectRatioBtn.classList.add('active');
            this.aspectRatioBtn.innerHTML = '<i class="fas fa-link me-2"></i><span>Maintain Aspect Ratio</span>';
            this.heightInput.disabled = true;
            this.dimensionHint.textContent = 'Height will auto-adjust to maintain aspect ratio';
        } else {
            this.aspectRatioBtn.classList.remove('active');
            this.aspectRatioBtn.innerHTML = '<i class="fas fa-unlink me-2"></i><span>Manual Dimensions</span>';
            this.heightInput.disabled = false;
            this.dimensionHint.textContent = 'Set custom width and height independently';
        }
        
        if (this.files.length > 0) {
            this.renderFileList();
        }
    }

    handleWidthChange(e) {
        this.targetWidth = parseInt(e.target.value) || 1920;
        
        if (this.maintainAspectRatio && this.files.length > 0) {
            const firstFile = this.files[0];
            if (firstFile.originalDimensions) {
                const [width, height] = firstFile.originalDimensions.split('x').map(Number);
                const aspectRatio = height / width;
                this.targetHeight = Math.round(this.targetWidth * aspectRatio);
                this.heightInput.value = this.targetHeight;
            }
        }
        
        if (this.files.length > 0) {
            this.renderFileList();
        }
    }

    handleHeightChange(e) {
        if (!this.maintainAspectRatio) {
            this.targetHeight = parseInt(e.target.value) || 1080;
            
            if (this.files.length > 0) {
                this.renderFileList();
            }
        }
    }

    addUrlToList() {
        const url = this.urlInput.value.trim();
        if (!url) return;
        
        try {
            new URL(url);
        } catch {
            alert('Please enter a valid URL');
            return;
        }
        
        this.urlList.push(url);
        this.renderUrlList();
        this.urlInput.value = '';
        
        this.downloadImageFromUrl(url);
    }

    async downloadImageFromUrl(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            
            if (!blob.type.startsWith('image/')) {
                throw new Error('URL does not point to an image');
            }
            
            const fileName = url.split('/').pop() || 'downloaded-image.jpg';
            const file = new File([blob], fileName, { type: blob.type });
            
            this.addFiles([file]);
        } catch (error) {
            console.error('Error downloading image:', error);
            alert('Failed to download image from URL. Please check the URL and try again.');
            
            this.urlList = this.urlList.filter(u => u !== url);
            this.renderUrlList();
        }
    }

    renderUrlList() {
        if (this.urlList.length === 0) {
            this.urlListEl.innerHTML = '';
            return;
        }
        
        this.urlListEl.innerHTML = this.urlList.map((url, index) => `
            <div class="url-item">
                <div class="url-text">${url}</div>
                <button class="url-remove-btn" data-url-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        
        this.urlListEl.querySelectorAll('.url-remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-url-index'));
                this.urlList.splice(index, 1);
                this.renderUrlList();
            });
        });
    }

    togglePreviewPanel() {
        if (this.livePreviewPanel.classList.contains('d-none')) {
            this.livePreviewPanel.classList.remove('d-none');
            this.reopenPreviewBtn.classList.add('d-none');
        } else {
            this.livePreviewPanel.classList.add('d-none');
            this.reopenPreviewBtn.classList.remove('d-none');
        }
    }

    async updateLivePreview() {
        if (this.files.length === 0) {
            this.previewPanelContent.innerHTML = `
                <div class="empty-preview">
                    <i class="fas fa-images"></i>
                    <p>Upload images to see live preview</p>
                </div>
            `;
            return;
        }
        
        this.previewPanelContent.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea;"></i><p>Generating previews...</p></div>';
        
        this.livePreviewPanel.classList.remove('d-none');
        this.reopenPreviewBtn.classList.add('d-none');
        
        const previewsHTML = await Promise.all(
            this.files.slice(0, 10).map(async (fileObj) => {
                const originalUrl = await this.fileToDataUrl(fileObj.file);
                const previewUrl = await this.generatePreviewWithTransforms(fileObj);
                
                return `
                    <div class="preview-item-card">
                        <div class="preview-item-name">${fileObj.name}</div>
                        <div class="preview-images">
                            <div class="preview-image-wrapper">
                                <div class="preview-label">Original</div>
                                <img src="${originalUrl}" alt="Original" class="preview-img">
                                <div class="preview-size">${this.formatFileSize(fileObj.size)}</div>
                            </div>
                            <div class="preview-image-wrapper">
                                <div class="preview-label">Preview</div>
                                <img src="${previewUrl}" alt="Preview" class="preview-img">
                                <div class="preview-size">With transforms</div>
                            </div>
                        </div>
                    </div>
                `;
            })
        );
        
        this.previewPanelContent.innerHTML = previewsHTML.join('');
        
        if (this.files.length > 10) {
            this.previewPanelContent.innerHTML += '<p class="text-center text-muted mt-3">Showing first 10 images</p>';
        }
    }

    async generatePreviewWithTransforms(fileObj) {
        const transforms = this.fileTransforms.get(fileObj.id);
        if (!transforms || (transforms.rotate === 0 && !transforms.flipH && !transforms.flipV && !transforms.background)) {
            return await this.fileToDataUrl(fileObj.file);
        }
        
        return new Promise(async (resolve) => {
            const img = new Image();
            const originalUrl = await this.fileToDataUrl(fileObj.file);
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                if (transforms.rotate === 90 || transforms.rotate === 270) {
                    canvas.width = img.height;
                    canvas.height = img.width;
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                }
                
                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(transforms.rotate * Math.PI / 180);
                if (transforms.flipH) ctx.scale(-1, 1);
                if (transforms.flipV) ctx.scale(1, -1);
                
                if (transforms.background === 'white') {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(-img.width / 2, -img.height / 2, img.width, img.height);
                }
                
                ctx.drawImage(img, -img.width / 2, -img.height / 2);
                ctx.restore();
                
                resolve(canvas.toDataURL());
            };
            
            img.src = originalUrl;
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadZone.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadZone.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadZone.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(file => 
            ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'].includes(file.type)
        );
        this.addFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.addFiles(files);
    }

    addFiles(newFiles) {
        newFiles.forEach(file => {
            if (!this.files.some(f => f.name === file.name && f.size === file.size)) {
                const fileObj = {
                    id: Date.now() + Math.random(),
                    file: file,
                    name: file.name,
                    size: file.size,
                    status: 'pending',
                    convertedBlob: null,
                    convertedSize: 0,
                    savings: 0,
                    originalDataUrl: null,
                    convertedDataUrl: null
                };
                this.files.push(fileObj);
                this.totalOriginalSize += file.size;
                
                this.fileTransforms.set(fileObj.id, {
                    rotate: 0,
                    flipH: false,
                    flipV: false,
                    background: null
                });
                
                this.loadImageDimensions(fileObj);
            }
        });
        
        this.updateUI();
        this.updateRenamePreview();
        this.updateLivePreview();
    }

    async loadImageDimensions(fileObj) {
        const img = new Image();
        const url = await this.fileToDataUrl(fileObj.file);
        
        img.onload = () => {
            fileObj.originalDimensions = `${img.width}x${img.height}`;
            this.renderFileList();
        };
        
        img.src = url;
    }

    handleQualityChange(e) {
        this.quality = e.target.value / 100;
        this.qualityValue.textContent = e.target.value + '%';
    }

    handleRenameInput(e) {
        this.renamePrefix = e.target.value.trim();
        this.updateRenamePreview();
    }

    handleExifToggle(e) {
        this.preserveExif = e.target.checked;
    }

    updateRenamePreview() {
        if (this.renamePrefix && this.files.length > 0) {
            const examples = this.files.slice(0, 3).map((file, index) => {
                const ext = this.conversionMode === 'resize' ? file.name.split('.').pop() : 'webp';
                return `${this.renamePrefix}_${index + 1}.${ext}`;
            });
            
            this.renamePreview.innerHTML = `
                <div class="preview-examples">
                    ${examples.map(name => `<span class="preview-badge">${name}</span>`).join('')}
                    ${this.files.length > 3 ? '<span class="preview-badge">...</span>' : ''}
                </div>
            `;
        } else {
            this.renamePreview.innerHTML = '<small class="text-muted">Leave empty to keep original names</small>';
        }
    }

    updateUI() {
        this.renderFileList();
        this.updateStats();
        
        if (this.files.length > 0) {
            this.showElement(this.qualityControl);
            this.showElement(this.actionButtons);
            this.showElement(this.progressSection);
            this.showElement(this.statsGrid);
            this.showElement(this.bulkActions);
            
            this.handleModeChange({ target: { value: this.conversionMode } });
        } else {
            this.hideElement(this.qualityControl);
            this.hideElement(this.actionButtons);
            this.hideElement(this.progressSection);
            this.hideElement(this.statsGrid);
            this.hideElement(this.bulkActions);
        }
    }

    showElement(element) {
        element.classList.remove('d-none');
        element.classList.add('fade-in');
    }

    hideElement(element) {
        element.classList.add('d-none');
        element.classList.remove('fade-in');
    }

    renderFileList() {
        this.fileList.innerHTML = '';
        
        this.files.forEach((fileObj, index) => {
            const statusIcon = this.getStatusIcon(fileObj.status);
            const savingsText = fileObj.status === 'completed' && fileObj.savings > 0 
                ? `<span class="savings-badge">-${fileObj.savings}%</span>` 
                : '';
            
            const transforms = this.fileTransforms.get(fileObj.id) || {};
            const hasTransforms = transforms.rotate !== 0 || transforms.flipH || transforms.flipV || transforms.background;
            
            const toolButtons = fileObj.status === 'pending' ? `
                <button class="tool-btn" data-file-id="${fileObj.id}" data-tool="rotate" title="Rotate 90°">
                    <i class="fas fa-redo"></i>
                </button>
                <button class="tool-btn ${transforms.flipH ? 'active' : ''}" data-file-id="${fileObj.id}" data-tool="flipH" title="Flip Horizontal">
                    <i class="fas fa-arrows-alt-h"></i>
                </button>
                <button class="tool-btn ${transforms.flipV ? 'active' : ''}" data-file-id="${fileObj.id}" data-tool="flipV" title="Flip Vertical">
                    <i class="fas fa-arrows-alt-v"></i>
                </button>
                <button class="tool-btn ${transforms.background === 'white' ? 'active' : ''}" data-file-id="${fileObj.id}" data-tool="background" title="White Background">
                    <i class="fas fa-fill-drip"></i>
                </button>
                ${hasTransforms ? `<button class="reset-btn" data-file-id="${fileObj.id}" title="Reset All Changes">
                    <i class="fas fa-undo"></i>
                </button>` : ''}
            ` : '';
            
            const downloadBtn = fileObj.status === 'completed' 
                ? `<button class="download-btn" data-file-id="${fileObj.id}" title="Download">
                     <i class="fas fa-download"></i>
                   </button>` 
                : '';
            
            const previewBtn = fileObj.status === 'completed' 
                ? `<button class="preview-btn" data-file-id="${fileObj.id}" title="Preview Before/After">
                     <i class="fas fa-eye"></i>
                   </button>` 
                : '';
            
            const removeBtn = `<button class="remove-btn" data-file-id="${fileObj.id}" title="Remove File">
                <i class="fas fa-times"></i>
            </button>`;
            
            const finalName = this.getFinalFileName(fileObj, index);
            const targetDimensionsText = this.getTargetDimensionsText(fileObj);
            
            const fileItem = document.createElement('div');
            fileItem.className = `file-item ${fileObj.status}`;
            fileItem.innerHTML = `
                <div class="file-header">
                    <div class="file-name">${fileObj.name}${finalName !== fileObj.name ? ` → ${finalName}` : ''}</div>
                    <div class="file-actions">
                        ${savingsText}
                        <i class="${statusIcon}"></i>
                        ${toolButtons}
                        ${previewBtn}
                        ${downloadBtn}
                        ${removeBtn}
                    </div>
                </div>
                <div class="file-details">
                    ${this.formatFileSize(fileObj.size)}
                    ${fileObj.convertedSize > 0 ? ` → ${this.formatFileSize(fileObj.convertedSize)}` : ''}
                    ${fileObj.originalDimensions ? ` • ${fileObj.originalDimensions}` : ''}
                    ${targetDimensionsText}
                    ${transforms.rotate ? ` • Rotated ${transforms.rotate}°` : ''}
                    ${transforms.flipH ? ` • Flipped H` : ''}
                    ${transforms.flipV ? ` • Flipped V` : ''}
                    ${transforms.background ? ` • White BG` : ''}
                </div>
            `;
            
            this.fileList.appendChild(fileItem);
        });
        
        this.fileList.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fileId = parseFloat(e.currentTarget.getAttribute('data-file-id'));
                const tool = e.currentTarget.getAttribute('data-tool');
                this.applyIndividualTool(fileId, tool);
            });
        });
        
        this.fileList.querySelectorAll('.reset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fileId = parseFloat(e.currentTarget.getAttribute('data-file-id'));
                this.resetFileTransforms(fileId);
            });
        });
        
        this.fileList.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fileId = parseFloat(e.currentTarget.getAttribute('data-file-id'));
                this.downloadFile(fileId);
            });
        });
        
        this.fileList.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fileId = parseFloat(e.currentTarget.getAttribute('data-file-id'));
                this.showPreview(fileId);
            });
        });
        
        this.fileList.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fileId = parseFloat(e.currentTarget.getAttribute('data-file-id'));
                this.removeFile(fileId);
            });
        });
    }

    getTargetDimensionsText(fileObj) {
        const shouldResize = this.conversionMode === 'resize' || this.conversionMode === 'both';
        
        if (!shouldResize || !fileObj.originalDimensions) {
            return '';
        }
        
        const [origWidth, origHeight] = fileObj.originalDimensions.split('x').map(Number);
        
        let targetWidth, targetHeight;
        
        if (this.maintainAspectRatio) {
            if (origWidth > this.targetWidth) {
                targetWidth = this.targetWidth;
                const aspectRatio = origHeight / origWidth;
                targetHeight = Math.round(this.targetWidth * aspectRatio);
            } else {
                targetWidth = origWidth;
                targetHeight = origHeight;
            }
        } else {
            targetWidth = this.targetWidth;
            targetHeight = this.targetHeight;
        }
        
        const transforms = this.fileTransforms.get(fileObj.id) || {};
        if (transforms.rotate === 90 || transforms.rotate === 270) {
            [targetWidth, targetHeight] = [targetHeight, targetWidth];
        }
        
        return ` → ${targetWidth}x${targetHeight}`;
    }

    applyIndividualTool(fileId, tool) {
        const transforms = this.fileTransforms.get(fileId);
        if (!transforms) return;
        
        switch(tool) {
            case 'rotate':
                transforms.rotate = (transforms.rotate + 90) % 360;
                break;
            case 'flipH':
                transforms.flipH = !transforms.flipH;
                break;
            case 'flipV':
                transforms.flipV = !transforms.flipV;
                break;
            case 'background':
                transforms.background = transforms.background === 'white' ? null : 'white';
                break;
        }
        
        this.renderFileList();
        this.updateLivePreview();
    }

    resetFileTransforms(fileId) {
        const transforms = this.fileTransforms.get(fileId);
        if (!transforms) return;
        
        transforms.rotate = 0;
        transforms.flipH = false;
        transforms.flipV = false;
        transforms.background = null;
        
        this.renderFileList();
        this.updateLivePreview();
    }

    removeFile(fileId) {
        const index = this.files.findIndex(f => f.id === fileId);
        if (index > -1) {
            this.totalOriginalSize -= this.files[index].size;
            if (this.files[index].convertedSize) {
                this.totalConvertedSize -= this.files[index].convertedSize;
            }
            this.files.splice(index, 1);
            this.fileTransforms.delete(fileId);
            this.updateUI();
            this.updateLivePreview();
        }
    }

    getFinalFileName(fileObj, index) {
        if (this.renamePrefix) {
            let ext;
            if (this.conversionMode === 'webp' || this.conversionMode === 'both') {
                ext = 'webp';
            } else if (fileObj.file.type === 'image/svg+xml') {
                ext = 'png';
            } else {
                ext = fileObj.name.split('.').pop();
            }
            return `${this.renamePrefix}_${index + 1}.${ext}`;
        } else {
            if (fileObj.convertedToWebP) {
                return fileObj.name.replace(/\.(jpg|jpeg|png|svg)$/i, '.webp');
            } else if (fileObj.file.type === 'image/svg+xml' && this.conversionMode === 'resize') {
                return fileObj.name.replace(/\.svg$/i, '.png');
            }
            return fileObj.name;
        }
    }

    getStatusIcon(status) {
        switch (status) {
            case 'processing':
                return 'fas fa-spinner status-icon processing';
            case 'completed':
                return 'fas fa-check-circle status-icon completed';
            case 'error':
                return 'fas fa-exclamation-circle status-icon error';
            default:
                return 'fas fa-clock status-icon pending';
        }
    }

    updateStats() {
        const completed = this.files.filter(f => f.status === 'completed').length;
        const remaining = this.files.length - completed;
        const totalSavings = this.calculateTotalSavings();
        
        this.totalFilesEl.textContent = this.files.length;
        this.completedFilesEl.textContent = completed;
        this.remainingFilesEl.textContent = remaining;
        this.totalSavingsEl.textContent = totalSavings + '%';
        
        const progress = this.files.length > 0 ? (completed / this.files.length) * 100 : 0;
        this.progressBarFill.style.width = progress + '%';
        
        if (this.isConverting) {
            this.progressText.textContent = `Converting... ${completed}/${this.files.length} files`;
        } else if (completed === this.files.length && this.files.length > 0) {
            this.progressText.innerHTML = `<i class="fas fa-check-circle text-success me-2"></i>Conversion complete! Saved ${totalSavings}% space`;
            this.showElement(this.downloadAllBtn);
        } else {
            this.progressText.innerHTML = `<i class="fas fa-images text-primary me-2"></i>Ready to convert ${this.files.length} files`;
        }
        
        const totalConversions = this.history.reduce((sum, item) => sum + item.fileCount, 0);
        const totalSaved = this.history.reduce((sum, item) => sum + (item.originalSize - item.convertedSize), 0);
        const totalProcessed = this.history.reduce((sum, item) => sum + item.fileCount, 0);
        const avgSavings = this.history.length > 0 
            ? Math.round(this.history.reduce((sum, item) => sum + item.totalSavings, 0) / this.history.length)
            : 0;
        
        this.statTotalConversions.textContent = totalConversions;
        this.statTotalSaved.textContent = this.formatFileSize(totalSaved);
        this.statAvgSavings.textContent = avgSavings + '%';
        this.statTotalFiles.textContent = totalProcessed;
    }

    calculateTotalSavings() {
        if (this.totalOriginalSize === 0) return 0;
        const totalSaved = this.totalOriginalSize - this.totalConvertedSize;
        return Math.round((totalSaved / this.totalOriginalSize) * 100);
    }

    async startConversion() {
        if (this.isConverting || this.files.length === 0) return;
        
        this.isConverting = true;
        this.convertBtn.disabled = true;
        this.convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Converting...';
        
        for (let i = 0; i < this.files.length; i++) {
            const fileObj = this.files[i];
            if (fileObj.status !== 'completed') {
                this.currentFileInfo.innerHTML = `<span class="processing-file">Processing: ${fileObj.name} (${i + 1}/${this.files.length})</span>`;
                await this.convertFile(fileObj, i);
            }
        }
        
        this.currentFileInfo.innerHTML = '';
        this.isConverting = false;
        this.convertBtn.disabled = false;
        this.convertBtn.innerHTML = '<i class="fas fa-magic me-2"></i>Start Conversion';
        this.updateStats();
        
        this.saveToHistory();
    }

    async convertFile(fileObj, index) {
        try {
            fileObj.status = 'processing';
            this.updateUI();
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            const originalDataUrl = await this.fileToDataUrl(fileObj.file);
            fileObj.originalDataUrl = originalDataUrl;
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = originalDataUrl;
            });
            
            fileObj.originalDimensions = `${img.width}x${img.height}`;
            
            let canvasWidth = img.width;
            let canvasHeight = img.height;
            const shouldResize = this.conversionMode === 'resize' || this.conversionMode === 'both';
            
            if (shouldResize) {
                if (this.maintainAspectRatio) {
                    if (img.width > this.targetWidth) {
                        const aspectRatio = img.height / img.width;
                        canvasWidth = this.targetWidth;
                        canvasHeight = Math.round(this.targetWidth * aspectRatio);
                    }
                } else {
                    canvasWidth = this.targetWidth;
                    canvasHeight = this.targetHeight;
                }
            }
            
            const transforms = this.fileTransforms.get(fileObj.id) || {};
            
            if (transforms.rotate === 90 || transforms.rotate === 270) {
                canvas.width = canvasHeight;
                canvas.height = canvasWidth;
            } else {
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
            }
            
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(transforms.rotate * Math.PI / 180);
            if (transforms.flipH) ctx.scale(-1, 1);
            if (transforms.flipV) ctx.scale(1, -1);
            
            if (transforms.background === 'white') {
                ctx.fillStyle = 'white';
                ctx.fillRect(-canvasWidth / 2, -canvasHeight / 2, canvasWidth, canvasHeight);
            }
            
            ctx.drawImage(img, -canvasWidth / 2, -canvasHeight / 2, canvasWidth, canvasHeight);
            ctx.restore();
            
            const shouldConvertToWebP = this.conversionMode === 'webp' || this.conversionMode === 'both';
            
            let mimeType, quality;
            if (shouldConvertToWebP) {
                mimeType = 'image/webp';
                quality = this.quality;
            } else {
                if (fileObj.file.type === 'image/svg+xml') {
                    mimeType = 'image/png';
                    quality = 1.0;
                } else {
                    mimeType = fileObj.file.type;
                    quality = 0.92;
                }
            }
            
            await new Promise(resolve => {
                canvas.toBlob(blob => {
                    fileObj.convertedBlob = blob;
                    fileObj.convertedSize = blob.size;
                    this.totalConvertedSize += blob.size;
                    fileObj.savings = Math.round(((fileObj.size - blob.size) / fileObj.size) * 100);
                    fileObj.status = 'completed';
                    fileObj.newDimensions = `${canvas.width}x${canvas.height}`;
                    fileObj.convertedToWebP = shouldConvertToWebP;
                    
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        fileObj.convertedDataUrl = e.target.result;
                        resolve();
                    };
                    reader.readAsDataURL(blob);
                }, mimeType, quality);
            });
            
            await new Promise(resolve => setTimeout(resolve, 200));
            
        } catch (error) {
            console.error('Conversion error:', error);
            fileObj.status = 'error';
        }
        
        this.updateUI();
    }

    fileToDataUrl(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }

    showPreview(fileId) {
        const fileObj = this.files.find(f => f.id === fileId);
        if (!fileObj || !fileObj.convertedDataUrl) return;
        
        const modal = document.createElement('div');
        modal.className = 'duplicate-modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="duplicate-modal-content">
                <button class="close-modal">&times;</button>
                <div class="modal-header">
                    <h3>Before & After Comparison</h3>
                    <p>${fileObj.name}</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
                    <div style="text-align: center;">
                        <div style="font-weight: 600; margin-bottom: 1rem;">Original</div>
                        <img src="${fileObj.originalDataUrl}" alt="Original" style="width: 100%; border-radius: 10px; margin-bottom: 1rem;">
                        <div style="color: #666;">
                            <div>Size: ${this.formatFileSize(fileObj.size)}</div>
                            <div>Dimensions: ${fileObj.originalDimensions}</div>
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-weight: 600; margin-bottom: 1rem;">Converted</div>
                        <img src="${fileObj.convertedDataUrl}" alt="Converted" style="width: 100%; border-radius: 10px; margin-bottom: 1rem;">
                        <div style="color: #666;">
                            <div>Size: ${this.formatFileSize(fileObj.convertedSize)}</div>
                            <div>Dimensions: ${fileObj.newDimensions}</div>
                            <div style="color: #28a745; font-weight: 600;">Saved: ${fileObj.savings}%</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    downloadFile(fileId) {
        const fileObj = this.files.find(f => f.id === fileId);
        if (!fileObj || !fileObj.convertedBlob) return;
        
        const index = this.files.indexOf(fileObj);
        const fileName = this.getFinalFileName(fileObj, index);
        
        const url = URL.createObjectURL(fileObj.convertedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async downloadAll() {
        const completedFiles = this.files.filter(f => f.status === 'completed');
        if (completedFiles.length === 0) return;
        
        this.downloadAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creating ZIP...';
        
        try {
            const zip = new JSZip();
            
            completedFiles.forEach((fileObj, index) => {
                const fileName = this.getFinalFileName(fileObj, this.files.indexOf(fileObj));
                zip.file(fileName, fileObj.convertedBlob);
            });
            
            this.downloadAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating ZIP...';
            const zipBlob = await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: { level: 6 }
            });
            
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'webp-conversion.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.downloadAllBtn.innerHTML = '<i class="fas fa-check me-2"></i>ZIP Downloaded!';
            setTimeout(() => {
                this.downloadAllBtn.innerHTML = '<i class="fas fa-download me-2"></i>Download All as ZIP';
            }, 3000);
            
        } catch (error) {
            console.error('ZIP creation error:', error);
            this.downloadAllBtn.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>ZIP Error';
            setTimeout(() => {
                this.downloadAllBtn.innerHTML = '<i class="fas fa-download me-2"></i>Download All as ZIP';
            }, 3000);
        }
    }

    sortFiles(type) {
        if (type === 'size') {
            this.files.sort((a, b) => b.size - a.size);
        } else if (type === 'savings') {
            this.files.sort((a, b) => b.savings - a.savings);
        }
        this.renderFileList();
    }

    removeFailed() {
        this.files = this.files.filter(f => f.status !== 'error');
        this.updateUI();
    }

    async reconvertFailed() {
        const failedFiles = this.files.filter(f => f.status === 'error');
        if (failedFiles.length === 0) return;
        
        for (let fileObj of failedFiles) {
            fileObj.status = 'pending';
            await this.convertFile(fileObj, this.files.indexOf(fileObj));
        }
    }

    openDuplicateDetector() {
        this.duplicateModal.classList.remove('d-none');
        this.scanForDuplicates();
    }

    async scanForDuplicates() {
        if (this.files.length < 2) {
            this.duplicateResults.innerHTML = '<p class="text-center">You need at least 2 images to detect duplicates</p>';
            return;
        }
        
        this.duplicateResults.innerHTML = '<p class="text-center"><i class="fas fa-spinner fa-spin me-2"></i>Scanning for duplicates...</p>';
        
        const duplicates = [];
        const seen = new Map();
        
        for (const file of this.files) {
            const key = `${file.name}-${file.size}`;
            if (seen.has(key)) {
                duplicates.push({
                    file1: seen.get(key),
                    file2: file
                });
            } else {
                seen.set(key, file);
            }
        }
        
        if (duplicates.length === 0) {
            this.duplicateResults.innerHTML = '<p class="text-center text-success"><i class="fas fa-check-circle me-2"></i>No duplicates found!</p>';
        } else {
            this.duplicateResults.innerHTML = `
                <p class="text-center" style="color: #ffc107;"><i class="fas fa-exclamation-triangle me-2"></i>Found ${duplicates.length} duplicate(s)</p>
                <div class="text-center mt-3">
                    <button class="btn-custom" onclick="converter.removeDuplicates()" style="display: inline-block; padding: 0.8rem 1.5rem;">
                        <i class="fas fa-trash me-2"></i>Remove Duplicates
                    </button>
                </div>
            `;
        }
    }

    removeDuplicates() {
        const seen = new Set();
        const originalLength = this.files.length;
        
        this.files = this.files.filter(file => {
            const key = `${file.name}-${file.size}`;
            if (seen.has(key)) {
                this.fileTransforms.delete(file.id);
                return false;
            }
            seen.add(key);
            return true;
        });
        
        const removed = originalLength - this.files.length;
        this.updateUI();
        this.updateLivePreview();
        this.closeModal(this.duplicateModal);
        alert(`Removed ${removed} duplicate(s)!`);
    }

    openPresetModal() {
        this.presetModal.classList.remove('d-none');
        this.presetNameInput.value = '';
        this.presetNameInput.focus();
    }

    savePreset() {
        const name = this.presetNameInput.value.trim();
        if (!name) {
            alert('Please enter a preset name');
            return;
        }
        
        const preset = {
            id: Date.now(),
            name: name,
            conversionMode: this.conversionMode,
            quality: this.quality,
            targetWidth: this.targetWidth,
            targetHeight: this.targetHeight,
            maintainAspectRatio: this.maintainAspectRatio,
            renamePrefix: this.renamePrefix,
            preserveExif: this.preserveExif
        };
        
        this.presets.push(preset);
        localStorage.setItem('converterPresets', JSON.stringify(this.presets));
        
        this.closeModal(this.presetModal);
        this.renderPresets();
        alert('Preset saved successfully!');
    }

    loadPresets() {
        const stored = localStorage.getItem('converterPresets');
        return stored ? JSON.parse(stored) : [];
    }

    renderPresets() {
        if (this.presets.length === 0) {
            this.presetsGrid.innerHTML = '<p class="text-center text-muted-white">No saved presets yet. Save your current settings from the converter page!</p>';
            return;
        }
        
        this.presetsGrid.innerHTML = this.presets.map(preset => `
            <div class="preset-card">
                <div class="preset-name">${preset.name}</div>
                <div class="preset-settings">
                    <div class="setting-item">
                        <span class="setting-label">Mode:</span>
                        <span class="setting-value">${preset.conversionMode}</span>
                    </div>
                    <div class="setting-item">
                        <span class="setting-label">Quality:</span>
                        <span class="setting-value">${Math.round(preset.quality * 100)}%</span>
                    </div>
                    <div class="setting-item">
                        <span class="setting-label">Dimensions:</span>
                        <span class="setting-value">${preset.targetWidth}x${preset.targetHeight}</span>
                    </div>
                    <div class="setting-item">
                        <span class="setting-label">Aspect Ratio:</span>
                        <span class="setting-value">${preset.maintainAspectRatio ? 'Locked' : 'Unlocked'}</span>
                    </div>
                </div>
                <div class="preset-actions">
                    <button class="preset-btn" onclick="converter.applyPreset(${preset.id})">
                        <i class="fas fa-check me-2"></i>Load
                    </button>
                    <button class="preset-btn delete" onclick="converter.deletePreset(${preset.id})">
                        <i class="fas fa-trash me-2"></i>Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    applyPreset(presetId) {
        const preset = this.presets.find(p => p.id === presetId);
        if (!preset) return;
        
        this.conversionMode = preset.conversionMode;
        this.quality = preset.quality;
        this.targetWidth = preset.targetWidth;
        this.targetHeight = preset.targetHeight;
        this.maintainAspectRatio = preset.maintainAspectRatio;
        this.renamePrefix = preset.renamePrefix;
        this.preserveExif = preset.preserveExif;
        
        const modeMap = {
            'webp': 'modeWebpOnly',
            'resize': 'modeResizeOnly',
            'both': 'modeBoth'
        };
        document.getElementById(modeMap[preset.conversionMode]).checked = true;
        this.qualitySlider.value = Math.round(preset.quality * 100);
        this.qualityValue.textContent = Math.round(preset.quality * 100) + '%';
        this.widthInput.value = preset.targetWidth;
        this.heightInput.value = preset.targetHeight;
        this.renameInput.value = preset.renamePrefix;
        this.preserveExifToggle.checked = preset.preserveExif;
        
        if (this.maintainAspectRatio) {
            this.aspectRatioBtn.classList.add('active');
            this.heightInput.disabled = true;
        } else {
            this.aspectRatioBtn.classList.remove('active');
            this.heightInput.disabled = false;
        }
        
        this.handleModeChange({ target: { value: preset.conversionMode } });
        this.updateRenamePreview();
        
        this.switchSection('converter');
        alert(`Preset "${preset.name}" loaded!`);
    }

    deletePreset(presetId) {
        if (!confirm('Are you sure you want to delete this preset?')) return;
        
        this.presets = this.presets.filter(p => p.id !== presetId);
        localStorage.setItem('converterPresets', JSON.stringify(this.presets));
        this.renderPresets();
    }

    // PageSpeed Insights Methods - WITH YOUR API KEY
    async analyzePageSpeed() {
        if (!this.pagespeedUrl) return;
        
        const url = this.pagespeedUrl.value.trim();
        
        if (!url) {
            alert('Please enter a URL to analyze');
            return;
        }
        
        try {
            new URL(url);
        } catch (e) {
            alert('Please enter a valid URL (e.g., https://example.com)');
            return;
        }
        
        this.pagespeedLoading.classList.remove('d-none');
        this.pagespeedResults.classList.add('d-none');
        this.analyzePageSpeedBtn.disabled = true;
        this.analyzePageSpeedBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Analyzing...';
        
        try {
            // Categories to analyze
            const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
            let apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${this.pagespeedStrategy}&key=${this.pagespeedApiKey}`;
            
            // Add categories to request
            categories.forEach(cat => {
                apiUrl += `&category=${cat}`;
            });
            
            console.log('Fetching PageSpeed data for:', url);
            
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            console.log('PageSpeed response:', data);
            
            if (data.error) {
                throw new Error(data.error.message || 'Failed to analyze URL');
            }
            
            if (!data.lighthouseResult) {
                throw new Error('No lighthouse results in response');
            }
            
            this.displayPageSpeedResults(data);
            
        } catch (error) {
            console.error('PageSpeed error:', error);
            
            let errorMessage = error.message;
            let troubleshooting = '';
            
            // Provide helpful troubleshooting based on error type
            if (errorMessage.includes('CORS')) {
                troubleshooting = '<p style="color: #666;">This appears to be a CORS issue. The API should work correctly.</p>';
            } else if (errorMessage.includes('Failed to fetch')) {
                troubleshooting = '<p style="color: #666;">Network error. Please check your internet connection.</p>';
            } else if (errorMessage.includes('Invalid response')) {
                troubleshooting = '<p style="color: #666;">The URL might not be publicly accessible or might have blocked the PageSpeed bot.</p>';
            }
            
            this.pagespeedResults.innerHTML = `
                <div class="metrics-section">
                    <h3><i class="fas fa-exclamation-triangle me-2"></i>Analysis Error</h3>
                    <p style="color: #dc3545; text-align: center; font-weight: 600;">${errorMessage}</p>
                    ${troubleshooting}
                    
                    <div style="margin-top: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                        <h4 style="font-size: 1rem; margin-bottom: 0.5rem;">Troubleshooting Tips:</h4>
                        <ul style="text-align: left; color: #666; line-height: 1.8;">
                            <li>Make sure the URL is publicly accessible (not behind a login)</li>
                            <li>Try with "https://" instead of "http://"</li>
                            <li>Verify the website is online and responding</li>
                            <li>Check if the URL is complete (including domain extension)</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: center;">
                        <a href="https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}" target="_blank" class="btn-custom" style="text-decoration: none; padding: 0.8rem 1.5rem; display: inline-block;">
                            <i class="fas fa-external-link-alt me-2"></i>Try on PageSpeed.web.dev
                        </a>
                    </div>
                </div>
            `;
            this.pagespeedResults.classList.remove('d-none');
        } finally {
            this.pagespeedLoading.classList.add('d-none');
            this.analyzePageSpeedBtn.disabled = false;
            this.analyzePageSpeedBtn.innerHTML = '<i class="fas fa-search me-2"></i>Analyze';
        }
    }

    displayPageSpeedResults(data) {
        try {
            const lighthouse = data.lighthouseResult;
            
            if (!lighthouse || !lighthouse.categories) {
                throw new Error('Invalid response from PageSpeed API');
            }
            
            const categories = lighthouse.categories;
            const audits = lighthouse.audits;
            
            // Safely get scores with fallbacks
            const performanceScore = categories.performance?.score ? Math.round(categories.performance.score * 100) : 0;
            const accessibilityScore = categories.accessibility?.score ? Math.round(categories.accessibility.score * 100) : 0;
            const bestPracticesScore = categories['best-practices']?.score ? Math.round(categories['best-practices'].score * 100) : 0;
            const seoScore = categories.seo?.score ? Math.round(categories.seo.score * 100) : 0;
            
            // Safely get metrics with fallbacks
            const fcp = audits['first-contentful-paint']?.displayValue || 'N/A';
            const lcp = audits['largest-contentful-paint']?.displayValue || 'N/A';
            const tbt = audits['total-blocking-time']?.displayValue || 'N/A';
            const cls = audits['cumulative-layout-shift']?.displayValue || 'N/A';
            const si = audits['speed-index']?.displayValue || 'N/A';
            
            // Safely get opportunities
            const opportunities = audits ? Object.values(audits)
                .filter(audit => audit && audit.details && audit.details.type === 'opportunity' && audit.score !== null && audit.score < 1)
                .sort((a, b) => (b.details?.overallSavingsMs || 0) - (a.details?.overallSavingsMs || 0))
                .slice(0, 5) : [];
            
            const html = `
                <div class="score-summary">
                    <div class="score-card">
                        <div class="score-label">Performance</div>
                        <div class="score-circle ${this.getScoreClass(performanceScore)}">
                            ${performanceScore}
                        </div>
                    </div>
                    <div class="score-card">
                        <div class="score-label">Accessibility</div>
                        <div class="score-circle ${this.getScoreClass(accessibilityScore)}">
                            ${accessibilityScore}
                        </div>
                    </div>
                    <div class="score-card">
                        <div class="score-label">Best Practices</div>
                        <div class="score-circle ${this.getScoreClass(bestPracticesScore)}">
                            ${bestPracticesScore}
                        </div>
                    </div>
                    <div class="score-card">
                        <div class="score-label">SEO</div>
                        <div class="score-circle ${this.getScoreClass(seoScore)}">
                            ${seoScore}
                        </div>
                    </div>
                </div>
                
                <div class="metrics-section">
                    <h3><i class="fas fa-clock me-2"></i>Core Web Vitals</h3>
                    <div class="metric-item">
                        <div class="metric-name">
                            <strong>First Contentful Paint (FCP)</strong>
                            <div style="font-size: 0.85rem; color: #666;">Measures when content first appears</div>
                        </div>
                        <div class="metric-value ${audits['first-contentful-paint']?.score ? this.getMetricClass(audits['first-contentful-paint'].score) : 'average'}">${fcp}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-name">
                            <strong>Largest Contentful Paint (LCP)</strong>
                            <div style="font-size: 0.85rem; color: #666;">Measures loading performance</div>
                        </div>
                        <div class="metric-value ${audits['largest-contentful-paint']?.score ? this.getMetricClass(audits['largest-contentful-paint'].score) : 'average'}">${lcp}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-name">
                            <strong>Total Blocking Time (TBT)</strong>
                            <div style="font-size: 0.85rem; color: #666;">Measures interactivity</div>
                        </div>
                        <div class="metric-value ${audits['total-blocking-time']?.score ? this.getMetricClass(audits['total-blocking-time'].score) : 'average'}">${tbt}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-name">
                            <strong>Cumulative Layout Shift (CLS)</strong>
                            <div style="font-size: 0.85rem; color: #666;">Measures visual stability</div>
                        </div>
                        <div class="metric-value ${audits['cumulative-layout-shift']?.score ? this.getMetricClass(audits['cumulative-layout-shift'].score) : 'average'}">${cls}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-name">
                            <strong>Speed Index</strong>
                            <div style="font-size: 0.85rem; color: #666;">How quickly content is displayed</div>
                        </div>
                        <div class="metric-value ${audits['speed-index']?.score ? this.getMetricClass(audits['speed-index'].score) : 'average'}">${si}</div>
                    </div>
                </div>
                
                ${opportunities.length > 0 ? `
                    <div class="opportunities-section">
                        <h3><i class="fas fa-lightbulb me-2"></i>Optimization Opportunities</h3>
                        ${opportunities.map(opp => `
                            <div class="opportunity-item">
                                <div class="opportunity-title">${opp.title || 'Optimization Available'}</div>
                                <div class="opportunity-description">${opp.description || ''}</div>
                                ${opp.details && opp.details.overallSavingsMs ? 
                                    `<span class="opportunity-savings">
                                        <i class="fas fa-clock me-1"></i>Potential savings: ${Math.round(opp.details.overallSavingsMs / 1000)}s
                                    </span>` 
                                    : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="metrics-section"><p style="text-align: center; color: #666;"><i class="fas fa-check-circle me-2"></i>No major optimization opportunities found!</p></div>'}
            `;
            
            this.pagespeedResults.innerHTML = html;
            this.pagespeedResults.classList.remove('d-none');
            
        } catch (error) {
            console.error('Error displaying PageSpeed results:', error);
            this.pagespeedResults.innerHTML = `
                <div class="metrics-section">
                    <h3><i class="fas fa-exclamation-triangle me-2"></i>Display Error</h3>
                    <p style="color: #dc3545; text-align: center;">Failed to display PageSpeed results</p>
                    <p style="text-align: center; color: #666;">The API returned data in an unexpected format.</p>
                    <details style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 8px;">
                        <summary style="cursor: pointer; font-weight: 600;">Show Raw Response</summary>
                        <pre style="margin-top: 1rem; overflow: auto; max-height: 300px; font-size: 0.8rem;">${JSON.stringify(data, null, 2)}</pre>
                    </details>
                </div>
            `;
            this.pagespeedResults.classList.remove('d-none');
        }
    }

    getScoreClass(score) {
        if (score >= 90) return 'good';
        if (score >= 50) return 'average';
        return 'poor';
    }

    getMetricClass(score) {
        if (score >= 0.9) return 'good';
        if (score >= 0.5) return 'average';
        return 'poor';
    }

    showChangelog(file) {
        this.changelogViewer.classList.remove('d-none');
        
        const titles = {
            'html': 'HTML Changes',
            'scss': 'SCSS Changes',
            'js': 'JavaScript Changes'
        };
        
        this.changelogTitle.textContent = titles[file] || 'Changes';
        
        const changes = {
            'html': {
                old: `<!-- OLD VERSION -->
<!-- No PageSpeed section -->`,
                new: `<!-- NEW VERSION -->
<!-- PageSpeed Insights Section -->
<div class="content-section" id="pagespeedSection">
    <input type="url" id="pagespeedUrl">
    <button class="btn-custom" id="analyzePageSpeedBtn">
        <i class="fas fa-search me-2"></i>Analyze
    </button>
</div>`
            },
            'scss': {
                old: `// OLD VERSION
// No PageSpeed styles`,
                new: `// NEW VERSION
.pagespeed-container {
    .score-circle {
        &.good { background: $success-gradient; }
        &.average { background: $warning-gradient; }
        &.poor { background: $danger-gradient; }
    }
}`
            },
            'js': {
                old: `// OLD VERSION
// No PageSpeed`,
                new: `// NEW VERSION
class ImageConverter {
    constructor() {
        this.pagespeedApiKey = 'YOUR_API_KEY';
    }
    
    async analyzePageSpeed() {
        const apiUrl = \`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=\${url}&strategy=\${this.pagespeedStrategy}&key=\${this.pagespeedApiKey}\`;
        // Fetch and display results
    }
}`
            }
        };
        
        this.changelogOld.textContent = changes[file].old;
        this.changelogNew.textContent = changes[file].new;
    }

    saveToHistory() {
        const historyItem = {
            date: new Date().toISOString(),
            fileCount: this.files.length,
            totalSavings: this.calculateTotalSavings(),
            originalSize: this.totalOriginalSize,
            convertedSize: this.totalConvertedSize
        };
        
        this.history.unshift(historyItem);
        if (this.history.length > 10) {
            this.history = this.history.slice(0, 10);
        }
        
        localStorage.setItem('converterHistory', JSON.stringify(this.history));
        this.renderHistory();
        this.updateSidebarStats();
        this.updateStats();
    }

    loadHistory() {
        const stored = localStorage.getItem('converterHistory');
        return stored ? JSON.parse(stored) : [];
    }

    renderHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<p class="text-center text-muted-white">No conversion history yet. Start converting images!</p>';
            return;
        }
        
        this.historyList.innerHTML = '';
        
        this.history.forEach(item => {
            const date = new Date(item.date);
            const formattedDate = date.toLocaleString();
            
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-info">
                    <div class="history-date">${formattedDate}</div>
                    <div class="history-details">${item.fileCount} files • ${this.formatFileSize(item.originalSize)} → ${this.formatFileSize(item.convertedSize)}</div>
                </div>
                <div class="history-stats">
                    <span class="stat-badge">${item.totalSavings}% saved</span>
                </div>
            `;
            
            this.historyList.appendChild(historyItem);
        });
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear conversion history?')) {
            this.history = [];
            localStorage.removeItem('converterHistory');
            this.renderHistory();
            this.updateSidebarStats();
            this.updateStats();
        }
    }

    clearAll() {
        this.files = [];
        this.totalOriginalSize = 0;
        this.totalConvertedSize = 0;
        this.renamePrefix = '';
        this.renameInput.value = '';
        this.urlList = [];
        this.fileTransforms.clear();
        this.renderUrlList();
        this.hideElement(this.downloadAllBtn);
        this.fileInput.value = '';
        this.updateUI();
        this.updateRenamePreview();
        this.updateLivePreview();
        
        this.fileList.style.opacity = '0';
        setTimeout(() => {
            this.fileList.innerHTML = '';
            this.fileList.style.opacity = '1';
        }, 200);
    }

    closeModal(modal) {
        modal.classList.add('d-none');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.converter = new ImageConverter();
    
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'o':
                    e.preventDefault();
                    document.getElementById('fileInput').click();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (!window.converter.isConverting && window.converter.files.length > 0) {
                        window.converter.startConversion();
                    }
                    break;
            }
        }
    });
    
    document.addEventListener('dragenter', (e) => e.preventDefault());
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());
    
    document.documentElement.style.scrollBehavior = 'smooth';
});