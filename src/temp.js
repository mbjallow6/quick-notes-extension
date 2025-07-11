function renderChecklist(checklist) {
    const checklistDiv = document.createElement('div');
    checklistDiv.className = `checklist-container ${checklist.isCollapsed ? 'collapsed' : ''}`;
    
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
            <span class="checklist-progress" data-id="${checklist.id}"></span>
            <div class="progress-bar-container">
                <div class="progress-bar"></div>
            </div>
            <button class="btn-delete-item" data-id="${checklist.id}">✕</button>
        </div>
        <textarea class="checklist-description" data-id="${checklist.id}" placeholder="Add a description...">${checklist.description}</textarea>
        <div class="checklist-items">${itemsHtml}</div>
        <button class="btn-add-checklist-item" data-id="${checklist.id}">+ Add item</button>
    `;
    
    contentArea.appendChild(checklistDiv);

    // Event listeners
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
            render(); // Re-render to apply "done" class
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