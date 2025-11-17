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
        
        this.initializeElements();
        this.bindEvents();
        this.renderHistory();
        this.renderPresets();
        this.updateSidebarStats();
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

    // Conversion mode handling
    handleModeChange(e) {
        this.conversionMode = e.target.value;
        
        const infoTexts = {
            'webp': 'Images will be converted to WebP format only',
            'resize': 'Images will be resized (keeps original format)',
            'both': 'Images will be resized AND converted to WebP for maximum savings!'
        };
        
        this.conversionModeInfo.textContent = infoTexts[this.conversionMode];
        
        // Show/hide quality and resize sections based on mode
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
    }

    // Aspect ratio handling
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
    }

    handleWidthChange(e) {
        this.targetWidth = parseInt(e.target.value) || 1920;
        
        if (this.maintainAspectRatio && this.files.length > 0) {
            // Calculate height based on first image's aspect ratio
            const firstFile = this.files[0];
            if (firstFile.originalDimensions) {
                const [width, height] = firstFile.originalDimensions.split('x').map(Number);
                const aspectRatio = height / width;
                this.targetHeight = Math.round(this.targetWidth * aspectRatio);
                this.heightInput.value = this.targetHeight;
            }
        }
    }

    handleHeightChange(e) {
        if (!this.maintainAspectRatio) {
            this.targetHeight = parseInt(e.target.value) || 1080;
        }
    }

    // URL upload methods
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

    // Preview panel methods
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

    // File handling
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
            ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
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
                
                // Initialize transform data for this file
                this.fileTransforms.set(fileObj.id, {
                    rotate: 0,
                    flipH: false,
                    flipV: false,
                    background: null
                });
            }
        });
        
        this.updateUI();
        this.updateRenamePreview();
        this.updateLivePreview();
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
            
            // Trigger mode change to show correct sections
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
                    ${transforms.rotate ? ` • Rotated ${transforms.rotate}°` : ''}
                    ${transforms.flipH ? ` • Flipped H` : ''}
                    ${transforms.flipV ? ` • Flipped V` : ''}
                    ${transforms.background ? ` • White BG` : ''}
                </div>
            `;
            
            this.fileList.appendChild(fileItem);
        });
        
        // Bind all button events
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
            const ext = this.conversionMode === 'resize' ? fileObj.name.split('.').pop() : 'webp';
            return `${this.renamePrefix}_${index + 1}.${ext}`;
        } else {
            if (fileObj.convertedToWebP) {
                return fileObj.name.replace(/\.(jpg|jpeg|png)$/i, '.webp');
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
        
        // Update statistics section
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
            
            // Store original dimensions
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
            
            // Apply individual transformations
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
            const mimeType = shouldConvertToWebP ? 'image/webp' : fileObj.file.type;
            const quality = shouldConvertToWebP ? this.quality : 0.92;
            
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

    // Duplicate detector
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

    // Preset system
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
        
        // Update UI elements
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

    // Changelog - COMPLETE CODE CHANGES
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
                old: `<!-- OLD VERSION - Basic Structure -->
<div class="upload-zone">
    <input type="file" id="fileInput">
</div>

<!-- Simple quality slider -->
<div class="quality-control">
    <input type="range" id="qualitySlider">
</div>

<!-- Basic buttons -->
<button id="convertBtn">Convert</button>
<button id="clearBtn">Clear</button>

<!-- Simple file list -->
<div class="file-list" id="fileList"></div>

<!-- No sidebar navigation -->
<!-- No live preview -->
<!-- No presets system -->
<!-- No changelog viewer -->`,
                new: `<!-- NEW VERSION - Advanced Features -->

<!-- Sidebar Navigation -->
<div class="sidebar" id="sidebar">
    <nav class="sidebar-nav">
        <a class="nav-item" data-section="converter">Converter</a>
        <a class="nav-item" data-section="history">History</a>
        <a class="nav-item" data-section="stats">Statistics</a>
        <a class="nav-item" data-section="presets">Presets</a>
        <a class="nav-item" data-section="changelog">Changelog</a>
    </nav>
</div>

<!-- Upload with URL support -->
<div class="upload-zone" id="uploadZone">
    <input type="file" id="fileInput" multiple>
</div>
<button class="btn-styled" id="toggleUrlUpload">Upload from URL</button>
<div class="url-upload-section" id="urlUploadSection">
    <input type="text" id="urlInput">
    <button id="urlAddBtn">Add URL</button>
</div>

