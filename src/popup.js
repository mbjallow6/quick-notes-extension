// --- CONFIGURATION ---
const STORAGE_KEY = 'quickNotesData';
const DEBOUNCE_DELAY = 500; // ms

// --- DOM ELEMENTS ---
let contentArea, addNoteBtn, addChecklistBtn, statusElement, clearBtn;

// --- STATE ---
let state = {};
let saveTimeout;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', main);

function main() {
    // Assign DOM elements
    contentArea = document.getElementById('contentArea');
    addNoteBtn = document.getElementById('addNoteBtn');
    addChecklistBtn = document.getElementById('addChecklistBtn');
    statusElement = document.querySelector('.status');
    clearBtn = document.getElementById('clearBtn');

    // Attach event listeners
    addNoteBtn.addEventListener('click', () => addContent('note'));
    addChecklistBtn.addEventListener('click', () => addContent('checklist'));
    clearBtn.addEventListener('click', clearAllData);
    
    // Load initial data
    loadData();
}

// --- DATA MANAGEMENT ---

async function loadData() {
    try {
        const result = await chrome.storage.local.get(STORAGE_KEY);
        state = result[STORAGE_KEY] || getInitialState();
        render();
        updateStatus('Ready');
    } catch (error) {
        console.error('Error loading data:', error);
        updateStatus('Error loading data');
    }
}

function getInitialState() {
    return {
        content: []
    };
}

function scheduleSave() {
    clearTimeout(saveTimeout);
    updateStatus('Typing...');
    saveTimeout = setTimeout(saveData, DEBOUNCE_DELAY);
}

async function saveData() {
    try {
        await chrome.storage.local.set({ [STORAGE_KEY]: state });
        updateStatus('Saved!');
        setTimeout(() => updateStatus('Ready'), 1500);
    } catch (error) {
        console.error('Error saving data:', error);
        updateStatus('Save failed');
    }
}

async function clearAllData() {
    if (confirm('Are you sure you want to delete everything? This cannot be undone.')) {
        state = getInitialState();
        await saveData();
        render();
        updateStatus('All cleared');
    }
}

// --- RENDERING ---

function render() {
    contentArea.innerHTML = ''; // Clear previous content
    if (state.content.length === 0) {
        renderWelcomeMessage();
    } else {
        state.content.forEach(item => {
            if (item.type === 'note') {
                renderTextNote(item);
            } else if (item.type === 'checklist') {
                renderChecklist(item);
            }
        });
    }
}

function renderWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-message';
    welcomeDiv.innerHTML = `<p>It's a bit empty here. <br> Add a note or a checklist to get started!</p>`;
    contentArea.appendChild(welcomeDiv);
}

function renderTextNote(note) {
    const noteDiv = document.createElement('div');
    noteDiv.className = `note-container ${note.isCollapsed ? 'collapsed' : ''}`;
    noteDiv.innerHTML = `
        <div class="note-header" data-id="${note.id}">
            <span class="collapse-icon">${note.isCollapsed ? '▶' : '▼'}</span>
            <input type="text" class="note-title" data-id="${note.id}" value="${note.title}" placeholder="Note Title">
            <button class="btn-delete-item" data-id="${note.id}">✕</button>
        </div>
        <textarea class="note-textarea" data-id="${note.id}" placeholder="Start typing your note...">${note.content}</textarea>
    `;
    contentArea.appendChild(noteDiv);
    
    // Event listeners
    noteDiv.querySelector('.note-header').addEventListener('click', (e) => {
        // Prevent toggling when interacting with input or button
        if (e.target.matches('input') || e.target.matches('button')) {
            return;
        }
        note.isCollapsed = !note.isCollapsed;
        scheduleSave();
        render();
    });

    const titleInput = noteDiv.querySelector('.note-title');
    titleInput.addEventListener('input', () => {
        note.title = titleInput.value;
        scheduleSave();
    });

    const textarea = noteDiv.querySelector('textarea');
    textarea.addEventListener('input', () => {
        note.content = textarea.value;
        scheduleSave();
    });
    
    noteDiv.querySelector('.btn-delete-item').addEventListener('click', () => {
        deleteContent(note.id);
    });
}

