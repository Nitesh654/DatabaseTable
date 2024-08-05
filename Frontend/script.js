let tables = {};

document.addEventListener('DOMContentLoaded', () => {
    fetchTables();
});

async function fetchTables() {
    try {
        const response = await fetch('/tables');
        const data = await response.json();

        data.tables.forEach(async (tableName) => {
            const tableList = document.getElementById('tableList');
            const tableItem = document.createElement('div');
            tableItem.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-2');
            tableItem.innerHTML = `
                <span onclick="showTable('${tableName}')">${tableName}</span>
                <button type="button" class="btn-close" aria-label="Close" onclick="removeTable('${tableName}', this)"></button>
            `;
            tableList.appendChild(tableItem);

            const fieldsResponse = await fetch(`/table/${tableName}/fields`);
            if (fieldsResponse.ok) {
                const fieldsData = await fieldsResponse.json();
                tables[tableName] = { fields: fieldsData.fields };
            } else {
                console.error(`Failed to fetch fields for table ${tableName}:`, fieldsResponse.statusText);
                tables[tableName] = { fields: [] };
            }

            showTable(tableName);
        });
    } catch (error) {
        console.error('Error fetching tables:', error);
    }
}

function showForm() {
    const formContainer = document.getElementById('formContainer');
    formContainer.innerHTML = `
        <div class="card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="card-title">Create Table</h5>
                    <button type="button" class="btn-close" aria-label="Close" onclick="closeForm()"></button>
                </div>
                <form id="createTableForm">
                    <div class="mb-3">
                        <label for="tableName" class="form-label">Table Name</label>
                        <input type="text" class="form-control" id="tableName" required>
                    </div>
                    <div id="fieldsContainer">
                        <div class="mb-3">
                            <label for="fieldName1" class="form-label">Field Name</label>
                            <input type="text" class="form-control" id="fieldName1" required>
                        </div>
                        <div class="mb-3">
                            <label for="fieldType1" class="form-label">Field Type</label>
                            <select class="form-select" id="fieldType1" required>
                                <option value="TEXT">Text</option>
                                <option value="INTEGER">Number</option>
                                <option value="STRING">Email</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <button type="button" class="btn btn-secondary mb-1" onclick="addField()">+ Add Another Field</button>
                        <button type="submit" class="btn btn-primary mb-1">Create Table</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('createTableForm').addEventListener('submit', function(event) {
        event.preventDefault();
        createTable();
    });
}

function closeForm() {
    document.getElementById('formContainer').innerHTML = '';
}

function addField() {
    const fieldsContainer = document.getElementById('fieldsContainer');
    const fieldCount = fieldsContainer.childElementCount / 2 + 1;
    const fieldHtml = `
        <div class="mb-3">
            <label for="fieldName${fieldCount}" class="form-label">Field Name</label>
            <input type="text" class="form-control" id="fieldName${fieldCount}" required>
        </div>
        <div class="mb-3">
            <label for="fieldType${fieldCount}" class="form-label">Field Type</label>
            <select class="form-select" id="fieldType${fieldCount}" required>
                <option value="TEXT">Text</option>
                <option value="INTEGER">Number</option>
                <option value="STRING">Email</option>
            </select>
        </div>
    `;
    fieldsContainer.insertAdjacentHTML('beforeend', fieldHtml);
}

async function createTable() {
    const tableName = document.getElementById('tableName').value;
    const tableList = document.getElementById('tableList');
    const tableItem = document.createElement('div');
    tableItem.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-2');
    tableItem.innerHTML = `
        <span onclick="showTable('${tableName}')">${tableName}</span>
        <button type="button" class="btn-close" aria-label="Close" onclick="removeTable('${tableName}', this)"></button>
    `;
    tableList.appendChild(tableItem);

    tables[tableName] = { fields: [] };
    const fieldsContainer = document.getElementById('fieldsContainer');
    for (let i = 1; i <= fieldsContainer.childElementCount / 2; i++) {
        const fieldName = document.getElementById(`fieldName${i}`).value;
        const fieldType = document.getElementById(`fieldType${i}`).value;
        tables[tableName].fields.push({ name: fieldName, type: fieldType });
    }

    await fetch('/table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, fields: tables[tableName].fields })
    });

    document.getElementById('formContainer').innerHTML = '';
}

function removeTable(tableName, button) {
    delete tables[tableName];
    const tableItem = button.parentElement;
    tableItem.remove();
    document.getElementById('formContainer').innerHTML = '';

    fetch(`/table/${tableName}`, {
        method: 'DELETE'
    });
}

function showTable(tableName) {
    const table = tables[tableName];
    const formContainer = document.getElementById('formContainer');
    formContainer.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <h5 class="card-title">${tableName}</h5>
            <button type="button" class="btn btn-secondary" onclick="showInsertForm('${tableName}')">Insert Record</button>
        </div>
        <hr>
        <div id="recordsContainer"></div>
    `;
    updateRecords(tableName);
    
}

