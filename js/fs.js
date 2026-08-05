class VirtualFileSystem {
  constructor() {
    this.dbName = 'LunarisFS';
    this.dbVersion = 1;
    this.storeName = 'files';
    this.db = null;
    this.currentPath = [];
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('parentId', 'parentId', { unique: false });
          store.createIndex('name', 'name', { unique: false });
        }
      };
    }).then(async () => {
      const rootItems = await this.readdir('root');
      if (rootItems.length === 0) {
        await this.mkdir('root', 'Documents');
        await this.mkdir('root', 'Downloads');
        await this.mkdir('root', 'Pictures');
        await this.writeFile('root', 'readme.txt', 'Welcome to Lunaris OS File System!', 'text/plain');
      }
    });
  }

  generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  async readdir(parentId = 'root') {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('parentId');
      const request = index.getAll(parentId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getFile(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async mkdir(parentId, name) {
    const folder = {
      id: this.generateId(),
      parentId,
      name,
      type: 'folder',
      createdAt: Date.now(),
      modifiedAt: Date.now()
    };
    return this._put(folder);
  }

  async writeFile(parentId, name, content, mimeType) {
    const existingFiles = await this.readdir(parentId);
    const existing = existingFiles.find(f => f.name === name && f.type === 'file');
    
    let size = 0;
    if (content instanceof Blob) {
      size = content.size;
    } else if (typeof content === 'string') {
      size = new Blob([content]).size;
    }

    const file = {
      id: existing ? existing.id : this.generateId(),
      parentId,
      name,
      type: 'file',
      mimeType,
      content,
      size,
      createdAt: existing ? existing.createdAt : Date.now(),
      modifiedAt: Date.now()
    };
    
    return this._put(file);
  }

  async rename(id, newName) {
    const item = await this.getFile(id);
    if (!item) throw new Error('Item not found');
    item.name = newName;
    item.modifiedAt = Date.now();
    return this._put(item);
  }

  async delete(id) {
    const item = await this.getFile(id);
    if (!item) return;

    if (item.type === 'folder') {
      const children = await this.readdir(item.id);
      for (const child of children) {
        await this.delete(child.id);
      }
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  _put(item) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }
}

window.FS = new VirtualFileSystem();