function renderChecklist(checklist) {
    const checklistDiv = document.createElement('div');
    checklistDiv.className = `checklist-container ${checklist.isCollapsed ? 'collapsed' : ''}`;
    
    // Calculate progress for this checklist
    const progress = calculateChecklistProgress(checklist.id);
    
    const itemsHtml = checklist.items.map(item => `
        <div class="checklist-item ${item.done ? 'done' : ''}">
            <input type="checkbox" data-id="${checklist.id}" data-item-id="${item.id}" ${item.done ? 'checked' : ''}>
            <input type="text" class="checklist-item-text" data-id="${checklist.id}" data-item-id="${item.id}" value="${item.text}" placeholder="New item...">
            <button class="btn-delete-checklist-item" data-id="${checklist.id}" data-item-id="${item.id}">-</button>
        </div>
    `).join('');
    
    checklistDiv.innerHTML = `
        <div class="checklist-header" data-id="${checklist.id}">
            <span class="collapse-icon">${checklist.isCollapsed ? '▶' : '▼'}</span>
            <input type="text" class="checklist-title" data-id="${checklist.id}" value="${checklist.title}" placeholder="Checklist Title">
            <button class="btn-delete-item" data-id="${checklist.id}">✕</button>
        </div>
        
        <div class="checklist-progress">
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${progress.percentage}%"></div>
            </div>
            <span class="progress-text">${progress.completed}/${progress.total}</span>
        </div>
        
        <textarea class="checklist-description" data-id="${checklist.id}" placeholder="Add a description...">${checklist.description}</textarea>
        <div class="checklist-items">${itemsHtml}</div>
        <button class="btn-add-checklist-item" data-id="${checklist.id}">+ Add item</button>
    `;
    
    contentArea.appendChild(checklistDiv);

    // ALL YOUR EXISTING EVENT LISTENERS (unchanged)
    checklistDiv.querySelector('.checklist-header').addEventListener('click', (e) => {
        if (e.target.matches('input') || e.target.matches('button')) {
            return;
        }
        checklist.isCollapsed = !checklist.isCollapsed;
        scheduleSave();
        render();
    });

    checklistDiv.querySelector('.checklist-title').addEventListener('input', (e) => {
        checklist.title = e.target.value;
        scheduleSave();
    });
    
    checklistDiv.querySelector('.checklist-description').addEventListener('input', (e) => {
        checklist.description = e.target.value;
        scheduleSave();
    });

    checklistDiv.querySelector('.btn-add-checklist-item').addEventListener('click', () => {
        addChecklistItem(checklist.id);
    });
    
    checklistDiv.querySelector('.btn-delete-item').addEventListener('click', () => {
        deleteContent(checklist.id);
    });

    checklistDiv.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const itemId = e.target.dataset.itemId;
            const item = checklist.items.find(i => i.id === itemId);
            item.done = e.target.checked;
            scheduleSave();
            render(); // This will update the progress bar automatically
        });
    });

    checklistDiv.querySelectorAll('.checklist-item-text').forEach(input => {
        input.addEventListener('input', (e) => {
            const itemId = e.target.dataset.itemId;
            const item = checklist.items.find(i => i.id === itemId);
            item.text = e.target.value;
            scheduleSave();
        });
    });
    
    checklistDiv.querySelectorAll('.btn-delete-checklist-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.target.dataset.itemId;
            deleteChecklistItem(checklist.id, itemId);
        });
    });
}


// --- CONTENT MANIPULATION ---

function addContent(type) {
    const id = `id-${Date.now()}`;
    let newItem;
    
    if (type === 'note') {
        newItem = { id, type: 'note', title: 'New Note', content: '', isCollapsed: false };
    } else if (type === 'checklist') {
        newItem = {
            id,
            type: 'checklist',
            title: 'My Checklist',
            description: '',
            isCollapsed: false,
            items: [{ id: `item-${Date.now()}`, text: '', done: false }]
        };
    }
    
    state.content.push(newItem);
    scheduleSave();
    render();
}

function deleteContent(id) {
    state.content = state.content.filter(item => item.id !== id);
    scheduleSave();
    render();
}

function addChecklistItem(checklistId) {
    const checklist = state.content.find(c => c.id === checklistId);
    if (checklist) {
        const newItem = { id: `item-${Date.now()}`, text: '', done: false };
        checklist.items.push(newItem);
        scheduleSave();
        render();
    }
}

function deleteChecklistItem(checklistId, itemId) {
    const checklist = state.content.find(c => c.id === checklistId);
    if (checklist) {
        checklist.items = checklist.items.filter(item => item.id !== itemId);
        scheduleSave();
        render();
    }
}

function updateStatus(message) {
    if (statusElement) {
        statusElement.textContent = message;
    }
}


// --- PROGRESS BAR FUNCTIONS ---
function calculateChecklistProgress(checklistId) {
    const checklist = state.content.find(item => item.id === checklistId);
    if (!checklist || !checklist.items || checklist.items.length === 0) {
        return { percentage: 0, completed: 0, total: 0 };
    }
    
    const total = checklist.items.length;
    const completed = checklist.items.filter(item => item.done).length;
    const percentage = Math.round((completed / total) * 100);
    
    return { percentage, completed, total };
}

function updateProgressBar(checklistId) {
    const progress = calculateChecklistProgress(checklistId);
    const progressFill = document.querySelector(`[data-checklist-id="${checklistId}"] .progress-bar-fill`);
    const progressText = document.querySelector(`[data-checklist-id="${checklistId}"] .progress-text`);
    
    if (progressFill && progressText) {
        progressFill.style.width = `${progress.percentage}%`;
        progressText.textContent = `${progress.completed}/${progress.total}`;
        
        // Optional: Change color when complete
        if (progress.percentage === 100) {
            progressFill.style.backgroundColor = '#22c55e'; // Green for completion
        } else {
            progressFill.style.backgroundColor = 'var(--primary-color)';
        }
    }
}