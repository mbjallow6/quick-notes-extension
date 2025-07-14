// --- CONFIGURATION ---
const STORAGE_KEY = 'quickNotesData';
const DEBOUNCE_DELAY = 500; // ms

const HIGHLIGHT_COLORS = [
    { name: 'red', var: '--highlight-red', textVar: '--text-red' },
    { name: 'blue', var: '--highlight-blue', textVar: '--text-blue' },
    { name: 'green', var: '--highlight-green', textVar: '--text-green' },
    { name: 'yellow', var: '--highlight-yellow', textVar: '--text-yellow' },
    { name: 'purple', var: '--highlight-purple', textVar: '--text-purple' },
    { name: 'gray', var: '--highlight-gray', textVar: '--text-gray' },
    { name: 'none', var: 'transparent', textVar: '--text-color' } // Option to remove color
];

function createColorPalette(contentId, currentSelectedColor) {
    const paletteDiv = document.createElement('div');
    paletteDiv.className = 'color-palette';
    paletteDiv.dataset.contentId = contentId; // To link palette to specific note/checklist

    HIGHLIGHT_COLORS.forEach(color => {
        const colorSwatch = document.createElement('button');
        colorSwatch.className = 'color-swatch';
        colorSwatch.style.backgroundColor = `var(${color.var})`;
        colorSwatch.dataset.colorName = color.name;
        colorSwatch.title = color.name.charAt(0).toUpperCase() + color.name.slice(1);

        if (currentSelectedColor === color.name) {
            colorSwatch.classList.add('selected');
        }

        colorSwatch.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent header collapse when clicking swatch
            applyColorToContent(contentId, color.name);
            // Hide the palette after selection
            paletteDiv.remove();
        });
        paletteDiv.appendChild(colorSwatch);
    });

    return paletteDiv;
}

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
    
    // Initialize drag and drop
    initializeDragAndDrop(); // ← Add this line
    
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
            // --- KEY CHANGE ---
            // Each render function now returns the created element.
            // This allows us to get a reference to the DOM node.
            const element = item.type === 'note' 
                ? renderTextNote(item) 
                : renderChecklist(item);
            contentArea.appendChild(element);
        });
    }
}


function renderWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-message';
    welcomeDiv.innerHTML = `<p>It's a bit empty here. <br> Add a note or a checklist to get started!</p>`;
    // --- KEY CHANGE ---
    // Welcome message is now appended directly in render()
    contentArea.appendChild(welcomeDiv);
}


function renderTextNote(note) {
    const noteDiv = document.createElement('div');
    noteDiv.className = `note-container ${note.isCollapsed ? 'collapsed' : ''} ${note.color ? 'color-' + note.color : ''}`;
    noteDiv.draggable = true; 
    noteDiv.dataset.id = note.id; // Add ID for easier lookup
    
    noteDiv.innerHTML = `
        <div class="note-header">
            <span class="drag-handle">⋮⋮</span>
            <span class="collapse-icon">${note.isCollapsed ? '▶' : '▼'}</span>
            <input type="text" class="note-title" value="${note.title}" placeholder="Note Title">
            <button class="btn-color-picker" title="Pick a color">🎨</button>
            <button class="btn-delete-item">✕</button>
        </div>
        <textarea class="note-textarea" placeholder="Start typing your note...">${note.content}</textarea>
    `;
    
    noteDiv.querySelector('.note-header').addEventListener('click', (e) => {
        if (e.target.matches('input') || e.target.matches('button') || e.target.closest('.color-palette')) return;
        
        const contentItem = state.content.find(item => item.id === note.id);
        contentItem.isCollapsed = !contentItem.isCollapsed;
        noteDiv.classList.toggle('collapsed');
        noteDiv.querySelector('.collapse-icon').textContent = contentItem.isCollapsed ? '▶' : '▼';
        scheduleSave();
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

    const colorPickerBtn = noteDiv.querySelector('.btn-color-picker');
    colorPickerBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent header collapse
        const existingPalette = noteDiv.querySelector('.color-palette');
        if (existingPalette) {
            existingPalette.remove();
        } else {
            const palette = createColorPalette(note.id, note.color);
            colorPickerBtn.after(palette);
        }
    });

    return noteDiv; // --- KEY CHANGE --- Return the element
}

