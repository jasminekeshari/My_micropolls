// TabMaster Implementation - backend/tabMaster.js

class DLLNode {
  constructor(id) {
    this.id = id;
    this.prev = null;
    this.next = null;
  }
}

class MRUList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.map = new Map();
  }

  add(id) {
    if (this.map.has(id)) {
      this.moveToHead(id);
      return;
    }
    const node = new DLLNode(id);
    this.map.set(id, node);
    
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
  }

  moveToHead(id) {
    if (!this.map.has(id)) return;
    const node = this.map.get(id);
    
    if (node === this.head) return;
    
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    
    if (node === this.tail) {
      this.tail = node.prev;
    }
    
    node.prev = null;
    node.next = this.head;
    this.head.prev = node;
    this.head = node;
  }

  remove(id) {
    if (!this.map.has(id)) return;
    const node = this.map.get(id);
    
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    
    if (node === this.head) this.head = node.next;
    if (node === this.tail) this.tail = node.prev;
    
    this.map.delete(id);
  }

  getRecents(m) {
    const result = [];
    let current = this.head;
    while (current && result.length < m) {
      result.push(current.id);
      current = current.next;
    }
    return result;
  }
}

class Tab {
  constructor(id, url) {
    this.id = id;
    this.currentURL = url;
    this.backStack = [];
    this.forwardStack = [];
  }

  open(url) {
    if (this.currentURL) {
      this.backStack.push(this.currentURL);
    }
    this.currentURL = url;
    this.forwardStack = [];
  }

  back(k) {
    while (k > 0 && this.backStack.length > 0) {
      this.forwardStack.push(this.currentURL);
      this.currentURL = this.backStack.pop();
      k--;
    }
    return this.currentURL;
  }

  forward(k) {
    while (k > 0 && this.forwardStack.length > 0) {
      this.backStack.push(this.currentURL);
      this.currentURL = this.forwardStack.pop();
      k--;
    }
    return this.currentURL;
  }
}

function tabMaster(commands) {
  const tabs = new Map();
  const downloadQueue = [];
  const mruList = new MRUList();
  let activeTabId = null;
  let nextTabId = 1;
  const outputs = [];

  for (const command of commands) {
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0];

    switch (cmd) {
      case 'NEWTAB': {
        const url = parts[1];
        const tab = new Tab(nextTabId, url);
        tabs.set(nextTabId, tab);
        activeTabId = nextTabId;
        mruList.add(nextTabId);
        nextTabId++;
        break;
      }

      case 'OPEN': {
        const url = parts[1];
        if (activeTabId !== null && tabs.has(activeTabId)) {
          tabs.get(activeTabId).open(url);
          mruList.moveToHead(activeTabId);
        }
        break;
      }

      case 'BACK': {
        const k = parseInt(parts[1]);
        if (activeTabId !== null && tabs.has(activeTabId)) {
          const result = tabs.get(activeTabId).back(k);
          outputs.push(result);
          mruList.moveToHead(activeTabId);
        }
        break;
      }

      case 'FORWARD': {
        const k = parseInt(parts[1]);
        if (activeTabId !== null && tabs.has(activeTabId)) {
          const result = tabs.get(activeTabId).forward(k);
          outputs.push(result);
          mruList.moveToHead(activeTabId);
        }
        break;
      }

      case 'SWITCH': {
        const tabId = parseInt(parts[1]);
        if (tabs.has(tabId)) {
          activeTabId = tabId;
          mruList.moveToHead(tabId);
        }
        break;
      }

      case 'CLOSE': {
        const tabId = parseInt(parts[1]);
        if (tabs.has(tabId)) {
          tabs.delete(tabId);
          mruList.remove(tabId);
          if (activeTabId === tabId) {
            activeTabId = tabs.size > 0 ? tabs.keys().next().value : null;
          }
        }
        break;
      }

      case 'QUEUE': {
        const file = parts[1];
        downloadQueue.push(file);
        break;
      }

      case 'TICK': {
        const k = parseInt(parts[1]);
        for (let i = 0; i < k && downloadQueue.length > 0; i++) {
          downloadQueue.shift();
        }
        break;
      }

      case 'LIST': {
        if (activeTabId !== null && tabs.has(activeTabId)) {
          const tab = tabs.get(activeTabId);
          const output = `${activeTabId} ${tab.currentURL} ${tab.backStack.length} ${tab.forwardStack.length} ${downloadQueue.length}`;
          outputs.push(output);
        }
        break;
      }

      case 'RECENTS': {
        const m = parseInt(parts[1]);
        const recents = mruList.getRecents(m);
        outputs.push(recents.length > 0 ? recents.join(' ') : 'EMPTY');
        break;
      }
    }
  }

  return outputs;
}

module.exports = { tabMaster };