<!-- Advanced Conversion Modes -->
<div class="quality-control">
    <div class="segmented-control">
        <input type="radio" name="conversionMode" id="modeWebpOnly" value="webp" checked>
        <label for="modeWebpOnly">WebP Only</label>
        
        <input type="radio" name="conversionMode" id="modeResizeOnly" value="resize">
        <label for="modeResizeOnly">Resize Only</label>
        
        <input type="radio" name="conversionMode" id="modeBoth" value="both">
        <label for="modeBoth">Both</label>
    </div>
    
    <!-- WebP Quality Section -->
    <div class="quality-section" id="qualitySection">
        <input type="range" id="qualitySlider" min="10" max="100" value="80">
    </div>
    
    <!-- Resize Section with Aspect Ratio -->
    <div class="resize-section" id="resizeSection">
        <button class="aspect-btn active" id="aspectRatioBtn">
            Maintain Aspect Ratio
        </button>
        <input type="number" id="widthInput" value="1920">
        <input type="number" id="heightInput" value="1080">
    </div>
    
    <!-- Batch Rename -->
    <div class="batch-rename-section">
        <input type="text" id="renamePrefix" placeholder="prefix">
    </div>
    
    <!-- Save Preset Button -->
    <button class="btn-styled" id="savePresetBtn">
        Save Current Settings as Preset
    </button>
</div>

<!-- Enhanced Action Buttons -->
<div class="action-buttons">
    <button class="btn-custom" id="convertBtn">Start Conversion</button>
    <button class="btn-custom btn-secondary" id="clearBtn">Clear All</button>
    <button class="btn-custom btn-success" id="downloadAllBtn">Download ZIP</button>
</div>

<!-- Bulk Actions -->
<div class="bulk-actions">
    <button id="sortBySizeBtn">Sort by Size</button>
    <button id="sortBySavingsBtn">Sort by Savings</button>
    <button id="removeFailedBtn">Remove Failed</button>
    <button id="duplicateDetectorBtn">Find Duplicates</button>
</div>

<!-- Enhanced File List with Tools -->
<div class="file-list" id="fileList">
    <!-- Each file now has: -->
    <div class="file-item">
        <div class="file-actions">
            <button class="tool-btn" title="Rotate">🔄</button>
            <button class="tool-btn" title="Flip H">↔️</button>
            <button class="tool-btn" title="Flip V">↕️</button>
            <button class="tool-btn" title="Background">🎨</button>
            <button class="reset-btn" title="Reset">↩️</button>
            <button class="preview-btn" title="Preview">👁️</button>
            <button class="download-btn" title="Download">⬇️</button>
            <button class="remove-btn" title="Remove">❌</button>
        </div>
    </div>
</div>

<!-- Live Preview Panel -->
<div class="live-preview-panel" id="livePreviewPanel">
    <div class="preview-panel-content" id="previewPanelContent">
        <!-- Before/after previews with transforms -->
    </div>
</div>
<button class="reopen-preview-btn" id="reopenPreviewBtn">
    Open Live Preview
</button>

<!-- History Section -->
<div class="content-section" id="historySection">
    <div class="section-header-centered">
        <h2>Conversion History</h2>
        <button class="btn-styled btn-danger" id="clearHistoryBtn">
            Clear History
        </button>
    </div>
    <div class="history-list" id="historyList"></div>
</div>

<!-- Statistics Dashboard -->
<div class="content-section" id="statsSection">
    <div class="section-header-centered">
        <h2>Statistics</h2>
    </div>
    <div class="stats-dashboard">
        <div class="dashboard-card">Total Conversions</div>
        <div class="dashboard-card">Space Saved</div>
        <div class="dashboard-card">Average Savings</div>
    </div>
</div>

<!-- Presets System -->
<div class="content-section" id="presetsSection">
    <div class="section-header-centered">
        <h2>Saved Presets</h2>
    </div>
    <div class="presets-grid" id="presetsGrid">
        <!-- Preset cards with load/delete buttons -->
    </div>
</div>

<!-- Changelog Viewer -->
<div class="content-section" id="changelogSection">
    <div class="section-header-centered">
        <h2>Changelog</h2>
    </div>
    <div class="changelog-container">
        <div class="changelog-buttons">
            <button class="changelog-btn" data-file="html">HTML Changes</button>
            <button class="changelog-btn" data-file="scss">SCSS Changes</button>
            <button class="changelog-btn" data-file="js">JS Changes</button>
        </div>
        <div class="changelog-viewer">
            <div class="changelog-split">
                <div class="changelog-side old">
                    <pre id="changelogOld"></pre>
                </div>
                <div class="changelog-side new">
                    <pre id="changelogNew"></pre>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modals -->