function renderChecklist(checklist) {
    const checklistDiv = document.createElement('div');
    checklistDiv.className = `checklist-container ${checklist.isCollapsed ? 'collapsed' : ''} ${checklist.color ? 'color-' + checklist.color : ''}`;
    checklistDiv.draggable = true;
    checklistDiv.dataset.id = checklist.id; // Add ID for easier lookup
    
    const progress = calculateChecklistProgress(checklist.id);
    
    const itemsHtml = checklist.items.map(item => `
        <div class="checklist-item ${item.done ? 'done' : ''}" data-item-id="${item.id}">
            <input type="checkbox" data-item-id="${item.id}" ${item.done ? 'checked' : ''}>
            <input type="text" class="checklist-item-text" data-item-id="${item.id}" value="${item.text}" placeholder="New item...">
            <button class="btn-delete-checklist-item" data-item-id="${item.id}">-</button>
        </div>
    `).join('');
    
    checklistDiv.innerHTML = `
        <div class="checklist-header">
            <span class="drag-handle">⋮⋮</span>
            <span class="collapse-icon">${checklist.isCollapsed ? '▶' : '▼'}</span>
            <input type="text" class="checklist-title" value="${checklist.title}" placeholder="Checklist Title">
            <button class="btn-color-picker" title="Pick a color">🎨</button>
            <button class="btn-delete-item">✕</button>
        </div>
        <div class="checklist-progress">
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${progress.percentage}%"></div>
            </div>
            <span class="progress-text">${progress.completed}/${progress.total}</span>
        </div>
        <textarea class="checklist-description" placeholder="Add a description...">${checklist.description}</textarea>
        <div class="checklist-items">${itemsHtml}</div>
        <button class="btn-add-checklist-item">+ Add item</button>
    `;
    
    checklistDiv.querySelector('.checklist-header').addEventListener('click', (e) => {
        if (e.target.matches('input') || e.target.matches('button') || e.target.closest('.color-palette')) return;
        
        const contentItem = state.content.find(item => item.id === checklist.id);
        contentItem.isCollapsed = !contentItem.isCollapsed;
        checklistDiv.classList.toggle('collapsed');
        checklistDiv.querySelector('.collapse-icon').textContent = contentItem.isCollapsed ? '▶' : '▼';
        scheduleSave();
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

    const colorPickerBtn = checklistDiv.querySelector('.btn-color-picker');
    colorPickerBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent header collapse
        const existingPalette = checklistDiv.querySelector('.color-palette');
        if (existingPalette) {
            existingPalette.remove();
        } else {
            const palette = createColorPalette(checklist.id, checklist.color);
            colorPickerBtn.after(palette);
        }
    });
    
    // Use event delegation for checklist items for better performance
    checklistDiv.querySelector('.checklist-items').addEventListener('click', (e) => {
        const itemId = e.target.closest('.checklist-item')?.dataset.itemId;
        if (!itemId) return;

        if (e.target.matches('.btn-delete-checklist-item')) {
            deleteChecklistItem(checklist.id, itemId);
        }
    });

    checklistDiv.querySelector('.checklist-items').addEventListener('input', (e) => {
        const itemId = e.target.closest('.checklist-item')?.dataset.itemId;
        if (!itemId) return;
        
        const item = checklist.items.find(i => i.id === itemId);
        if (e.target.matches('.checklist-item-text')) {
            item.text = e.target.value;
            scheduleSave();
        } else if (e.target.matches('input[type="checkbox"]')) {
            item.done = e.target.checked;
            e.target.closest('.checklist-item').classList.toggle('done', item.done);
            updateProgressBar(checklist.id, checklistDiv);
            scheduleSave();
        }
    });

    return checklistDiv; // --- KEY CHANGE --- Return the element
}



function applyColorToContent(contentId, colorName) {
    const contentItem = state.content.find(item => item.id === contentId);
    if (contentItem) {
        contentItem.color = colorName;
        scheduleSave();
        render(); // Re-render to apply new color
    }
}

