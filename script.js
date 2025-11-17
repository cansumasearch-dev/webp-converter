class ImageConverter {
    constructor() {
        this.files = [];
        this.quality = 0.8;
        this.conversionMode = 'webp';
        this.targetWidth = 1000;
        this.isConverting = false;
        this.totalOriginalSize = 0;
        this.totalConvertedSize = 0;
        this.renamePrefix = '';
        this.preserveExif = false;
        this.history = this.loadHistory();
        this.urlList = [];
        this.rotateAngle = 0;
        this.flipH = false;
        this.flipV = false;
        this.bgRemovalOptions = { enabled: false, option: 'transparent', customColor: '#ffffff' };
        
        this.initializeElements();
        this.bindEvents();
        this.renderHistory();
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
        
        // Radio buttons
        this.modeWebpOnly = document.getElementById('modeWebpOnly');
        this.modeResizeOnly = document.getElementById('modeResizeOnly');
        this.modeBoth = document.getElementById('modeBoth');
        
        // Rename & EXIF
        this.renameInput = document.getElementById('renamePrefix');
        this.renamePreview = document.getElementById('renamePreview');
        this.preserveExifToggle = document.getElementById('preserveExif');
        
        // Bulk action buttons
        this.sortBySizeBtn = document.getElementById('sortBySizeBtn');
        this.sortBySavingsBtn = document.getElementById('sortBySavingsBtn');
        this.removeFailedBtn = document.getElementById('removeFailedBtn');
        this.reconvertFailedBtn = document.getElementById('reconvertFailedBtn');
        
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
        
        // Tool inline controls
        this.toolBtns = document.querySelectorAll('.tool-btn');
        this.rotateToolBtn = document.getElementById('rotateToolBtn');
        this.rotateControls = document.getElementById('rotateControls');
        this.applyRotateBtn = document.getElementById('applyRotateBtn');
        
        this.bgRemovalToolBtn = document.getElementById('bgRemovalToolBtn');
        this.bgControls = document.getElementById('bgControls');
        this.bgOption = document.getElementById('bgOption');
        this.customBgColor = document.getElementById('customBgColor');
        this.customColorGroup = document.getElementById('customColorGroup');
        this.applyBgBtn = document.getElementById('applyBgBtn');
        
        this.qualityCompareBtn = document.getElementById('qualityCompareBtn');
        this.qualityControls = document.getElementById('qualityControls');
        this.applyQualityBtn = document.getElementById('applyQualityBtn');
        
        this.duplicateDetectorBtn = document.getElementById('duplicateDetectorBtn');
        this.duplicateControls = document.getElementById('duplicateControls');
        this.scanDuplicatesBtn = document.getElementById('scanDuplicatesBtn');
        this.duplicateResults = document.getElementById('duplicateResults');
    }

    bindEvents() {
        // Upload events
        this.uploadZone.addEventListener('click', () => this.fileInput.click());
        this.uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadZone.addEventListener('drop', this.handleDrop.bind(this));
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        
        // Control events
        this.qualitySlider.addEventListener('input', this.handleQualityChange.bind(this));
        this.modeWebpOnly.addEventListener('change', this.handleModeChange.bind(this));
        this.modeResizeOnly.addEventListener('change', this.handleModeChange.bind(this));
        this.modeBoth.addEventListener('change', this.handleModeChange.bind(this));
        
        this.convertBtn.addEventListener('click', this.startConversion.bind(this));
        this.clearBtn.addEventListener('click', this.clearAll.bind(this));
        this.downloadAllBtn.addEventListener('click', this.downloadAll.bind(this));
        
        this.renameInput.addEventListener('input', this.handleRenameInput.bind(this));
        this.preserveExifToggle.addEventListener('change', this.handleExifToggle.bind(this));
        
        // Bulk actions
        this.sortBySizeBtn.addEventListener('click', () => this.sortFiles('size'));
        this.sortBySavingsBtn.addEventListener('click', () => this.sortFiles('savings'));
        this.removeFailedBtn.addEventListener('click', this.removeFailed.bind(this));
        this.reconvertFailedBtn.addEventListener('click', this.reconvertFailed.bind(this));
        
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
            if (this.urlUploadSection.style.display === 'none') {
                this.urlUploadSection.style.display = 'block';
            } else {
                this.urlUploadSection.style.display = 'none';
            }
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
        
        // Tool inline control events
        this.toolBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tool = btn.getAttribute('data-tool');
                this.toggleToolControls(tool, btn);
            });
        });
        
        // Rotate & Flip controls
        document.querySelectorAll('[data-rotate]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('[data-rotate]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.rotateAngle = parseInt(btn.getAttribute('data-rotate'));
                this.updateLivePreview();
            });
        });
        
        document.querySelectorAll('[data-flip]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const flipType = btn.getAttribute('data-flip');
                btn.classList.toggle('active');
                if (flipType === 'horizontal') {
                    this.flipH = !this.flipH;
                } else {
                    this.flipV = !this.flipV;
                }
                this.updateLivePreview();
            });
        });
        
        this.applyRotateBtn.addEventListener('click', () => {
            this.applyToolToAll('rotate');
        });
        
        // Background removal controls
        this.bgOption.addEventListener('change', this.handleBgOptionChange.bind(this));
        this.customBgColor.addEventListener('change', () => this.updateLivePreview());
        this.applyBgBtn.addEventListener('click', () => {
            this.bgRemovalOptions = {
                enabled: true,
                option: this.bgOption.value,
                customColor: this.customBgColor.value
            };
            this.updateLivePreview();
        });
        
        // Quality comparison controls
        document.querySelectorAll('[data-quality]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                btn.classList.toggle('active');
            });
        });
        
        this.applyQualityBtn.addEventListener('click', () => {
            this.showQualityComparison();
        });
        
        // Duplicate detection
        this.scanDuplicatesBtn.addEventListener('click', this.scanForDuplicates.bind(this));
    }

    // Toggle preview panel
    togglePreviewPanel() {
        this.livePreviewPanel.classList.toggle('d-none');
    }
    
    // Toggle tool controls
    toggleToolControls(tool, btn) {
        const allTools = ['rotate', 'background', 'quality', 'duplicate'];
        const toolControlsMap = {
            'rotate': this.rotateControls,
            'background': this.bgControls,
            'quality': this.qualityControls,
            'duplicate': this.duplicateControls
        };
        
        // Toggle all tool buttons
        this.toolBtns.forEach(b => {
            const btnIcon = b.querySelector('i');
            const btnText = b.querySelector('span');
            if (b === btn) {
                b.classList.toggle('active');
                if (b.classList.contains('active')) {
                    btnIcon.className = 'fas fa-chevron-up me-2';
                    btnText.textContent = 'Close Tool';
                } else {
                    btnIcon.className = 'fas fa-chevron-down me-2';
                    btnText.textContent = 'Open Tool';
                }
            } else {
                b.classList.remove('active');
                const icon = b.querySelector('i');
                const text = b.querySelector('span');
                if (icon && text) {
                    icon.className = 'fas fa-chevron-down me-2';
                    text.textContent = 'Open Tool';
                }
            }
        });
        
        // Toggle corresponding controls
        allTools.forEach(t => {
            if (t === tool) {
                toolControlsMap[t].classList.toggle('active');
            } else {
                toolControlsMap[t].classList.remove('active');
            }
        });
        
        // Update live preview if files exist
        if (this.files.length > 0) {
            this.updateLivePreview();
        }
    }
    
    // Update live preview panel
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
        
        // Show preview panel if hidden
        this.livePreviewPanel.classList.remove('d-none');
        
        // Generate previews for all files
        const previewsHTML = await Promise.all(
            this.files.map(async (fileObj, index) => {
                const originalUrl = await this.fileToDataUrl(fileObj.file);
                const processedUrl = await this.generateProcessedPreview(fileObj);
                
                const originalSize = this.formatFileSize(fileObj.size);
                const processedSize = processedUrl ? 'Processing...' : originalSize;
                
                return `
                    <div class="preview-item-card">
                        <div class="preview-item-name">${fileObj.name}</div>
                        <div class="preview-images">
                            <div class="preview-image-wrapper">
                                <div class="preview-label">Original</div>
                                <img src="${originalUrl}" alt="Original" class="preview-img">
                                <div class="preview-size">${originalSize}</div>
                            </div>
                            <div class="preview-image-wrapper">
                                <div class="preview-label">Processed</div>
                                <img src="${processedUrl || originalUrl}" alt="Processed" class="preview-img">
                                <div class="preview-size">${processedSize}</div>
                            </div>
                        </div>
                    </div>
                `;
            })
        );
        
        this.previewPanelContent.innerHTML = previewsHTML.join('');
    }
    
    // Generate processed preview
    async generateProcessedPreview(fileObj) {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            const originalUrl = await this.fileToDataUrl(fileObj.file);
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = originalUrl;
            });
            
            let width = img.width;
            let height = img.height;
            
            // Apply resize if needed
            if ((this.conversionMode === 'resize' || this.conversionMode === 'both') && width > this.targetWidth) {
                const aspectRatio = height / width;
                width = this.targetWidth;
                height = Math.round(this.targetWidth * aspectRatio);
            }
            
            // Apply rotation/flip
            if (this.rotateAngle === 90 || this.rotateAngle === 270) {
                canvas.width = height;
                canvas.height = width;
            } else {
                canvas.width = width;
                canvas.height = height;
            }
            
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(this.rotateAngle * Math.PI / 180);
            if (this.flipH) ctx.scale(-1, 1);
            if (this.flipV) ctx.scale(1, -1);
            ctx.drawImage(img, -width / 2, -height / 2, width, height);
            ctx.restore();
            
            return canvas.toDataURL('image/webp', this.quality);
        } catch (error) {
            console.error('Preview generation error:', error);
            return null;
        }
    }
    
    // Apply tool to all files
    async applyToolToAll(toolType) {
        // Tool is already applied via the state variables
        // Just show a confirmation
        const toolNames = {
            'rotate': 'Rotation/Flip',
            'background': 'Background Removal',
            'quality': 'Quality'
        };
        
        alert(`${toolNames[toolType]} settings will be applied during conversion!`);
        this.updateLivePreview();
    }
    
    // Show quality comparison
    async showQualityComparison() {
        if (this.files.length === 0) {
            alert('Please upload images first');
            return;
        }
        
        const activeQualities = [];
        document.querySelectorAll('[data-quality].active').forEach(btn => {
            activeQualities.push(parseInt(btn.getAttribute('data-quality')));
        });
        
        if (activeQualities.length === 0) {
            alert('Please select at least one quality level');
            return;
        }
        
        this.previewPanelContent.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea;"></i><p>Generating quality comparison...</p></div>';
        
        const fileObj = this.files[0];
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            img.src = e.target.result;
            await new Promise(resolve => { img.onload = resolve; });
            
            const comparisons = await Promise.all(
                activeQualities.map(async quality => {
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.min(img.width, 400);
                    canvas.height = Math.round((canvas.width / img.width) * img.height);
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    const blob = await new Promise(resolve => {
                        canvas.toBlob(resolve, 'image/webp', quality / 100);
                    });
                    
                    return {
                        quality: quality,
                        url: canvas.toDataURL('image/webp', quality / 100),
                        size: this.formatFileSize(blob.size)
                    };
                })
            );
            
            this.previewPanelContent.innerHTML = comparisons.map(comp => `
                <div class="preview-item-card">
                    <div class="preview-item-name">Quality: ${comp.quality}%</div>
                    <div class="preview-images">
                        <div class="preview-image-wrapper" style="grid-column: 1 / -1;">
                            <img src="${comp.url}" alt="Quality ${comp.quality}%" class="preview-img">
                            <div class="preview-size">${comp.size}</div>
                        </div>
                    </div>
                </div>
            `).join('');
        };
        
        reader.readAsDataURL(fileObj.file);
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

    // URL upload methods
    addUrlToList() {
        const url = this.urlInput.value.trim();
        if (!url) return;
        
        // Basic URL validation
        try {
            new URL(url);
        } catch {
            alert('Please enter a valid URL');
            return;
        }
        
        this.urlList.push(url);
        this.renderUrlList();
        this.urlInput.value = '';
        
        // Download image from URL
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
            
            // Remove from URL list
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
        
        // Bind remove buttons
        this.urlListEl.querySelectorAll('.url-remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-url-index'));
                this.urlList.splice(index, 1);
                this.renderUrlList();
            });
        });
    }

    handleBgOptionChange(e) {
        if (e.target.value === 'custom') {
            this.customColorGroup.style.display = 'block';
        } else {
            this.customColorGroup.style.display = 'none';
        }
    }

    async scanForDuplicates() {
        if (this.files.length < 2) {
            this.duplicateResults.innerHTML = '<p class="text-center">You need at least 2 images to detect duplicates</p>';
            return;
        }
        
        this.duplicateResults.innerHTML = '<p class="text-center"><i class="fas fa-spinner fa-spin me-2"></i>Scanning for duplicates...</p>';
        
        // Simple duplicate detection based on file size and name
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
                <p class="text-center text-warning"><i class="fas fa-exclamation-triangle me-2"></i>Found ${duplicates.length} duplicate(s)</p>
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
        this.files = this.files.filter(file => {
            const key = `${file.name}-${file.size}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
        
        this.updateUI();
        this.updateLivePreview();
        alert('Duplicates removed!');
        this.scanForDuplicates(); // Refresh the duplicate detection results
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
            }
        });
        
        this.updateUI();
        this.updateRenamePreview();
        this.updateLivePreview(); // Trigger live preview update
    }

    handleQualityChange(e) {
        this.quality = e.target.value / 100;
        this.qualityValue.textContent = e.target.value + '%';
    }

    handleModeChange(e) {
        this.conversionMode = e.target.value;
        
        const infoTexts = {
            'webp': 'Images will be converted to WebP format only',
            'resize': 'Images will be resized to 1000px width (keeps original format)',
            'both': 'Images will be resized AND converted to WebP for maximum savings!'
        };
        
        this.conversionModeInfo.textContent = infoTexts[this.conversionMode];
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
            
            const downloadBtn = fileObj.status === 'completed' 
                ? `<button class="download-btn" data-file-id="${fileObj.id}">
                     <i class="fas fa-download me-1"></i>Download
                   </button>` 
                : '';
            
            const previewBtn = fileObj.status === 'completed' 
                ? `<button class="preview-btn" data-file-id="${fileObj.id}">
                     <i class="fas fa-eye me-1"></i>Preview
                   </button>` 
                : '';
            
            const finalName = this.getFinalFileName(fileObj, index);
            
            const fileItem = document.createElement('div');
            fileItem.className = `file-item ${fileObj.status}`;
            fileItem.innerHTML = `
                <div class="file-header">
                    <div class="file-name">${fileObj.name}${finalName !== fileObj.name ? ` → ${finalName}` : ''}</div>
                    <div class="file-actions">
                        ${savingsText}
                        <i class="${statusIcon}"></i>
                        ${previewBtn}
                        ${downloadBtn}
                    </div>
                </div>
                <div class="file-details">
                    ${this.formatFileSize(fileObj.size)}
                    ${fileObj.convertedSize > 0 ? ` → ${this.formatFileSize(fileObj.convertedSize)}` : ''}
                    ${fileObj.originalDimensions && fileObj.newDimensions && fileObj.originalDimensions !== fileObj.newDimensions ? 
                        ` • ${fileObj.originalDimensions} → ${fileObj.newDimensions}` : 
                        fileObj.originalDimensions ? ` • ${fileObj.originalDimensions}` : ''}
                </div>
            `;
            
            this.fileList.appendChild(fileItem);
        });
        
        // Bind button events
        this.fileList.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fileId = e.currentTarget.getAttribute('data-file-id');
                this.downloadFile(fileId);
            });
        });
        
        this.fileList.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fileId = e.currentTarget.getAttribute('data-file-id');
                this.showPreview(fileId);
            });
        });
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
        
        // Save to history
        this.saveToHistory();
    }

    async convertFile(fileObj, index) {
        try {
            fileObj.status = 'processing';
            this.updateUI();
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            // Store original as data URL for preview
            const originalDataUrl = await this.fileToDataUrl(fileObj.file);
            fileObj.originalDataUrl = originalDataUrl;
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = originalDataUrl;
            });
            
            let canvasWidth = img.width;
            let canvasHeight = img.height;
            const shouldResize = this.conversionMode === 'resize' || this.conversionMode === 'both';
            
            if (shouldResize && img.width > this.targetWidth) {
                const aspectRatio = img.height / img.width;
                canvasWidth = this.targetWidth;
                canvasHeight = Math.round(this.targetWidth * aspectRatio);
            }
            
            // Apply rotation/flip
            if (this.rotateAngle !== 0 || this.flipH || this.flipV) {
                canvas.width = this.rotateAngle === 90 || this.rotateAngle === 270 ? canvasHeight : canvasWidth;
                canvas.height = this.rotateAngle === 90 || this.rotateAngle === 270 ? canvasWidth : canvasHeight;
                
                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(this.rotateAngle * Math.PI / 180);
                if (this.flipH) ctx.scale(-1, 1);
                if (this.flipV) ctx.scale(1, -1);
                ctx.drawImage(img, -canvasWidth / 2, -canvasHeight / 2, canvasWidth, canvasHeight);
                ctx.restore();
            } else {
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
            }
            
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
                    fileObj.originalDimensions = `${img.width}x${img.height}`;
                    fileObj.newDimensions = `${canvasWidth}x${canvasHeight}`;
                    fileObj.convertedToWebP = shouldConvertToWebP;
                    
                    // Store converted as data URL for preview
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
        const fileObj = this.files.find(f => f.id == fileId);
        if (!fileObj || !fileObj.convertedDataUrl) return;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'preview-modal active';
        modal.innerHTML = `
            <div class="preview-content">
                <button class="close-preview">&times;</button>
                <div class="preview-header">
                    <h3>Before & After Comparison</h3>
                    <p>${fileObj.name}</p>
                </div>
                <div class="preview-comparison">
                    <div class="preview-item">
                        <div class="preview-label">Original</div>
                        <img src="${fileObj.originalDataUrl}" alt="Original" class="preview-image">
                        <div class="preview-stats">
                            <div class="stat-line">Size: ${this.formatFileSize(fileObj.size)}</div>
                            <div class="stat-line">Dimensions: ${fileObj.originalDimensions}</div>
                        </div>
                    </div>
                    <div class="preview-item">
                        <div class="preview-label">Converted</div>
                        <img src="${fileObj.convertedDataUrl}" alt="Converted" class="preview-image">
                        <div class="preview-stats">
                            <div class="stat-line">Size: ${this.formatFileSize(fileObj.convertedSize)}</div>
                            <div class="stat-line">Dimensions: ${fileObj.newDimensions}</div>
                            <div class="stat-line" style="color: #28a745; font-weight: 600;">Saved: ${fileObj.savings}%</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close button
        modal.querySelector('.close-preview').addEventListener('click', () => {
            modal.remove();
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    downloadFile(fileId) {
        const fileObj = this.files.find(f => f.id == fileId);
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
                const fileName = this.getFinalFileName(fileObj, index);
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
            this.historyList.innerHTML = '<p class="text-center text-muted">No conversion history yet. Start converting images!</p>';
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
        this.rotateAngle = 0;
        this.flipH = false;
        this.flipV = false;
        this.bgRemovalOptions = { enabled: false, option: 'transparent', customColor: '#ffffff' };
        this.urlList = [];
        this.renderUrlList();
        this.hideElement(this.downloadAllBtn);
        this.fileInput.value = '';
        this.updateUI();
        this.updateRenamePreview();
        this.updateLivePreview(); // Reset live preview
        
        // Reset tool controls
        document.querySelectorAll('[data-rotate], [data-flip], [data-quality]').forEach(btn => {
            btn.classList.remove('active');
        });
        
        this.fileList.style.opacity = '0';
        setTimeout(() => {
            this.fileList.innerHTML = '';
            this.fileList.style.opacity = '1';
        }, 200);
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