<div class="preset-modal" id="presetModal">
    <input type="text" id="presetNameInput">
    <button id="confirmSavePreset">Save</button>
</div>

<div class="duplicate-modal" id="duplicateModal">
    <div id="duplicateResults"></div>
</div>`
            },
            'scss': {
                old: `// OLD VERSION - Basic Styling
.upload-zone {
    border: 2px dashed #ccc;
    padding: 2rem;
}

.quality-slider {
    width: 100%;
}

button {
    padding: 0.5rem 1rem;
    background: blue;
    color: white;
}

.file-list {
    display: flex;
    flex-direction: column;
}

.file-item {
    padding: 1rem;
    border: 1px solid #ddd;
}`,
                new: `// NEW VERSION - Professional Design System

// Variables
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

// Mixins
@mixin glassmorphism {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
}

@mixin button-glow($color: $primary-color) {
    box-shadow: 0 0 20px rgba($color, 0.3);
    &:hover {
        box-shadow: 0 0 30px rgba($color, 0.5);
    }
}

// Styled Buttons - NEW
.btn-styled {
    background: $primary-gradient !important;
    border: none;
    border-radius: 12px;
    padding: 0.8rem 1.5rem;
    color: white !important;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    @include button-glow();
    
    &:hover {
        transform: translateY(-3px);
    }
    
    &.btn-danger {
        background: $danger-gradient !important;
    }
}

// Sidebar Navigation
.sidebar {
    position: fixed;
    width: 280px;
    height: 100vh;
    background: linear-gradient(180deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95));
    backdrop-filter: blur(20px);
    transition: left 0.3s ease;
    
    .sidebar-nav {
        .nav-item {
            display: flex;
            align-items: center;
            padding: 1rem 1.5rem;
            color: rgba(255, 255, 255, 0.8);
            transition: all 0.3s ease;
            
            &:hover {
                background: rgba(255, 255, 255, 0.1);
                padding-left: 2rem;
            }
            
            &.active {
                background: rgba(255, 255, 255, 0.15);
                border-left: 3px solid white;
            }
        }
    }
}

// Enhanced Upload Zone
.upload-zone {
    @include glassmorphism;
    border: 3px dashed rgba(255, 255, 255, 0.4);
    border-radius: 20px;
    padding: 4rem 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-5px);
        border-color: rgba(255, 255, 255, 0.8);
        @include button-glow(#ffffff);
    }
    
    &.dragover {
        border-color: #4facfe;
        transform: scale(1.02);
    }
}

// Segmented Control for Modes
.segmented-control {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    
    label {
        background: rgba(255, 255, 255, 0.8);
        padding: 1.5rem 1rem;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }
    }
    
    input:checked + label {
        background: $primary-gradient;
        color: white;
        transform: scale(1.05);
    }
}

// Aspect Ratio Toggle
.aspect-ratio-toggle {
    .aspect-btn {
        &.active {
            background: $primary-gradient;
            color: white;
            i { transform: rotate(0deg); }
        }
        &:not(.active) {
            i { transform: rotate(45deg); }
        }
    }
}

// Tool Buttons with Tooltips
.tool-btn, .preview-btn, .download-btn, .remove-btn, .reset-btn {
    background: rgba(255, 255, 255, 0.8);
    border: 2px solid transparent;
    border-radius: 8px;
    width: 36px;
    height: 36px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        
        // Tooltip on hover
        &::after {
            content: attr(title);
            position: absolute;
            bottom: 100%;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 0.4rem 0.8rem;
            border-radius: 6px;
            font-size: 0.75rem;
            white-space: nowrap;
        }
    }
    
    &.active {
        background: $primary-gradient;
        color: white;
    }
}

// Live Preview Panel
.live-preview-panel {
    width: 400px;
    position: sticky;
    top: 2rem;
    height: calc(100vh - 4rem);
    
    .preview-item-card {
        @include glassmorphism;
        border-radius: 12px;
        padding: 1rem;
        transition: all 0.3s ease;
        
        &:hover {
            border-color: $primary-color;
            transform: translateY(-2px);
        }
    }
}

// Centered Section Headers
.section-header-centered {
    text-align: center;
    margin-bottom: 3rem;
    
    h2 {
        font-size: 2.5rem;
        font-weight: 700;
        color: white;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }
}

