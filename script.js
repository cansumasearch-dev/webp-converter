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
        
        this.fileTransforms = new Map();
        
        this.pagespeedStrategy = 'mobile';
        this.previousPageSpeedResults = this.loadPreviousPageSpeed();
        this.currentPageSpeedData = {
            mobile: null,
            desktop: null
        };
        this.isAnalyzingPageSpeed = false;
        
        this.githubRepo = 'cansumasearch-dev/webp-converter';
        this.changelogCache = this.loadChangelogCache();
        this.changelogFetched = false;
        
        this.initializeElements();
        this.bindEvents();
        this.renderHistory();
        this.renderPresets();
        this.updateSidebarStats();
        this.initializeNotifications();
        this.restoreLastSection();
    }

    saveCurrentSection(sectionName) {
        localStorage.setItem('lastActiveSection', sectionName);
        this.updateLivePreviewVisibility(sectionName);
        
        if (sectionName === 'changelog' && !this.changelogFetched) {
            setTimeout(() => {
                this.autoFetchChangelog();
            }, 500);
        }
    }

    updateLivePreviewVisibility(sectionName) {
        if (sectionName === 'converter') {
            if (this.files.length > 0 && !this.livePreviewPanel.classList.contains('d-none')) {
                this.livePreviewPanel.style.display = 'block';
            }
        } else {
            this.livePreviewPanel.style.display = 'none';
            this.reopenPreviewBtn.style.display = 'none';
        }
    }

    restoreLastSection() {
        const lastSection = localStorage.getItem('lastActiveSection') || 'converter';
        this.switchSection(lastSection);
    }

    loadChangelogCache() {
        const cached = localStorage.getItem('changelogCache');
        return cached ? JSON.parse(cached) : null;
    }

    saveChangelogCache(data) {
        localStorage.setItem('changelogCache', JSON.stringify(data));
        this.changelogCache = data;
    }

    initializeElements() {
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
        
        this.totalFilesEl = document.getElementById('totalFiles');
        this.completedFilesEl = document.getElementById('completedFiles');
        this.remainingFilesEl = document.getElementById('remainingFiles');
        this.totalSavingsEl = document.getElementById('totalSavings');
        
        this.modeWebpOnly = document.getElementById('modeWebpOnly');
        this.modeResizeOnly = document.getElementById('modeResizeOnly');
        this.modeBoth = document.getElementById('modeBoth');
        
        this.qualitySection = document.getElementById('qualitySection');
        this.resizeSection = document.getElementById('resizeSection');
        
        this.widthInput = document.getElementById('widthInput');
        this.heightInput = document.getElementById('heightInput');
        this.aspectRatioBtn = document.getElementById('aspectRatioBtn');
        this.dimensionHint = document.getElementById('dimensionHint');
        
        this.renameInput = document.getElementById('renamePrefix');
        this.renamePreview = document.getElementById('renamePreview');
        this.preserveExifToggle = document.getElementById('preserveExif');
        
        this.sortBySizeBtn = document.getElementById('sortBySizeBtn');
        this.sortBySavingsBtn = document.getElementById('sortBySavingsBtn');
        this.removeFailedBtn = document.getElementById('removeFailedBtn');
        this.reconvertFailedBtn = document.getElementById('reconvertFailedBtn');
        this.duplicateDetectorBtn = document.getElementById('duplicateDetectorBtn');
        
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.sidebarClose = document.getElementById('sidebarClose');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.navItems = document.querySelectorAll('.nav-item');
        this.contentSections = document.querySelectorAll('.content-section');
        this.sidebarTotalConversions = document.getElementById('sidebarTotalConversions');
        this.sidebarSpaceSaved = document.getElementById('sidebarSpaceSaved');
        
        this.toggleUrlUploadBtn = document.getElementById('toggleUrlUpload');
        this.urlUploadSection = document.getElementById('urlUploadSection');
        this.urlInput = document.getElementById('urlInput');
        this.urlAddBtn = document.getElementById('urlAddBtn');
        this.urlListEl = document.getElementById('urlList');
        
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        
        this.statTotalConversions = document.getElementById('statTotalConversions');
        this.statTotalSaved = document.getElementById('statTotalSaved');
        this.statAvgSavings = document.getElementById('statAvgSavings');
        this.statTotalFiles = document.getElementById('statTotalFiles');
        
        this.livePreviewPanel = document.getElementById('livePreviewPanel');
        this.previewPanelContent = document.getElementById('previewPanelContent');
        this.previewToggle = document.getElementById('previewToggle');
        this.reopenPreviewBtn = document.getElementById('reopenPreviewBtn');
        
        this.savePresetBtn = document.getElementById('savePresetBtn');
        this.presetModal = document.getElementById('presetModal');
        this.closePresetModal = document.getElementById('closePresetModal');
        this.presetNameInput = document.getElementById('presetNameInput');
        this.confirmSavePreset = document.getElementById('confirmSavePreset');
        this.presetsGrid = document.getElementById('presetsGrid');
        
        this.duplicateModal = document.getElementById('duplicateModal');
        this.closeDuplicateModal = document.getElementById('closeDuplicateModal');
        this.duplicateResults = document.getElementById('duplicateResults');
        
        this.pagespeedUrl = document.getElementById('pagespeedUrl');
        this.analyzePageSpeedBtn = document.getElementById('analyzePageSpeedBtn');
        this.pagespeedLoading = document.getElementById('pagespeedLoading');
        this.pagespeedResults = document.getElementById('pagespeedResults');
        this.deviceBtns = document.querySelectorAll('.device-btn');
        
        this.changelogLoading = document.getElementById('changelogLoading');
        this.changelogTimeline = document.getElementById('changelogTimeline');
    }

    bindEvents() {
        this.uploadZone.addEventListener('click', () => this.fileInput.click());
        this.uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadZone.addEventListener('drop', this.handleDrop.bind(this));
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        
        this.qualitySlider.addEventListener('input', this.handleQualityChange.bind(this));
        
        this.modeWebpOnly.addEventListener('change', this.handleModeChange.bind(this));
        this.modeResizeOnly.addEventListener('change', this.handleModeChange.bind(this));
        this.modeBoth.addEventListener('change', this.handleModeChange.bind(this));
        
        this.aspectRatioBtn.addEventListener('click', this.toggleAspectRatio.bind(this));
        
        this.widthInput.addEventListener('input', this.handleWidthChange.bind(this));
        this.heightInput.addEventListener('input', this.handleHeightChange.bind(this));
        
        this.convertBtn.addEventListener('click', this.startConversion.bind(this));
        this.clearBtn.addEventListener('click', this.clearAll.bind(this));
        this.downloadAllBtn.addEventListener('click', this.downloadAll.bind(this));
        
        this.renameInput.addEventListener('input', this.handleRenameInput.bind(this));
        this.preserveExifToggle.addEventListener('change', this.handleExifToggle.bind(this));
        
        this.sortBySizeBtn.addEventListener('click', () => this.sortFiles('size'));
        this.sortBySavingsBtn.addEventListener('click', () => this.sortFiles('savings'));
        this.removeFailedBtn.addEventListener('click', this.removeFailed.bind(this));
        this.reconvertFailedBtn.addEventListener('click', this.reconvertFailed.bind(this));
        this.duplicateDetectorBtn.addEventListener('click', this.openDuplicateDetector.bind(this));
        
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
        
        this.toggleUrlUploadBtn.addEventListener('click', () => {
            this.urlUploadSection.classList.toggle('d-none');
        });
        
        this.urlAddBtn.addEventListener('click', this.addUrlToList.bind(this));
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addUrlToList();
            }
        });
        
        this.clearHistoryBtn.addEventListener('click', this.clearHistory.bind(this));
        
        this.previewToggle.addEventListener('click', () => this.togglePreviewPanel());
        this.reopenPreviewBtn.addEventListener('click', () => this.togglePreviewPanel());
        
        this.savePresetBtn.addEventListener('click', () => this.openPresetModal());
        this.closePresetModal.addEventListener('click', () => this.closeModal(this.presetModal));
        this.confirmSavePreset.addEventListener('click', () => this.savePreset());
        
        this.closeDuplicateModal.addEventListener('click', () => this.closeModal(this.duplicateModal));
        
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
                    e.preventDefault();
                    this.deviceBtns.forEach(b => b.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    this.pagespeedStrategy = e.currentTarget.getAttribute('data-strategy');
                    this.displayCurrentStrategy();
                });
            });
        }
        
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

    async autoFetchChangelog() {
        if (this.changelogCache && this.changelogCache.fetchedAt) {
            const cacheAge = Date.now() - new Date(this.changelogCache.fetchedAt).getTime();
            const oneHour = 60 * 60 * 1000;
            
            if (cacheAge < oneHour) {
                console.log('📋 Using cached changelog');
                this.renderChangelog(this.changelogCache.commits);
                this.changelogFetched = true;
                return;
            }
        }
        
        console.log('🔄 Fetching changelog...');
        
        this.changelogLoading.classList.remove('d-none');
        this.changelogTimeline.innerHTML = '';
        
        try {
            const [owner, repo] = this.githubRepo.split('/');
            const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`;
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`GitHub API returned ${response.status}`);
            }
            
            const commits = await response.json();
            
            if (!commits || commits.length === 0) {
                throw new Error('No commits found');
            }
            
            // Fetch detailed commit data with patches
            const detailedCommits = await Promise.all(
                commits.map(async commit => {
                    const detailResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${commit.sha}`);
                    return await detailResponse.json();
                })
            );
            
            this.saveChangelogCache({ commits: detailedCommits, fetchedAt: new Date().toISOString() });
            this.renderChangelog(detailedCommits);
            this.changelogFetched = true;
            
            console.log('✅ Changelog updated');
            
        } catch (error) {
            console.error('❌ Changelog error:', error);
            
            if (this.changelogCache && this.changelogCache.commits) {
                console.log('📋 Showing cached changelog');
                this.renderChangelog(this.changelogCache.commits);
            } else {
                this.changelogTimeline.innerHTML = `
                    <div class="changelog-empty">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to load changelog</p>
                        <p style="font-size: 0.9rem; color: rgba(255,255,255,0.5);">${error.message}</p>
                    </div>
                `;
            }
        } finally {
            this.changelogLoading.classList.add('d-none');
        }
    }

    renderChangelog(commits) {
        if (!commits || commits.length === 0) {
            this.changelogTimeline.innerHTML = `
                <div class="changelog-empty">
                    <i class="fas fa-inbox"></i>
                    <p>No commits found</p>
                </div>
            `;
            return;
        }
        
        const html = commits.map((commit, index) => {
            const date = new Date(commit.commit.author.date);
            const formattedDate = date.toLocaleString();
            const message = commit.commit.message.split('\n')[0];
            const author = commit.commit.author.name;
            const sha = commit.sha.substring(0, 7);
            
            const filesHTML = commit.files ? this.renderCodeDiffs(commit.files, index) : '';
            
            return `
                <div class="commit-item">
                    <div class="commit-header">
                        <h4 class="commit-message">${this.escapeHtml(message)}</h4>
                        <div class="commit-meta">
                            <div class="commit-author">
                                <i class="fas fa-user"></i>
                                ${this.escapeHtml(author)}
                            </div>
                            <div class="commit-date">
                                <i class="fas fa-calendar"></i>
                                ${formattedDate}
                            </div>
                            <div class="commit-sha">
                                <i class="fas fa-code-branch"></i>
                                ${sha}
                            </div>
                        </div>
                    </div>
                    ${filesHTML}
                </div>
            `;
        }).join('');
        
        this.changelogTimeline.innerHTML = html;
    }

    renderCodeDiffs(files, commitIndex) {
        if (!files || files.length === 0) return '';
        
        // Filter only HTML, CSS, SCSS, JS files
        const codeFiles = files.filter(file => {
            const ext = file.filename.split('.').pop().toLowerCase();
            return ['html', 'css', 'scss', 'js', 'jsx', 'ts', 'tsx'].includes(ext);
        });
        
        if (codeFiles.length === 0) {
            return `<div class="no-code-changes">No code file changes in this commit</div>`;
        }
        
        const filesHTML = codeFiles.map((file, fileIndex) => {
            const ext = file.filename.split('.').pop().toLowerCase();
            let icon = 'fa-file-code';
            let language = ext;
            
            if (['html'].includes(ext)) icon = 'fa-file-code';
            if (['css', 'scss'].includes(ext)) icon = 'fa-file-code';
            if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) icon = 'fa-file-code';
            
            const diffHTML = file.patch ? this.parseDiff(file.patch, language) : '<div class="no-diff">No changes to display</div>';
            
            let statusBadge = '';
            let statusClass = '';
            if (file.status === 'added') {
                statusBadge = '<span class="file-status-badge added">Added</span>';
                statusClass = 'file-added';
            } else if (file.status === 'removed') {
                statusBadge = '<span class="file-status-badge removed">Deleted</span>';
                statusClass = 'file-removed';
            } else if (file.status === 'modified') {
                statusBadge = '<span class="file-status-badge modified">Modified</span>';
                statusClass = 'file-modified';
            }
            
            return `
                <div class="code-diff-file ${statusClass}">
                    <div class="code-file-header">
                        <div class="file-info">
                            <i class="fas ${icon}"></i>
                            <span class="file-name">${file.filename}</span>
                            ${statusBadge}
                        </div>
                        <div class="file-stats">
                            <span class="additions">+${file.additions}</span>
                            <span class="deletions">-${file.deletions}</span>
                            <button class="toggle-diff-btn" onclick="converter.toggleDiff(${commitIndex}, ${fileIndex})">
                                <i class="fas fa-chevron-up"></i>
                            </button>
                        </div>
                    </div>
                    <div class="code-diff-content" id="diff-${commitIndex}-${fileIndex}" style="display: block;">
                        ${diffHTML}
                    </div>
                </div>
            `;
        }).join('');
        
        return `<div class="commit-code-changes">${filesHTML}</div>`;
    }
    parseDiff(patch, language) {
        if (!patch) return '<div class="no-diff">No diff available</div>';
        
        const lines = patch.split('\n');
        let html = '<div class="diff-table">';
        let oldLineNum = 0;
        let newLineNum = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Parse hunk header (@@ -1,5 +1,6 @@)
            if (line.startsWith('@@')) {
                const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
                if (match) {
                    oldLineNum = parseInt(match[1]);
                    newLineNum = parseInt(match[2]);
                }
                html += `<div class="diff-hunk-header">${this.escapeHtml(line)}</div>`;
                continue;
            }
            
            const firstChar = line[0];
            const content = line.substring(1);
            
            if (firstChar === '-') {
                // Deleted line (RED)
                html += `
                    <div class="diff-line removed">
                        <span class="line-num old">${oldLineNum}</span>
                        <span class="line-num new"></span>
                        <span class="line-content"><span class="diff-marker">-</span>${this.escapeHtml(content)}</span>
                    </div>
                `;
                oldLineNum++;
            } else if (firstChar === '+') {
                // Added line (GREEN)
                html += `
                    <div class="diff-line added">
                        <span class="line-num old"></span>
                        <span class="line-num new">${newLineNum}</span>
                        <span class="line-content"><span class="diff-marker">+</span>${this.escapeHtml(content)}</span>
                    </div>
                `;
                newLineNum++;
            } else {
                // Context line (GRAY/WHITE)
                html += `
                    <div class="diff-line context">
                        <span class="line-num old">${oldLineNum}</span>
                        <span class="line-num new">${newLineNum}</span>
                        <span class="line-content">${this.escapeHtml(content)}</span>
                    </div>
                `;
                oldLineNum++;
                newLineNum++;
            }
        }
        
        html += '</div>';
        return html;
    }

    toggleDiff(commitIndex, fileIndex) {
        const diffContent = document.getElementById(`diff-${commitIndex}-${fileIndex}`);
        const btn = diffContent.previousElementSibling.querySelector('.toggle-diff-btn i');
        
        if (diffContent.style.display === 'none') {
            diffContent.style.display = 'block';
            btn.classList.remove('fa-chevron-down');
            btn.classList.add('fa-chevron-up');
        } else {
            diffContent.style.display = 'none';
            btn.classList.remove('fa-chevron-up');
            btn.classList.add('fa-chevron-down');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    initializeNotifications() {
        const notificationCenter = document.getElementById('notificationsCenter');
        const closeNotificationBtn = document.getElementById('closeNotification');
        const reopenNotificationBtn = document.getElementById('reopenNotification');
        
        if (!notificationCenter || !closeNotificationBtn || !reopenNotificationBtn) return;
        
        const notificationClosed = localStorage.getItem('notificationClosed');
        
        setTimeout(() => {
            if (!notificationClosed) {
                notificationCenter.classList.add('active');
            } else {
                reopenNotificationBtn.classList.add('visible');
            }
        }, 500);
        
        closeNotificationBtn.addEventListener('click', () => {
            notificationCenter.classList.add('closing');
            
            setTimeout(() => {
                notificationCenter.classList.remove('active', 'closing');
                reopenNotificationBtn.classList.add('visible');
                localStorage.setItem('notificationClosed', 'true');
            }, 500);
        });
        
        reopenNotificationBtn.addEventListener('click', () => {
            reopenNotificationBtn.classList.remove('visible');
            
            setTimeout(() => {
                notificationCenter.classList.add('active');
                localStorage.removeItem('notificationClosed');
            }, 100);
        });
    }

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
        
        this.saveCurrentSection(sectionName);
    }

    updateSidebarStats() {
        const totalConversions = this.history.reduce((sum, item) => sum + item.fileCount, 0);
        const totalSaved = this.history.reduce((sum, item) => sum + (item.originalSize - item.convertedSize), 0);
        
        this.sidebarTotalConversions.textContent = totalConversions;
        this.sidebarSpaceSaved.textContent = this.formatFileSize(totalSaved);
    }

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

    loadPreviousPageSpeed() {
        const stored = localStorage.getItem('previousPageSpeed');
        return stored ? JSON.parse(stored) : null;
    }

    savePreviousPageSpeed(data) {
        localStorage.setItem('previousPageSpeed', JSON.stringify(data));
        this.previousPageSpeedResults = data;
    }

    displayCurrentStrategy() {
        const data = this.currentPageSpeedData[this.pagespeedStrategy];
        
        if (!data) {
            this.pagespeedResults.innerHTML = `
                <div class="metrics-section">
                    <h3 style="color: white;"><i class="fas fa-info-circle me-2"></i>No Data Available</h3>
                    <p style="text-align: center; color: rgba(255,255,255,0.8);">
                        ${this.pagespeedStrategy === 'mobile' ? 'Mobile' : 'Desktop'} data not yet analyzed.
                        Please run an analysis first.
                    </p>
                </div>
            `;
            this.pagespeedResults.classList.remove('d-none');
            return;
        }
        
        this.displayPageSpeedResults(data, this.pagespeedStrategy);
    }

    async analyzePageSpeed() {
        if (!this.pagespeedUrl) return;
        if (this.isAnalyzingPageSpeed) return;
        
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
        
        this.isAnalyzingPageSpeed = true;
        
        console.log('🚀 Starting SIMULTANEOUS mobile + desktop analysis');
        
        this.pagespeedLoading.classList.remove('d-none');
        this.pagespeedResults.classList.add('d-none');
        this.analyzePageSpeedBtn.disabled = true;
        this.analyzePageSpeedBtn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>Analyzing Both...`;
        
        this.pagespeedLoading.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #667eea; margin-bottom: 1rem;"></i>
                <p style="color: rgba(255, 255, 255, 0.8); font-size: 1.1rem; margin-bottom: 0.5rem;">
                    Analyzing Performance...
                </p>
                <div style="display: flex; gap: 2rem; justify-content: center; margin-top: 1.5rem;">
                    <div style="padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 10px; min-width: 120px;">
                        <i class="fas fa-mobile-alt" style="font-size: 2rem; color: #667eea; margin-bottom: 0.5rem;"></i>
                        <div style="color: rgba(255,255,255,0.9); font-weight: 600;">Mobile</div>
                        <div id="mobileStatus" style="color: rgba(255,255,255,0.6); font-size: 0.85rem; margin-top: 0.3rem;">Loading...</div>
                    </div>
                    <div style="padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 10px; min-width: 120px;">
                        <i class="fas fa-desktop" style="font-size: 2rem; color: #667eea; margin-bottom: 0.5rem;"></i>
                        <div style="color: rgba(255,255,255,0.9); font-weight: 600;">Desktop</div>
                        <div id="desktopStatus" style="color: rgba(255,255,255,0.6); font-size: 0.85rem; margin-top: 0.3rem;">Loading...</div>
                    </div>
                </div>
                <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-top: 1.5rem;">
                    This may take 20-30 seconds...
                </p>
            </div>
        `;
        
        try {
            const workerBaseUrl = 'https://pagespeed-insights.can-akcam.workers.dev';
            
            const [mobileResponse, desktopResponse] = await Promise.all([
                fetch(`${workerBaseUrl}?url=${encodeURIComponent(url)}&strategy=mobile`).then(res => {
                    const status = document.getElementById('mobileStatus');
                    if (status) status.textContent = '✓ Complete';
                    return res.json();
                }),
                fetch(`${workerBaseUrl}?url=${encodeURIComponent(url)}&strategy=desktop`).then(res => {
                    const status = document.getElementById('desktopStatus');
                    if (status) status.textContent = '✓ Complete';
                    return res.json();
                })
            ]);
            
            console.log('✅ Both analyses complete');
            
            if (mobileResponse.error || desktopResponse.error) {
                throw new Error(mobileResponse.error?.message || desktopResponse.error?.message || 'Failed to analyze');
            }
            
            if (!mobileResponse.lighthouseResult || !desktopResponse.lighthouseResult) {
                throw new Error('No lighthouse results in response');
            }
            
            this.currentPageSpeedData.mobile = mobileResponse;
            this.currentPageSpeedData.desktop = desktopResponse;
            
            this.displayPageSpeedResults(
                this.currentPageSpeedData[this.pagespeedStrategy],
                this.pagespeedStrategy
            );
            
        // NEW CODE - Save BOTH mobile and desktop scores separately
        const currentData = {
            url: url,
            timestamp: new Date().toISOString(),
            mobile: this.currentPageSpeedData.mobile ? this.extractScores(this.currentPageSpeedData.mobile) : null,
            desktop: this.currentPageSpeedData.desktop ? this.extractScores(this.currentPageSpeedData.desktop) : null
        };

        this.savePreviousPageSpeed(currentData);
            
        } catch (error) {
            console.error('❌ PageSpeed error:', error);
            
            const errorMessage = error.message || 'Unknown error';
            
            this.pagespeedResults.innerHTML = `
                <div class="metrics-section">
                    <h3 style="color: white;"><i class="fas fa-exclamation-triangle me-2"></i>Analysis Error</h3>
                    <p style="color: #ff6b6b; text-align: center; font-weight: 600;">${errorMessage}</p>
                    
                    <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                        <h4 style="font-size: 1rem; margin-bottom: 0.5rem; color: white;">Troubleshooting Tips:</h4>
                        <ul style="text-align: left; color: rgba(255, 255, 255, 0.8); line-height: 1.8;">
                            <li>Make sure the URL is publicly accessible</li>
                            <li>Try with "https://" instead of "http://"</li>
                            <li>Verify the website is online and responding</li>
                            <li>Check if the URL is complete</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin-top: 1.5rem;">
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
            this.isAnalyzingPageSpeed = false;
        }
    }

    extractScores(data) {
        const categories = data.lighthouseResult.categories;
        return {
            performance: categories.performance?.score ? Math.round(categories.performance.score * 100) : 0,
            accessibility: categories.accessibility?.score ? Math.round(categories.accessibility.score * 100) : 0,
            bestPractices: categories['best-practices']?.score ? Math.round(categories['best-practices'].score * 100) : 0,
            seo: categories.seo?.score ? Math.round(categories.seo.score * 100) : 0
        };
    }

    getScoreClass(score) {
        if (score === 100) return 'perfect';
        if (score >= 90) return 'good';
        if (score >= 50) return 'average';
        return 'poor';
    }

    getMetricClass(score) {
        if (score >= 0.9) return 'good';
        if (score >= 0.5) return 'average';
        return 'poor';
    }

    getScoreDifference(category) {
        if (!this.previousPageSpeedResults) return null;
        
        // Get previous scores for CURRENT strategy (mobile or desktop)
        const prevScores = this.previousPageSpeedResults[this.pagespeedStrategy];
        if (!prevScores) return null;
        
        // Get current scores for CURRENT strategy
        const currentScores = this.extractScores(this.currentPageSpeedData[this.pagespeedStrategy]);
        
        const prev = prevScores[category];
        const curr = currentScores[category];
        
        if (prev === undefined || curr === undefined) return null;
        
        const diff = curr - prev;
        
        // Only return if there's an actual difference
        if (diff === 0) return null;
        
        return {
            value: diff,
            increased: diff > 0,
            decreased: diff < 0
        };
    }

    displayPageSpeedResults(data, strategy) {
        try {
            const lighthouse = data.lighthouseResult;
            
            if (!lighthouse || !lighthouse.categories) {
                throw new Error('Invalid response from PageSpeed API');
            }
            
            const categories = lighthouse.categories;
            const audits = lighthouse.audits;
            
            const performanceScore = categories.performance?.score ? Math.round(categories.performance.score * 100) : 0;
            const accessibilityScore = categories.accessibility?.score ? Math.round(categories.accessibility.score * 100) : 0;
            const bestPracticesScore = categories['best-practices']?.score ? Math.round(categories['best-practices'].score * 100) : 0;
            const seoScore = categories.seo?.score ? Math.round(categories.seo.score * 100) : 0;
            
            const fcp = audits['first-contentful-paint']?.displayValue || 'N/A';
            const lcp = audits['largest-contentful-paint']?.displayValue || 'N/A';
            const tbt = audits['total-blocking-time']?.displayValue || 'N/A';
            const cls = audits['cumulative-layout-shift']?.displayValue || 'N/A';
            const si = audits['speed-index']?.displayValue || 'N/A';
            
            const opportunities = audits ? Object.values(audits)
                .filter(audit => audit && audit.details && audit.details.type === 'opportunity' && audit.score !== null && audit.score < 1)
                .sort((a, b) => (b.details?.overallSavingsMs || 0) - (a.details?.overallSavingsMs || 0))
                .slice(0, 5) : [];
            
            const perfDiff = this.getScoreDifference('performance');
            const accDiff = this.getScoreDifference('accessibility');
            const bpDiff = this.getScoreDifference('bestPractices');
            const seoDiff = this.getScoreDifference('seo');
            
            const comparisonBadge = (diff) => {
                if (!diff || diff.value === 0) return '';
                const sign = diff.increased ? '+' : '';
                const color = diff.increased ? '#10b981' : '#ef4444';
                return `<div class="score-change" style="background: ${color};">${sign}${diff.value}</div>`;
            };
            
            const deviceIcon = strategy === 'mobile' ? '📱' : '🖥️';
            const deviceName = strategy === 'mobile' ? 'Mobile' : 'Desktop';
            
            const mobileAvailable = this.currentPageSpeedData.mobile !== null;
            const desktopAvailable = this.currentPageSpeedData.desktop !== null;
            
            const html = `
                <div class="device-indicator" style="text-align: center; margin-bottom: 2rem; padding: 1rem; background: rgba(255, 255, 255, 0.1); border-radius: 12px;">
                    <h3 style="color: white; font-size: 1.3rem; margin: 0;">
                        ${deviceIcon} ${deviceName} Performance
                    </h3>
                    <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; margin: 0.5rem 0 0 0;">
                        ${mobileAvailable && desktopAvailable ? 
                            '✓ Click device buttons above to switch instantly' : 
                            'Click "Analyze" to get both mobile and desktop results'}
                    </p>
                </div>
                
                <div class="pagespeed-actions">
                    ${this.previousPageSpeedResults ? `
                        <button class="btn-action" onclick="converter.showComparison()">
                            <i class="fas fa-history me-2"></i>Compare with Previous
                        </button>
                    ` : ''}
                    <button class="btn-action" onclick="converter.showOptimizationTips('octobercms')">
                        <i class="fab fa-laravel me-2"></i>OctoberCMS Tips
                    </button>
                    <button class="btn-action" onclick="converter.showOptimizationTips('wordpress')">
                        <i class="fab fa-wordpress me-2"></i>WordPress Tips
                    </button>
                </div>
                
                <div class="score-summary">
                    <div class="score-card">
                        ${comparisonBadge(perfDiff)}
                        <div class="score-label">Performance</div>
                        <div class="score-circle ${this.getScoreClass(performanceScore)}">
                            ${performanceScore}
                        </div>
                    </div>
                    <div class="score-card">
                        ${comparisonBadge(accDiff)}
                        <div class="score-label">Accessibility</div>
                        <div class="score-circle ${this.getScoreClass(accessibilityScore)}">
                            ${accessibilityScore}
                        </div>
                    </div>
                    <div class="score-card">
                        ${comparisonBadge(bpDiff)}
                        <div class="score-label">Best Practices</div>
                        <div class="score-circle ${this.getScoreClass(bestPracticesScore)}">
                            ${bestPracticesScore}
                        </div>
                    </div>
                    <div class="score-card">
                        ${comparisonBadge(seoDiff)}
                        <div class="score-label">SEO</div>
                        <div class="score-circle ${this.getScoreClass(seoScore)}">
                            ${seoScore}
                        </div>
                    </div>
                </div>
                
                <div class="metrics-section">
                    <h3 style="color: white;"><i class="fas fa-clock me-2"></i>Core Web Vitals</h3>
                    <div class="metric-item">
                        <div class="metric-name">
                            <strong style="color: white;">First Contentful Paint (FCP)</strong>
                            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">Measures when content first appears</div>
                        </div>
                        <div class="metric-value ${audits['first-contentful-paint']?.score ? this.getMetricClass(audits['first-contentful-paint'].score) : 'average'}">${fcp}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-name">
                            <strong style="color: white;">Largest Contentful Paint (LCP)</strong>
                            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">Measures loading performance</div>
                        </div>
                        <div class="metric-value ${audits['largest-contentful-paint']?.score ? this.getMetricClass(audits['largest-contentful-paint'].score) : 'average'}">${lcp}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-name">
                            <strong style="color: white;">Total Blocking Time (TBT)</strong>
                            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">Measures interactivity</div>
                        </div>
                        <div class="metric-value ${audits['total-blocking-time']?.score ? this.getMetricClass(audits['total-blocking-time'].score) : 'average'}">${tbt}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-name">
                            <strong style="color: white;">Cumulative Layout Shift (CLS)</strong>
                            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">Measures visual stability</div>
                        </div>
                        <div class="metric-value ${audits['cumulative-layout-shift']?.score ? this.getMetricClass(audits['cumulative-layout-shift'].score) : 'average'}">${cls}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-name">
                            <strong style="color: white;">Speed Index</strong>
                            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">How quickly content is displayed</div>
                        </div>
                        <div class="metric-value ${audits['speed-index']?.score ? this.getMetricClass(audits['speed-index'].score) : 'average'}">${si}</div>
                    </div>
                </div>
                
                ${opportunities.length > 0 ? `
                    <div class="opportunities-section">
                        <h3 style="color: white;"><i class="fas fa-lightbulb me-2"></i>Optimization Opportunities</h3>
                        ${opportunities.map(opp => `
                            <div class="opportunity-item">
                                <div class="opportunity-title" style="color: white;">${opp.title || 'Optimization Available'}</div>
                                <div class="opportunity-description" style="color: rgba(255,255,255,0.8);">${opp.description || ''}</div>
                                ${opp.details && opp.details.overallSavingsMs ? 
                                    `<span class="opportunity-savings">
                                        <i class="fas fa-clock me-1"></i>Potential savings: ${Math.round(opp.details.overallSavingsMs / 1000)}s
                                    </span>` 
                                    : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="metrics-section"><p style="text-align: center; color: rgba(255,255,255,0.8);"><i class="fas fa-check-circle me-2"></i>No major optimization opportunities found!</p></div>'}
                
                <div class="chatgpt-section">
                    <button class="btn-chatgpt" onclick="converter.openChatGPT('octobercms')">
                        <i class="fas fa-comments me-2"></i>Chat with AI about OctoberCMS Optimization
                    </button>
                    <button class="btn-chatgpt" onclick="converter.openChatGPT('wordpress')">
                        <i class="fas fa-comments me-2"></i>Chat with AI about WordPress Optimization
                    </button>
                </div>
            `;
            
            this.pagespeedResults.innerHTML = html;
            this.pagespeedResults.classList.remove('d-none');
            
        } catch (error) {
            console.error('Error displaying PageSpeed results:', error);
            this.pagespeedResults.innerHTML = `
                <div class="metrics-section">
                    <h3 style="color: white;"><i class="fas fa-exclamation-triangle me-2"></i>Display Error</h3>
                    <p style="color: #ff6b6b; text-align: center;">Failed to display PageSpeed results</p>
                </div>
            `;
            this.pagespeedResults.classList.remove('d-none');
        }
    }

    showComparison() {
        if (!this.previousPageSpeedResults) return;
        
        const modal = document.createElement('div');
        modal.className = 'duplicate-modal';
        modal.style.display = 'flex';
        
        // Get previous scores for current strategy
        const prev = this.previousPageSpeedResults[this.pagespeedStrategy];
        if (!prev) {
            alert(`No previous ${this.pagespeedStrategy} data available for comparison.`);
            return;
        }
        
        // Get current scores for current strategy
        const curr = this.extractScores(this.currentPageSpeedData[this.pagespeedStrategy]);
        
        const compareRow = (label, prevVal, currVal) => {
            const diff = currVal - prevVal;
            const diffClass = diff > 0 ? 'improved' : diff < 0 ? 'declined' : 'same';
            const diffText = diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '0';
            
            return `
                <tr>
                    <td style="color: white; font-weight: 600;">${label}</td>
                    <td style="color: rgba(255,255,255,0.8);">${prevVal}</td>
                    <td style="color: rgba(255,255,255,0.8);">${currVal}</td>
                    <td class="${diffClass}">${diffText}</td>
                </tr>
            `;
        };
        
        const deviceName = this.pagespeedStrategy === 'mobile' ? 'Mobile' : 'Desktop';
        const deviceIcon = this.pagespeedStrategy === 'mobile' ? '📱' : '🖥️';
        
        modal.innerHTML = `
            <div class="duplicate-modal-content" style="max-width: 800px;">
                <button class="close-modal">&times;</button>
                <div class="modal-header">
                    <h3 style="color: white;">${deviceIcon} ${deviceName} Performance Comparison</h3>
                    <p style="color: rgba(255,255,255,0.7);">Comparing current ${deviceName.toLowerCase()} results with previous ${deviceName.toLowerCase()} analysis</p>
                </div>
                <div style="margin-top: 2rem;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid rgba(255,255,255,0.1);">
                                <th style="color: white; padding: 1rem; text-align: left;">Metric</th>
                                <th style="color: white; padding: 1rem; text-align: center;">Previous</th>
                                <th style="color: white; padding: 1rem; text-align: center;">Current</th>
                                <th style="color: white; padding: 1rem; text-align: center;">Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${compareRow('Performance', prev.performance, curr.performance)}
                            ${compareRow('Accessibility', prev.accessibility, curr.accessibility)}
                            ${compareRow('Best Practices', prev.bestPractices, curr.bestPractices)}
                            ${compareRow('SEO', prev.seo, curr.seo)}
                        </tbody>
                    </table>
                </div>
                <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; text-align: center;">
                    <p style="color: rgba(255,255,255,0.6); font-size: 0.85rem; margin: 0;">
                        Previous analysis: ${new Date(this.previousPageSpeedResults.timestamp).toLocaleString()}
                    </p>
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

    showOptimizationTips(platform) {
        if (!this.currentPageSpeedData[this.pagespeedStrategy]) {
            alert('Please run a PageSpeed analysis first!');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'duplicate-modal';
        modal.style.display = 'flex';
        
        const audits = this.currentPageSpeedData[this.pagespeedStrategy].lighthouseResult.audits;
        const opportunities = Object.values(audits)
            .filter(audit => audit && audit.details && audit.details.type === 'opportunity' && audit.score !== null && audit.score < 1)
            .sort((a, b) => (b.details?.overallSavingsMs || 0) - (a.details?.overallSavingsMs || 0));
        
        const tips = platform === 'octobercms' ? this.getOctoberCMSTips(opportunities) : this.getWordPressTips(opportunities);
        
        modal.innerHTML = `
            <div class="duplicate-modal-content" style="max-width: 900px; max-height: 80vh; overflow-y: auto;">
                <button class="close-modal">&times;</button>
                <div class="modal-header">
                    <h3 style="color: #333;">
                        <i class="fab fa-${platform === 'octobercms' ? 'laravel' : 'wordpress'} me-2"></i>
                        ${platform === 'octobercms' ? 'OctoberCMS' : 'WordPress'} Optimization Tips (2025)
                    </h3>
                    <p style="color: #666;">Best practices and plugins for your PageSpeed issues</p>
                </div>
                <div style="margin-top: 2rem;">
                    ${tips}
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

    getOctoberCMSTips(opportunities) {
        let html = '<div class="tips-container">';
        
        opportunities.forEach(opp => {
            const title = opp.title || '';
            const description = opp.description || '';
            
            let tip = '';
            
            if (title.toLowerCase().includes('image') || title.toLowerCase().includes('next-gen')) {
                tip = `
                    <div class="tip-card">
                        <h4><i class="fas fa-image me-2"></i>${title}</h4>
                        <p class="tip-description">${description}</p>
                        <div class="tip-solution">
                            <strong>OctoberCMS Solution:</strong>
                            <ul>
                                <li><strong>Responsiv.ImageResizer</strong> - Free plugin for automatic image resizing and optimization</li>
                                <li><strong>WebP Support:</strong> Use <code>|resize(width, height, {format: 'webp'})</code> in Twig</li>
                                <li><strong>Lazy Loading:</strong> Add <code>loading="lazy"</code> to image tags</li>
                                <li><strong>Cloudflare Polish:</strong> Enable auto WebP conversion via Cloudflare</li>
                            </ul>
                        </div>
                    </div>
                `;
            }
            
            else if (title.toLowerCase().includes('render-blocking') || title.toLowerCase().includes('css') || title.toLowerCase().includes('javascript')) {
                tip = `
                    <div class="tip-card">
                        <h4><i class="fas fa-code me-2"></i>${title}</h4>
                        <p class="tip-description">${description}</p>
                        <div class="tip-solution">
                            <strong>OctoberCMS Solution:</strong>
                            <ul>
                                <li><strong>Asset Combiner:</strong> Use <code>{% styles %}</code> and <code>{% scripts %}</code> with defer</li>
                                <li><strong>Critical CSS:</strong> Inline critical CSS in <code>{% put head %}</code></li>
                                <li><strong>Defer JavaScript:</strong> Add <code>defer</code> or <code>async</code> to script tags</li>
                                <li><strong>RainLab.Builder:</strong> Combine multiple CSS/JS files into one</li>
                            </ul>
                        </div>
                    </div>
                `;
            }
            
            else if (title.toLowerCase().includes('cache') || title.toLowerCase().includes('browser caching')) {
                tip = `
                    <div class="tip-card">
                        <h4><i class="fas fa-server me-2"></i>${title}</h4>
                        <p class="tip-description">${description}</p>
                        <div class="tip-solution">
                            <strong>OctoberCMS Solution:</strong>
                            <ul>
                                <li><strong>Enable October Cache:</strong> Set <code>APP_ENV=production</code> in .env</li>
                                <li><strong>Static Page Cache:</strong> Install RainLab.Pages with cache enabled</li>
                                <li><strong>.htaccess Caching:</strong> Add browser cache headers for static files</li>
                                <li><strong>Redis/Memcached:</strong> Configure in <code>config/cache.php</code></li>
                            </ul>
                        </div>
                    </div>
                `;
            }
            
            else if (title.toLowerCase().includes('text compression') || title.toLowerCase().includes('gzip')) {
                tip = `
                    <div class="tip-card">
                        <h4><i class="fas fa-compress me-2"></i>${title}</h4>
                        <p class="tip-description">${description}</p>
                        <div class="tip-solution">
                            <strong>OctoberCMS Solution:</strong>
                            <ul>
                                <li><strong>Enable Gzip:</strong> Add to .htaccess</li>
                                <li><strong>Brotli Compression:</strong> Enable via server config (Nginx/Apache)</li>
                                <li><strong>Minification:</strong> Use October's built-in asset minification</li>
                            </ul>
                        </div>
                    </div>
                `;
            }
            
            else if (title.toLowerCase().includes('unused css') || title.toLowerCase().includes('unused javascript')) {
                tip = `
                    <div class="tip-card">
                        <h4><i class="fas fa-broom me-2"></i>${title}</h4>
                        <p class="tip-description">${description}</p>
                        <div class="tip-solution">
                            <strong>OctoberCMS Solution:</strong>
                            <ul>
                                <li><strong>Component-Based Loading:</strong> Only load CSS/JS when component is used</li>
                                <li><strong>Conditional Loading:</strong> Use <code>{% if %}</code> to conditionally load assets</li>
                                <li><strong>PurgeCSS:</strong> Remove unused Tailwind/Bootstrap classes</li>
                                <li><strong>Tree Shaking:</strong> Use webpack/vite to remove unused code</li>
                            </ul>
                        </div>
                    </div>
                `;
            }
            
            if (tip) html += tip;
        });
        
        html += `
            <div class="tip-card general-tips">
                <h4><i class="fas fa-star me-2"></i>General OctoberCMS Performance Tips (2025)</h4>
                <div class="tip-solution">
                    <ul>
                        <li><strong>PHP 8.3:</strong> Upgrade to PHP 8.3 for 20-30% performance boost</li>
                        <li><strong>OPcache:</strong> Enable OPcache in php.ini</li>
                        <li><strong>Database Indexing:</strong> Add indexes to frequently queried columns</li>
                        <li><strong>CDN:</strong> Use Cloudflare or BunnyCDN for static assets</li>
                        <li><strong>Eager Loading:</strong> Use <code>->with()</code> to prevent N+1 queries</li>
                        <li><strong>Queue Jobs:</strong> Move heavy tasks to queues</li>
                    </ul>
                </div>
            </div>
        `;
        
        html += '</div>';
        return html;
    }

    getWordPressTips(opportunities) {
        let html = '<div class="tips-container">';
        
        opportunities.forEach(opp => {
            const title = opp.title || '';
            const description = opp.description || '';
            
            let tip = '';
            
            if (title.toLowerCase().includes('image') || title.toLowerCase().includes('next-gen')) {
                tip = `
                    <div class="tip-card">
                        <h4><i class="fas fa-image me-2"></i>${title}</h4>
                        <p class="tip-description">${description}</p>
                        <div class="tip-solution">
                            <strong>WordPress Solution:</strong>
                            <ul>
                                <li><strong>Imagify</strong> (Free) - Auto WebP conversion and compression</li>
                                <li><strong>ShortPixel</strong> (Free tier) - Bulk optimize existing images</li>
                                <li><strong>Smush Pro</strong> - Lossless compression with CDN</li>
                                <li><strong>Native Lazy Loading:</strong> WordPress 5.5+ has built-in lazy loading</li>
                            </ul>
                        </div>
                    </div>
                `;
            }
            
            else if (title.toLowerCase().includes('render-blocking') || title.toLowerCase().includes('css') || title.toLowerCase().includes('javascript')) {
                tip = `
                    <div class="tip-card">
                        <h4><i class="fas fa-code me-2"></i>${title}</h4>
                        <p class="tip-description">${description}</p>
                        <div class="tip-solution">
                            <strong>WordPress Solution:</strong>
                            <ul>
                                <li><strong>WP Rocket</strong> (Premium) - Best all-in-one, auto defer JS/CSS</li>
                                <li><strong>Autoptimize</strong> (Free) - Combine & minify CSS/JS</li>
                                <li><strong>Flying Scripts</strong> (Free) - Delay JavaScript execution</li>
                                <li><strong>Asset CleanUp</strong> (Free) - Disable unused CSS/JS per page</li>
                            </ul>
                        </div>
                    </div>
                `;
            }
            
            else if (title.toLowerCase().includes('cache') || title.toLowerCase().includes('browser caching')) {
                tip = `
                    <div class="tip-card">
                        <h4><i class="fas fa-server me-2"></i>${title}</h4>
                        <p class="tip-description">${description}</p>
                        <div class="tip-solution">
                            <strong>WordPress Solution:</strong>
                            <ul>
                                <li><strong>WP Rocket</strong> (Premium, $59/yr) - Best caching plugin, easy setup</li>
                                <li><strong>W3 Total Cache</strong> (Free) - Advanced caching options</li>
                                <li><strong>LiteSpeed Cache</strong> (Free) - For LiteSpeed servers only</li>
                                <li><strong>Redis Object Cache</strong> (Free) - Database query caching</li>
                            </ul>
                        </div>
                    </div>
                `;
            }
            
            else if (title.toLowerCase().includes('text compression') || title.toLowerCase().includes('gzip')) {
                tip = `
                    <div class="tip-card">
                        <h4><i class="fas fa-compress me-2"></i>${title}</h4>
                        <p class="tip-description">${description}</p>
                        <div class="tip-solution">
                            <strong>WordPress Solution:</strong>
                            <ul>
                                <li><strong>WP Rocket:</strong> Enables Gzip automatically</li>
                                <li><strong>.htaccess Method:</strong> Add Gzip rules manually</li>
                                <li><strong>Cloudflare:</strong> Free Gzip + Brotli compression</li>
                                <li><strong>Host-Level:</strong> Most managed hosts enable this by default</li>
                            </ul>
                        </div>
                    </div>
                `;
            }
            
            else if (title.toLowerCase().includes('unused css') || title.toLowerCase().includes('unused javascript')) {
                tip = `
                    <div class="tip-card">
                        <h4><i class="fas fa-broom me-2"></i>${title}</h4>
                        <p class="tip-description">${description}</p>
                        <div class="tip-solution">
                            <strong>WordPress Solution:</strong>
                            <ul>
                                <li><strong>Asset CleanUp Pro</strong> ($69) - Disable CSS/JS per page/post type</li>
                                <li><strong>Perfmatters</strong> ($29/yr) - Script manager + unused CSS removal</li>
                                <li><strong>WP Rocket:</strong> Has unused CSS removal feature</li>
                                <li><strong>Manual:</strong> Dequeue unused scripts in functions.php</li>
                            </ul>
                        </div>
                    </div>
                `;
            }
            
            if (tip) html += tip;
        });
        
        html += `
            <div class="tip-card general-tips">
                <h4><i class="fas fa-star me-2"></i>General WordPress Performance Tips (2025)</h4>
                <div class="tip-solution">
                    <ul>
                        <li><strong>PHP 8.3:</strong> Upgrade to PHP 8.3 for massive performance gains</li>
                        <li><strong>Managed Hosting:</strong> Use Kinsta, WP Engine, or Cloudways</li>
                        <li><strong>CDN:</strong> Cloudflare (Free) or BunnyCDN ($1/mo)</li>
                        <li><strong>Database Optimization:</strong> WP-Optimize (Free) - Clean up revisions, spam</li>
                        <li><strong>Limit Plugins:</strong> Deactivate unused plugins, quality over quantity</li>
                        <li><strong>Theme Choice:</strong> Use lightweight themes like GeneratePress or Astra</li>
                        <li><strong>Heartbeat Control:</strong> Limit WP Heartbeat API frequency</li>
                    </ul>
                </div>
            </div>
        `;
        
        html += '</div>';
        return html;
    }

    openChatGPT(platform) {
        if (!this.currentPageSpeedData[this.pagespeedStrategy]) {
            alert('Please run a PageSpeed analysis first!');
            return;
        }
        
        const scores = this.extractScores(this.currentPageSpeedData[this.pagespeedStrategy]);
        const audits = this.currentPageSpeedData[this.pagespeedStrategy].lighthouseResult.audits;
        
        const issues = Object.values(audits)
            .filter(audit => audit && audit.score !== null && audit.score < 0.9)
            .sort((a, b) => a.score - b.score)
            .slice(0, 5)
            .map(audit => `- ${audit.title}: ${audit.description}`)
            .join('\n');
        
        const platformName = platform === 'octobercms' ? 'OctoberCMS' : 'WordPress';
        
        const prompt = encodeURIComponent(`I need help optimizing my ${platformName} website's performance. Here are my current PageSpeed Insights scores:

Performance: ${scores.performance}/100
Accessibility: ${scores.accessibility}/100
Best Practices: ${scores.bestPractices}/100
SEO: ${scores.seo}/100

Top issues identified:
${issues}

Device: ${this.pagespeedStrategy}

Can you provide specific, actionable steps to improve these scores for a ${platformName} website in 2025? Please include:
1. Free and premium plugin recommendations
2. Code snippets if applicable
3. Hosting/server optimization tips
4. Priority order (what to fix first)`);
        
        window.open(`https://chat.openai.com/?q=${prompt}`, '_blank');
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