window.FilesApp = {
  async init(container) {
    let currentFolderId = 'root';
    let breadcrumbs = [{ id: 'root', name: 'Home' }];
    let items = [];
    let viewMode = 'grid';
    let selectedItemIds = new Set();
    let searchQuery = '';
    container.innerHTML = `
      <div class="fm-container" style="display: flex; flex-direction: column; height: 100%; background: var(--bg-darker); color: var(--text-primary);">
        <!-- Toolbar -->
        <div class="fm-toolbar" style="display: flex; gap: 8px; padding: 12px 16px; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05); align-items: center;">
          <div style="display: flex; gap: 4px;">
            <button class="win-btn fm-nav-up" title="Up"><i class="ph ph-arrow-up"></i></button>
          </div>
          <div class="fm-breadcrumbs" style="flex: 1; display: flex; align-items: center; gap: 4px; font-size: 13px; background: rgba(0,0,0,0.3); padding: 4px 12px; border-radius: 12px; overflow-x: auto;">
            <!-- Breadcrumbs rendered here -->
          </div>
          <div class="fm-search" style="position: relative;">
            <i class="ph ph-magnifying-glass" style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); color: var(--text-secondary);"></i>
            <input type="text" placeholder="Search..." style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 4px 8px 4px 28px; color: white; outline: none; width: 160px; font-size: 13px;">
          </div>
          <div style="display: flex; gap: 4px; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 8px;">
            <button class="win-btn fm-view-grid" title="Grid View" style="${viewMode === 'grid' ? 'background: rgba(255,255,255,0.1);' : ''}"><i class="ph ph-squares-four"></i></button>
            <button class="win-btn fm-view-list" title="List View" style="${viewMode === 'list' ? 'background: rgba(255,255,255,0.1);' : ''}"><i class="ph ph-list-dashes"></i></button>
          </div>
        </div>
        
        <!-- Actions Bar -->
        <div style="display: flex; gap: 12px; padding: 8px 16px; background: rgba(255,255,255,0.01); border-bottom: 1px solid rgba(255,255,255,0.05); align-items: center;">
          <button class="btn-primary fm-new-folder" style="padding: 4px 12px; font-size: 12px;"><i class="ph ph-folder-plus"></i> New Folder</button>
          <button class="btn-primary fm-new-file" style="padding: 4px 12px; font-size: 12px;"><i class="ph ph-file-plus"></i> New File</button>
          <button class="btn-primary fm-upload" style="padding: 4px 12px; font-size: 12px;"><i class="ph ph-upload-simple"></i> Upload</button>
          <input type="file" id="fm-file-input" multiple style="display: none;">
          
          <div class="fm-selection-actions hidden" style="display: flex; gap: 8px; margin-left: auto;">
            <button class="win-btn fm-rename" title="Rename"><i class="ph ph-pencil-simple"></i></button>
            <button class="win-btn fm-delete" title="Delete" style="color: #ff5e5e;"><i class="ph ph-trash"></i></button>
          </div>
        </div>

        <!-- Main Content Area -->
        <div style="display: flex; flex: 1; overflow: hidden;">
          <!-- Sidebar -->
          <div style="width: 200px; background: rgba(0,0,0,0.15); border-right: 1px solid rgba(255,255,255,0.05); padding: 16px; overflow-y: auto;">
            <div style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 1px; margin-bottom: 12px; font-weight: 600;">Locations</div>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 4px;" id="fm-sidebar">
              <!-- Sidebar links -->
            </ul>
          </div>
          
          <!-- File View -->
          <div class="fm-content" style="flex: 1; padding: 16px; overflow-y: auto; position: relative;">
            <div class="fm-items-container" style="display: grid; gap: 16px; align-content: start; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));">
              <!-- Items rendered here -->
            </div>
            <div class="fm-empty-state hidden" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: var(--text-secondary);">
              <i class="ph ph-folder-open" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
              <div>This folder is empty</div>
            </div>
          </div>
        </div>
      </div>
    `;
    const upBtn = container.querySelector('.fm-nav-up');
    const breadcrumbsEl = container.querySelector('.fm-breadcrumbs');
    const searchInput = container.querySelector('.fm-search input');
    const gridBtn = container.querySelector('.fm-view-grid');
    const listBtn = container.querySelector('.fm-view-list');
    const newFolderBtn = container.querySelector('.fm-new-folder');
    const newFileBtn = container.querySelector('.fm-new-file');
    const uploadBtn = container.querySelector('.fm-upload');
    const fileInput = container.querySelector('#fm-file-input');
    const itemsContainer = container.querySelector('.fm-items-container');
    const emptyState = container.querySelector('.fm-empty-state');
    const sidebar = container.querySelector('#fm-sidebar');
    const selectionActions = container.querySelector('.fm-selection-actions');
    const deleteBtn = container.querySelector('.fm-delete');
    const renameBtn = container.querySelector('.fm-rename');
    
    const updateSidebar = async () => {
      const rootItems = await window.FS.readdir('root');
      const folders = rootItems.filter(i => i.type === 'folder');
      
      sidebar.innerHTML = `
        <li class="fs-nav" data-id="root" style="padding: 8px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; background: ${currentFolderId === 'root' ? 'rgba(255,255,255,0.1)' : 'transparent'};"><i class="ph ph-house" style="font-size: 16px;"></i> Home</li>
        ${folders.map(f => `
          <li class="fs-nav" data-id="${f.id}" style="padding: 8px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; background: ${currentFolderId === f.id ? 'rgba(255,255,255,0.1)' : 'transparent'};"><i class="ph ph-folder" style="font-size: 16px; color: #e5b567;"></i> ${f.name}</li>
        `).join('')}
      `;
      
      sidebar.querySelectorAll('.fs-nav').forEach(el => {
        el.addEventListener('click', async () => {
          const id = el.getAttribute('data-id');
          const name = el.textContent.trim();
          if (id === 'root') {
            breadcrumbs = [{ id: 'root', name: 'Home' }];
          } else {
            breadcrumbs = [{ id: 'root', name: 'Home' }, { id, name }];
          }
          currentFolderId = id;
          searchQuery = '';
          searchInput.value = '';
          await loadCurrentFolder();
        });
      });
    };

    const renderBreadcrumbs = () => {
      breadcrumbsEl.innerHTML = breadcrumbs.map((b, index) => `
        <div class="breadcrumb-item" data-id="${b.id}" data-index="${index}" style="cursor: pointer; display: flex; align-items: center; gap: 4px;">
          <span style="color: ${index === breadcrumbs.length - 1 ? 'white' : 'var(--text-secondary)'}; transition: color 0.2s;">${b.name}</span>
          ${index < breadcrumbs.length - 1 ? '<i class="ph ph-caret-right" style="color: var(--text-secondary); font-size: 10px;"></i>' : ''}
        </div>
      `).join('');
      
      breadcrumbsEl.querySelectorAll('.breadcrumb-item').forEach(el => {
        el.addEventListener('click', async () => {
          const idx = parseInt(el.getAttribute('data-index'));
          const id = el.getAttribute('data-id');
          if (idx < breadcrumbs.length - 1) {
            breadcrumbs = breadcrumbs.slice(0, idx + 1);
            currentFolderId = id;
            await loadCurrentFolder();
          }
        });
      });
      
      upBtn.style.opacity = breadcrumbs.length > 1 ? '1' : '0.5';
      upBtn.style.pointerEvents = breadcrumbs.length > 1 ? 'auto' : 'none';
    };

    const getIcon = (item) => {
      if (item.type === 'folder') return '<i class="ph ph-folder-fill" style="color: #e5b567;"></i>';
      if (item.mimeType && item.mimeType.startsWith('image/')) return '<i class="ph ph-image" style="color: #4a6fa5;"></i>';
      if (item.mimeType && item.mimeType.startsWith('audio/')) return '<i class="ph ph-music-notes" style="color: #b565a7;"></i>';
      if (item.mimeType && item.mimeType.startsWith('video/')) return '<i class="ph ph-video" style="color: #e87a5d;"></i>';
      return '<i class="ph ph-file-text" style="color: #ccc;"></i>';
    };

    const renderItems = () => {
      if (items.length === 0) {
        emptyState.classList.remove('hidden');
        itemsContainer.innerHTML = '';
        return;
      }
      
      emptyState.classList.add('hidden');
      
      if (viewMode === 'grid') {
        itemsContainer.style.display = 'grid';
        itemsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(90px, 1fr))';
        
        itemsContainer.innerHTML = items.map(item => `
          <div class="fm-item ${selectedItemIds.has(item.id) ? 'selected' : ''}" data-id="${item.id}" style="display: flex; flex-direction: column; align-items: center; padding: 12px; border-radius: 8px; cursor: pointer; transition: background 0.1s; background: ${selectedItemIds.has(item.id) ? 'rgba(255,255,255,0.15)' : 'transparent'};">
            <div style="font-size: 48px; margin-bottom: 8px;">
              ${getIcon(item)}
            </div>
            <div style="font-size: 12px; text-align: center; word-break: break-word; width: 100%; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
              ${item.name}
            </div>
          </div>
        `).join('');
      } else {
        itemsContainer.style.display = 'flex';
        itemsContainer.style.flexDirection = 'column';
        itemsContainer.style.gap = '2px';
        
        itemsContainer.innerHTML = `
          <div style="display: flex; padding: 8px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">
            <div style="flex: 2;">Name</div>
            <div style="flex: 1;">Date Modified</div>
            <div style="flex: 1;">Size</div>
          </div>
        ` + items.map(item => `
          <div class="fm-item ${selectedItemIds.has(item.id) ? 'selected' : ''}" data-id="${item.id}" style="display: flex; align-items: center; padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: background 0.1s; background: ${selectedItemIds.has(item.id) ? 'rgba(255,255,255,0.15)' : 'transparent'};">
            <div style="flex: 2; display: flex; align-items: center; gap: 12px;">
              <div style="font-size: 20px;">${getIcon(item)}</div>
              <div style="font-size: 13px;">${item.name}</div>
            </div>
            <div style="flex: 1; font-size: 12px; color: var(--text-secondary);">
              ${new Date(item.modifiedAt).toLocaleDateString()}
            </div>
            <div style="flex: 1; font-size: 12px; color: var(--text-secondary);">
              ${item.type === 'folder' ? '--' : window.Utils.formatBytes(item.size)}
            </div>
          </div>
        `).join('');
      }
      
      bindItemEvents();
      updateSelectionUI();
    };

    const updateSelectionUI = () => {
      if (selectedItemIds.size > 0) {
        selectionActions.classList.remove('hidden');
        selectionActions.style.display = 'flex';
      } else {
        selectionActions.classList.add('hidden');
        selectionActions.style.display = 'none';
      }
    };

    const bindItemEvents = () => {
      container.querySelectorAll('.fm-item').forEach(el => {
        el.addEventListener('click', (e) => {
          const id = el.getAttribute('data-id');
          if (e.ctrlKey || e.metaKey) {
            if (selectedItemIds.has(id)) selectedItemIds.delete(id);
            else selectedItemIds.add(id);
          } else {
            selectedItemIds.clear();
            selectedItemIds.add(id);
          }
          renderItems();
          e.stopPropagation();
        });
        
        el.addEventListener('dblclick', async (e) => {
          e.stopPropagation();
          const id = el.getAttribute('data-id');
          const item = items.find(i => i.id === id);
          
          if (item.type === 'folder') {
            breadcrumbs.push({ id: item.id, name: item.name });
            currentFolderId = item.id;
            await loadCurrentFolder();
          } else {
            openFile(item);
          }
        });
      });
    };

    const loadCurrentFolder = async () => {
      selectedItemIds.clear();
      
      let allItems = [];
      if (searchQuery) {
        allItems = await window.FS.readdir(currentFolderId);
        items = allItems.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
      } else {
        items = await window.FS.readdir(currentFolderId);
      }
      items.sort((a, b) => {
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
      
      renderBreadcrumbs();
      renderItems();
      updateSidebar();
    };
    upBtn.addEventListener('click', () => {
      if (breadcrumbs.length > 1) {
        breadcrumbs.pop();
        currentFolderId = breadcrumbs[breadcrumbs.length - 1].id;
        loadCurrentFolder();
      }
    });
    
    gridBtn.addEventListener('click', () => {
      viewMode = 'grid';
      gridBtn.style.background = 'rgba(255,255,255,0.1)';
      listBtn.style.background = 'transparent';
      renderItems();
    });
    
    listBtn.addEventListener('click', () => {
      viewMode = 'list';
      listBtn.style.background = 'rgba(255,255,255,0.1)';
      gridBtn.style.background = 'transparent';
      renderItems();
    });

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      loadCurrentFolder();
    });
    
    newFolderBtn.addEventListener('click', async () => {
      const name = prompt('Enter folder name:');
      if (name && name.trim()) {
        await window.FS.mkdir(currentFolderId, name.trim());
        loadCurrentFolder();
      }
    });
    
    newFileBtn.addEventListener('click', async () => {
      const name = prompt('Enter file name (e.g. note.txt):');
      if (name && name.trim()) {
        await window.FS.writeFile(currentFolderId, name.trim(), '', 'text/plain');
        loadCurrentFolder();
      }
    });
    
    uploadBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', async (e) => {
      for (const file of e.target.files) {
        await window.FS.writeFile(currentFolderId, file.name, file, file.type);
      }
      loadCurrentFolder();
    });
    
    deleteBtn.addEventListener('click', async () => {
      if (selectedItemIds.size > 0) {
        if (confirm(`Are you sure you want to delete ${selectedItemIds.size} item(s)?`)) {
          for (const id of selectedItemIds) {
            await window.FS.delete(id);
          }
          selectedItemIds.clear();
          loadCurrentFolder();
        }
      }
    });
    
    renameBtn.addEventListener('click', async () => {
      if (selectedItemIds.size === 1) {
        const id = [...selectedItemIds][0];
        const item = items.find(i => i.id === id);
        const newName = prompt('Enter new name:', item.name);
        if (newName && newName.trim() && newName.trim() !== item.name) {
          await window.FS.rename(id, newName.trim());
          loadCurrentFolder();
        }
      }
    });

    const openFile = async (item) => {
      try {
        const fullItem = await window.FS.getFile(item.id);
        if (!fullItem) return;
        
        if (fullItem.mimeType && fullItem.mimeType.startsWith('image/')) {
          const url = URL.createObjectURL(fullItem.content);
          const viewerId = 'viewer_' + fullItem.id;
          
          const appDef = {
            id: viewerId,
            name: fullItem.name,
            icon: 'ph-image',
            color: '#4a6fa5',
            width: 800,
            height: 600,
            init: (cont) => {
              cont.innerHTML = `
                <div style="width: 100%; height: 100%; background: #000; display: flex; justify-content: center; align-items: center;">
                  <img src="${url}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
              `;
            }
          };
          window.WM.createWindow(appDef);
        } else if (fullItem.mimeType === 'text/plain' || fullItem.name.endsWith('.txt')) {
          const textContent = fullItem.content instanceof Blob ? await fullItem.content.text() : fullItem.content;
          
          const noteAppDef = {
            id: 'notes_' + fullItem.id,
            name: fullItem.name,
            icon: 'ph-file-text',
            color: '#e87a5d',
            width: 600,
            height: 500,
            init: (cont) => {
              cont.innerHTML = `
                <div style="display: flex; flex-direction: column; height: 100%;">
                  <div style="padding: 8px; background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 8px;">
                    <button class="btn-primary" style="padding: 4px 12px; font-size: 13px;" id="save-btn-${fullItem.id}">Save</button>
                  </div>
                  <textarea id="text-${fullItem.id}" style="flex: 1; background: transparent; border: none; padding: 16px; color: white; resize: none; outline: none; font-family: var(--font-main); font-size: 15px; line-height: 1.5;">${textContent}</textarea>
                </div>
              `;
              cont.querySelector(`#save-btn-${fullItem.id}`).addEventListener('click', async () => {
                const newContent = cont.querySelector(`#text-${fullItem.id}`).value;
                await window.FS.writeFile(fullItem.parentId, fullItem.name, newContent, 'text/plain');
                State.addNotification('Saved', `${fullItem.name} has been saved.`);
                loadCurrentFolder();
              });
            }
          };
          window.WM.createWindow(noteAppDef);
        } else {
          State.addNotification('Error', `Cannot open file type: ${fullItem.mimeType}`);
        }
      } catch (err) {
        console.error(err);
        State.addNotification('Error', 'Failed to open file');
      }
    };
    container.querySelector('.fm-content').addEventListener('click', (e) => {
      if (!e.target.closest('.fm-item')) {
        selectedItemIds.clear();
        renderItems();
      }
    });
    await loadCurrentFolder();
  }
};
