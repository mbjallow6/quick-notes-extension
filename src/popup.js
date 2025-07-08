// Configuration
const STORAGE_KEY = 'quickNotes';

// DOM elements
let notepad;
let statusElement;

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
        
        updateStatus('Ready');
        
    } catch (error) {
        console.error('Initialization error:', error);
        updateStatus('Error loading notes');
    }
}

function setupEventListeners() {
    // Save on input
    notepad.addEventListener('input', saveNotes);
    
    // Save on window close
    window.addEventListener('beforeunload', saveNotes);
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
        
    } catch (error) {
        console.error('Error saving notes:', error);
        updateStatus('Save failed');
    }
}

function updateStatus(message) {
    statusElement.textContent = message;
}