function showInsertForm(tableName) {
    const table = tables[tableName];
    const formContainer = document.getElementById('formContainer');
    formContainer.innerHTML += `
        <div class="card mt-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="card-title">Add Record</h5>
                    <button type="button" class="btn-close" aria-label="Close" onclick="closeInsertForm()"></button>
                </div>
                <form id="insertRecordForm">
                    ${table.fields.filter(field => field.name !== 'id' && field.name !== 'createdAt' && field.name !== 'updatedAt').map((field, index) => `
                        <div class="mb-3">
                            <label for="recordField${index}" class="form-label">${field.name}</label>
                            <input type="text" class="form-control" id="recordField${index}" required>
                        </div>
                    `).join('')}
                    <button type="submit" class="btn btn-danger">Add Record</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('insertRecordForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        await addRecord(tableName);
    });
}

function closeInsertForm() {
    const formContainer = document.getElementById('formContainer');
    formContainer.removeChild(formContainer.lastChild);
}

async function addRecord(tableName) {
    const table = tables[tableName];
    const newRecord = {};
    table.fields.filter(field => field.name !== 'id' && field.name !== 'createdAt' && field.name !== 'updatedAt').forEach((field, index) => {
        newRecord[field.name] = document.getElementById(`recordField${index}`).value;
    });

    const response = await fetch(`/table/${tableName}/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
    });

    const data = await response.json();
    if (response.ok) {
        updateRecords(tableName);
        closeInsertForm();
    } else {
        console.error(data.message);
    }
}

async function updateRecords(tableName) {
    if (!tables[tableName]) {
        console.error(`Table ${tableName} is not loaded yet`);
        return;
    } 

    const response = await fetch(`/table/${tableName}`);
    if (response.ok) {
        const records = await response.json();
        const table = tables[tableName];
        table.records = records;

        const recordsContainer = document.getElementById('recordsContainer');
        recordsContainer.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        ${table.fields.map(field => `<th>${field.name}</th>`).join('')}
                        
                    </tr>
                </thead>
                <tbody>
                    ${records.map(record => `
                        <tr>
                            ${table.fields.map(field => `<td>${record[field.name]}</td>`).join('')}
                            
                            <td>
                                <button class="btn btn-secondary btn-sm" onclick="showEditForm('${tableName}', ${record.id})">Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteRecord('${tableName}', ${record.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        console.error('Error fetching records');
    }
}

function showEditForm(tableName, recordId) {
    const table = tables[tableName];
    const record = table.records.find(r => r.id === recordId);
    const formContainer = document.getElementById('formContainer');
    formContainer.innerHTML += `
        <div class="card mt-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="card-title">Edit Record</h5>
                    <button type="button" class="btn-close" aria-label="Close" onclick="closeEditForm()"></button>
                </div>
                <form id="editRecordForm">
                    ${table.fields.filter(field => field.name !== 'id' && field.name !== 'createdAt' && field.name !== 'updatedAt').map((field, index) => `
                        <div class="mb-3">
                            <label for="editField${index}" class="form-label">${field.name}</label>
                            <input type="text" class="form-control" id="editField${index}" value="${record[field.name]}" required>
                        </div>
                    `).join('')}
                    <button type="submit" class="btn btn-primary">Update Record</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('editRecordForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        await editRecord(tableName, recordId);
    });
}

function closeEditForm() {
    const formContainer = document.getElementById('formContainer');
    formContainer.removeChild(formContainer.lastChild);
}

async function editRecord(tableName, recordId) {
    const table = tables[tableName];
    const updatedRecord = {};
    table.fields.filter(field => field.name !== 'id' && field.name !== 'createdAt' && field.name !== 'updatedAt').forEach((field, index) => {
        updatedRecord[field.name] = document.getElementById(`editField${index}`).value;
    });

    const response = await fetch(`/table/${tableName}/record/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRecord)
    });

    if (response.ok) {
        updateRecords(tableName);
        closeEditForm();
    } else {
        const data = await response.json();
        console.error(data.message);
    }
}

async function deleteRecord(tableName, recordId) {
    const response = await fetch(`/table/${tableName}/record/${recordId}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        updateRecords(tableName);
    } else {
        const data = await response.json();
        console.error(data.message);
    }
}

