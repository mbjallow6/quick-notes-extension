# 📝 Quick Notes - Project Plan & Roadmap

This document outlines the development plan for the Quick Notes Chrome Extension. We are following an agile-inspired, iterative approach to build features, track progress, and maintain a clear project vision.

## ✅ **Completed Milestones**

### **V1.1: The Foundation Refactor**
*   **Feature**: Implemented multi-content architecture.
*   **Details**:
    *   Refactored the data storage from a single string to a flexible JSON structure.
    *   Introduced the ability to add and manage separate "Note" and "Checklist" content blocks.
    *   Redesigned the UI to support dynamic rendering of different content types.
    *   Added creation and deletion functionality for each content block.
*   **Pull Request**: `[#1](https://github.com/mbjallow6/quick-notes-extension/pull/1)`

## 🗺️ **Feature Roadmap & Backlog**

This backlog is organized by **Epics**. Each Epic represents a major area of functionality that delivers significant value to the user.

### **Epic 1: Rich & Interactive Content**
- [x] **Implement Rich Notes & Checklists**
    - [x] Basic text note creation
    - [x] Basic checklist creation (add/check/delete items)
    - [x] Add titles to checklists
    - [x] Add titles to text notes
    - [x] Add an optional description area to checklists
    - [x] Make notes and checklists collapsible
    - [x] Display a visual progress tracker for checklists (e.g., progress bar)
    - [x] Allow reordering of notes/checklists via drag-and-drop
- [x] **Add Color-Coding for Notes & Checklists**
    - [x] **Phase 1: Per-Note/Checklist Highlight Colors**
        - [x] Design and implement a discrete UI element (e.g., a small icon/dropdown/pop-up with color swatches) that appears on hover or click for each note and checklist.
        - [x] Define a set of pre-approved, accessible highlight colors (e.g., 5-7 distinct colors) as CSS variables in `popup.css`.
        - [x] Implement the logic in `popup.js` to store the selected color ID for each content item (note/checklist) in the `state`.
        - [x] Modify the rendering functions (`renderTextNote`, `renderChecklist`) to apply the chosen color as a background or border style to the respective container `div` based on the stored `colorId`.
    - [x] **Phase 2: Basic Theming (Light/Dark Mode Toggle)**
        - [x] Add a UI element (e.g., a sun/moon icon toggle) in the header section of `popup.html`.
        - [x] Define CSS variables for both a light theme (current default) and a dark theme in `popup.css`, using a class on the `body` tag.
        - [x] Implement JavaScript logic to toggle the `dark-mode` class on the `body` and persist this preference in `chrome.storage.local`.
        - [x] Ensure all existing UI components (notes, checklists, buttons, text) adapt correctly to the light/dark theme.
- [ ] **Implement Markdown & Code Syntax Highlighting**

### **Epic 2: Advanced Organization & Workflow**
- [ ] Develop a Flexible Tagging System
- [ ] Implement Powerful Full-Text Search

### **Epic 3: Cloud Sync & Integration**
- [ ] Add Google Drive Sync
- [ ] Add GitHub Gist Sync for Code Snippets
- [ ] Implement Contextual Notes (Link notes to specific URLs)
