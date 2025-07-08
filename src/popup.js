// Configuration
const STORAGE_KEY = 'quickNotes';
const AUTO_SAVE_DELAY = 1000; // 1 second

// DOM elements
let notepad;
let statusElement;
let charCountElement;

// State management
let autoSaveTimer;
let isInitialized = false;

// Initialize extension
document.addEventListener('DOMContentLoaded', initializeExtension);

async function initializeExtension() {
    try {
        // Get DOM elements
        notepad = document.getElementById('notepad');
        statusElement = document.querySelector('.status');
        
        // Load saved notes
        await loadNotes();
        
        // Set up event listeners
        setupEventListeners();
        
        // Focus on textarea
        notepad.focus();
        notepad.setSelectionRange(notepad.value.length, notepad.value.length);
        
        isInitialized = true;
        updateStatus('Ready');
        
    } catch (error) {
        console.error('Initialization error:', error);
        updateStatus('Error loading notes');
    }
}

function setupEventListeners() {
    // Auto-save on input with debouncing
    notepad.addEventListener('input', handleInput);
    
    // Save on window close
    window.addEventListener('beforeunload', saveNotes);
    
    // Keyboard shortcuts
    notepad.addEventListener('keydown', handleKeyDown);
}

function handleInput() {
    if (!isInitialized) return;
    
    // Clear existing timer
    if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
    }
    
    // Show typing status
    updateStatus('Typing...');
    
    // Set new auto-save timer
    autoSaveTimer = setTimeout(() => {
        saveNotes();
    }, AUTO_SAVE_DELAY);
}

function handleKeyDown(event) {
    // Ctrl+S to save
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        saveNotes();
        updateStatus('Saved!');
    }
}

async function loadNotes() {
    try {
        const result = await chrome.storage.local.get([STORAGE_KEY]);
        const savedNotes = result[STORAGE_KEY] || '';
        notepad.value = savedNotes;
    } catch (error) {
        console.error('Error loading notes:', error);
        throw error;
    }
}

async function saveNotes() {
    try {
        const notes = notepad.value;
        await chrome.storage.local.set({
            [STORAGE_KEY]: notes
        });
        
        updateStatus('Saved');
        
        // Reset status after delay
        setTimeout(() => {
            if (isInitialized) {
                updateStatus('Ready');
            }
        }, 1500);
        
    } catch (error) {
        console.error('Error saving notes:', error);
        updateStatus('Save failed');
    }
}

function updateStatus(message) {
    statusElement.textContent = message;
}

function updateCharCount() {
    const charCountElement = document.getElementById('charCount');
    if (charCountElement) {
        const count = notepad.value.length;
        charCountElement.textContent = count.toLocaleString();
    }
}

// Update the handleInput function to include character counting
function handleInput() {
    if (!isInitialized) return;
    
    // Update character count
    updateCharCount();
    
    // Clear existing timer
    if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
    }
    
    // Show typing status
    updateStatus('Typing...');
    
    // Set new auto-save timer
    autoSaveTimer = setTimeout(() => {
        saveNotes();
    }, AUTO_SAVE_DELAY);
}

// Update initializeExtension to include initial character count
async function initializeExtension() {
    try {
        // Get DOM elements
        notepad = document.getElementById('notepad');
        statusElement = document.querySelector('.status');
        
        // Load saved notes
        await loadNotes();
        
        // Set up event listeners
        setupEventListeners();
        
        // Update character count
        updateCharCount();
        
        // Focus on textarea
        notepad.focus();
        notepad.setSelectionRange(notepad.value.length, notepad.value.length);
        
        isInitialized = true;
        updateStatus('Ready');
        
    } catch (error) {
        console.error('Initialization error:', error);
        updateStatus('Error loading notes');
    }
}
