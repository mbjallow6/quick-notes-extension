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
- [ ] **Implement Rich Notes & Checklists**
    - [x] Basic text note creation
    - [x] Basic checklist creation (add/check/delete items)
    - [x] Add titles to checklists
    - [ ] Add titles to text notes
    - [ ] Add an optional description area to checklists
    - [ ] Make notes and checklists collapsible
    - [ ] Display a visual progress tracker for checklists (e.g., progress bar)
    - [ ] Allow reordering of notes/checklists via drag-and-drop
- [ ] **Add Color-Coding for Notes & Checklists**
- [ ] **Implement Markdown & Code Syntax Highlighting**

### **Epic 2: Advanced Organization & Workflow**
- [ ] Develop a Flexible Tagging System
- [ ] Implement Powerful Full-Text Search

### **Epic 3: Cloud Sync & Integration**
- [ ] Add Google Drive Sync
- [ ] Add GitHub Gist Sync for Code Snippets
- [ ] Implement Contextual Notes (Link notes to specific URLs)