// --- CONTENT MANIPULATION ---

function addContent(type) {
    const id = `id-${Date.now()}`;
    let newItem;
    
    if (type === 'note') {
        newItem = { id, type: 'note', title: 'New Note', content: '', isCollapsed: false, color: null };
    } else if (type === 'checklist') {
        newItem = {
            id, type: 'checklist', title: 'My Checklist', description: '', isCollapsed: false,
            items: [{ id: `item-${Date.now()}`, text: '', done: false }], color: null
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
        render(); // Full render is okay here as it's a significant change
    }
}

function deleteChecklistItem(checklistId, itemId) {
    const checklist = state.content.find(c => c.id === checklistId);
    if (checklist) {
        checklist.items = checklist.items.filter(item => item.id !== itemId);
        scheduleSave();
        render(); // Full render is okay here
    }
}

function updateStatus(message) {
    if (statusElement) statusElement.textContent = message;
}


// --- PROGRESS BAR FUNCTIONS ---
function calculateChecklistProgress(checklistId) {
    const checklist = state.content.find(item => item.id === checklistId);
    if (!checklist || !checklist.items || checklist.items.length === 0) {
        return { percentage: 0, completed: 0, total: 0 };
    }
    
    const total = checklist.items.length;
    const completed = checklist.items.filter(item => item.done).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { percentage, completed, total };
}

function updateProgressBar(checklistId, container) {
    const progress = calculateChecklistProgress(checklistId);
    const progressFill = container.querySelector('.progress-bar-fill');
    const progressText = container.querySelector('.progress-text');
    
    if (progressFill && progressText) {
        progressFill.style.width = `${progress.percentage}%`;
        progressText.textContent = `${progress.completed}/${progress.total}`;
    }
}

// --- DRAG AND DROP FUNCTIONS ---

let draggedItem = null;

function initializeDragAndDrop() {
    contentArea.addEventListener('dragstart', handleDragStart);
    contentArea.addEventListener('dragend', handleDragEnd);
    contentArea.addEventListener('dragover', handleDragOver);
    contentArea.addEventListener('drop', handleDrop);
    contentArea.addEventListener('dragenter', handleDragEnter);
    contentArea.addEventListener('dragleave', handleDragLeave);
}

function handleDragStart(e) {
    const container = e.target.closest('.note-container, .checklist-container');
    if (!container || e.target.matches('input, textarea, button, .collapse-icon')) {
        e.preventDefault();
        return;
    }
    
    draggedItem = container;
    
    // Add a slight delay to allow the browser to create a drag image
    setTimeout(() => {
        draggedItem.classList.add('dragging');
    }, 0);
    
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    if (!draggedItem) return;
    draggedItem.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    draggedItem = null;
}

function handleDragOver(e) {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    const targetContainer = e.target.closest('.note-container, .checklist-container');
    if (targetContainer && targetContainer !== draggedItem) {
        targetContainer.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    const targetContainer = e.target.closest('.note-container, .checklist-container');
    if (targetContainer) {
        targetContainer.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const targetContainer = e.target.closest('.note-container, .checklist-container');
    if (!targetContainer || !draggedItem || targetContainer === draggedItem) return;

    const fromId = draggedItem.dataset.id;
    const toId = targetContainer.dataset.id;
    
    // 1. Reorder the DOM elements for immediate visual feedback
    const fromIndex = [...contentArea.children].indexOf(draggedItem);
    const toIndex = [...contentArea.children].indexOf(targetContainer);
    
    if (fromIndex < toIndex) {
        targetContainer.after(draggedItem);
    } else {
        targetContainer.before(draggedItem);
    }

    // 2. Reorder the state array to match the new DOM order
    const fromStateIndex = state.content.findIndex(item => item.id === fromId);
    const toStateIndex = state.content.findIndex(item => item.id === toId);

    const [movedItem] = state.content.splice(fromStateIndex, 1);
    state.content.splice(toStateIndex, 0, movedItem);

    // 3. Save the new state
    scheduleSave();
    
    // 4. Clean up visual indicators
    targetContainer.classList.remove('drag-over');
}