// Presets Grid
.presets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    
    .preset-card {
        @include glassmorphism;
        border-radius: 20px;
        padding: 2rem;
        transition: all 0.3s ease;
        
        &:hover {
            transform: translateY(-8px);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }
    }
}

// Changelog Container - WHITE BACKGROUND
.changelog-container {
    padding: 2rem;
    background: white;
    border-radius: 20px;
    
    .changelog-viewer {
        .changelog-content {
            background: white;
            border: 2px solid #e0e0e0;
            
            .changelog-split {
                display: grid;
                grid-template-columns: 1fr 1fr;
                
                .changelog-side {
                    background: white;
                    padding: 2rem;
                    max-height: 70vh;
                    overflow-y: auto;
                    
                    &.old {
                        border-right: 2px solid #e0e0e0;
                        .side-label { color: #d32f2f; }
                        pre { color: #d32f2f; }
                    }
                    
                    &.new {
                        .side-label { color: #388e3c; }
                        pre { color: #388e3c; }
                    }
                }
            }
        }
    }
}

// Close Changelog Button
.btn-changelog-close {
    background: $danger-gradient;
    border: none;
    border-radius: 10px;
    padding: 0.8rem 1.5rem;
    color: white;
    font-weight: 600;
    cursor: pointer;
    @include button-glow($danger-color);
    
    &:hover {
        transform: translateY(-3px);
    }
}

// Reopen Preview Button
.reopen-preview-btn {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: $primary-gradient;
    border-radius: 50px;
    padding: 1rem 2rem;
    color: white;
    @include button-glow();
    z-index: 1000;
    
    &:hover {
        transform: translateY(-5px) scale(1.05);
    }
}`
            },
            'js': {
                old: `// OLD VERSION - Basic Functionality
class ImageConverter {
    constructor() {
        this.files = [];
        this.quality = 0.8;
    }
    
    handleFileSelect(e) {
        const files = e.target.files;
        this.files.push(...files);
    }
    
    async convertFile(file) {
        const canvas = document.createElement('canvas');
        // Simple conversion
        canvas.toBlob(blob => {
            // Download blob
        }, 'image/webp', this.quality);
    }
}`,
                new: `// NEW VERSION - Advanced Features
class ImageConverter {
    constructor() {
        this.files = [];
        this.quality = 0.8;
        this.conversionMode = 'webp'; // NEW: webp/resize/both
        this.targetWidth = 1920; // NEW
        this.targetHeight = 1080; // NEW
        this.maintainAspectRatio = true; // NEW
        this.fileTransforms = new Map(); // NEW: Individual transforms
        this.history = this.loadHistory(); // NEW
        this.presets = this.loadPresets(); // NEW
        this.urlList = []; // NEW
    }
    
    // NEW: Conversion Mode Handling
    handleModeChange(e) {
        this.conversionMode = e.target.value;
        
        if (this.conversionMode === 'webp') {
            this.qualitySection.classList.remove('d-none');
            this.resizeSection.classList.add('d-none');
        } else if (this.conversionMode === 'resize') {
            this.qualitySection.classList.add('d-none');
            this.resizeSection.classList.remove('d-none');
        } else {
            // Both sections visible
            this.qualitySection.classList.remove('d-none');
            this.resizeSection.classList.remove('d-none');
        }
    }
    
    // NEW: Aspect Ratio Toggle
    toggleAspectRatio() {
        this.maintainAspectRatio = !this.maintainAspectRatio;
        
        if (this.maintainAspectRatio) {
            this.heightInput.disabled = true;
            // Auto-calculate height
        } else {
            this.heightInput.disabled = false;
        }
    }
    
    // NEW: Width Change Handler
    handleWidthChange(e) {
        this.targetWidth = parseInt(e.target.value);
        
        if (this.maintainAspectRatio && this.files.length > 0) {
            const firstFile = this.files[0];
            const [width, height] = firstFile.originalDimensions.split('x');
            const aspectRatio = height / width;
            this.targetHeight = Math.round(this.targetWidth * aspectRatio);
            this.heightInput.value = this.targetHeight;
        }
    }
    
    // NEW: Individual Image Tools
    applyIndividualTool(fileId, tool) {
        const transforms = this.fileTransforms.get(fileId);
        
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
        this.updateLivePreview(); // Update preview in real-time
    }
    
    // NEW: Reset Transforms
    resetFileTransforms(fileId) {
        const transforms = this.fileTransforms.get(fileId);
        transforms.rotate = 0;
        transforms.flipH = false;
        transforms.flipV = false;
        transforms.background = null;
        
        this.renderFileList();
        this.updateLivePreview();
    }
    
    // NEW: Live Preview with Transforms
    async updateLivePreview() {
        const previewsHTML = await Promise.all(
            this.files.slice(0, 10).map(async (fileObj) => {
                const originalUrl = await this.fileToDataUrl(fileObj.file);
                const previewUrl = await this.generatePreviewWithTransforms(fileObj);
                
                return \`
                    <div class="preview-item-card">
                        <div class="preview-images">
                            <img src="\${originalUrl}" alt="Original">
                            <img src="\${previewUrl}" alt="With Transforms">
                        </div>
                    </div>
                \`;
            })
        );
        
        this.previewPanelContent.innerHTML = previewsHTML.join('');
    }
    
    // NEW: Generate Preview with Transforms
    async generatePreviewWithTransforms(fileObj) {
        const transforms = this.fileTransforms.get(fileObj.id);
        
        return new Promise(async (resolve) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = () => {
                // Apply rotation
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
            
            img.src = await this.fileToDataUrl(fileObj.file);
        });
    }
    
    // NEW: Enhanced Conversion
    async convertFile(fileObj, index) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        // Load image
        img.src = await this.fileToDataUrl(fileObj.file);
        await new Promise(resolve => img.onload = resolve);
        
        // Store original dimensions
        fileObj.originalDimensions = \`\${img.width}x\${img.height}\`;
        
        // Calculate target dimensions
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
        
        // Apply transforms
        const transforms = this.fileTransforms.get(fileObj.id);
        
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
        
        // Convert to blob
        const shouldConvertToWebP = this.conversionMode === 'webp' || this.conversionMode === 'both';
        const mimeType = shouldConvertToWebP ? 'image/webp' : fileObj.file.type;
        const quality = shouldConvertToWebP ? this.quality : 0.92;
        
        await new Promise(resolve => {
            canvas.toBlob(blob => {
                fileObj.convertedBlob = blob;
                fileObj.convertedSize = blob.size;
                fileObj.savings = Math.round(((fileObj.size - blob.size) / fileObj.size) * 100);
                fileObj.status = 'completed';
                resolve();
            }, mimeType, quality);
        });
    }
    
    // NEW: URL Upload
    async addUrlToList() {
        const url = this.urlInput.value.trim();
        if (!url) return;
        
        this.urlList.push(url);
        await this.downloadImageFromUrl(url);
    }
    
    async downloadImageFromUrl(url) {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], url.split('/').pop(), { type: blob.type });
        this.addFiles([file]);
    }
    
    // NEW: Preset System
    savePreset() {
        const preset = {
            id: Date.now(),
            name: this.presetNameInput.value,
            conversionMode: this.conversionMode,
            quality: this.quality,
            targetWidth: this.targetWidth,
            targetHeight: this.targetHeight,
            maintainAspectRatio: this.maintainAspectRatio
        };
        
        this.presets.push(preset);
        localStorage.setItem('converterPresets', JSON.stringify(this.presets));
    }
    
    applyPreset(presetId) {
        const preset = this.presets.find(p => p.id === presetId);
        this.conversionMode = preset.conversionMode;
        this.quality = preset.quality;
        this.targetWidth = preset.targetWidth;
        this.targetHeight = preset.targetHeight;
        this.maintainAspectRatio = preset.maintainAspectRatio;
        
        // Update UI
        this.handleModeChange({ target: { value: preset.conversionMode } });
    }
    
    // NEW: History Management
    saveToHistory() {
        const historyItem = {
            date: new Date().toISOString(),
            fileCount: this.files.length,
            totalSavings: this.calculateTotalSavings(),
            originalSize: this.totalOriginalSize,
            convertedSize: this.totalConvertedSize
        };
        
        this.history.unshift(historyItem);
        localStorage.setItem('converterHistory', JSON.stringify(this.history));
    }
    
    // NEW: Duplicate Detector
    async scanForDuplicates() {
        const duplicates = [];
        const seen = new Map();
        
        for (const file of this.files) {
            const key = \`\${file.name}-\${file.size}\`;
            if (seen.has(key)) {
                duplicates.push(file);
            } else {
                seen.set(key, file);
            }
        }
        
        return duplicates;
    }
}`
            }
        };
        
        this.changelogOld.textContent = changes[file].old;
        this.changelogNew.textContent = changes[file].new;
    }

    // History methods
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
    
    // Keyboard shortcuts
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