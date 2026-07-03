// main.js
function parseMatrix(text) {
    return text.trim().split('\n').filter(l => l.trim()).map(l => l.trim().split(/\s+/).map(Number));
}
function parseVector(text) {
    return text.trim().split('\n').filter(l => l.trim()).map(Number);
}

// ===== RENDER TEORÍA =====
function renderTheoryGrid() {
    const grid = document.getElementById('theoryGrid');
    if (!grid) return;
    grid.innerHTML = '';
    topics.forEach(topic => {
        const card = document.createElement('div');
        card.className = 'theory-card';
        card.innerHTML = `
            <h3>${topic.icon} ${topic.title}</h3>
            <p>${topic.description}</p>
            <div class="card-actions">
                <button class="btn-theory-detail" data-id="${topic.id}">Ver detalles</button>
                <a href="calculadora.html?calc=${topic.id}" class="btn-calc-link">🧮 Ir a calculadora</a>
            </div>
        `;
        card.querySelector('.btn-theory-detail').addEventListener('click', function() {
            openTheoryDetail(topic.id);
        });
        grid.appendChild(card);
    });
}

function openTheoryDetail(id) {
    const topic = topics.find(t => t.id === id);
    if (!topic) return;
    const detail = document.getElementById('theoryDetail');
    const content = document.getElementById('theoryDetailContent');
    content.innerHTML = topic.theory;
    // Actualizar enlace a calculadora
    document.getElementById('toCalcFromDetail').href = `calculadora.html?calc=${topic.id}`;
    detail.classList.add('open');
    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Re-renderizar MathJax
    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise().catch(() => {});
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.getElementById('closeTheoryDetail');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            document.getElementById('theoryDetail').classList.remove('open');
        });
    }
});

// ===== RENDER CALCULADORA =====
function renderCalcSelector() {
    const selector = document.getElementById('calcSelector');
    if (!selector) return;
    selector.innerHTML = '';
    topics.forEach(topic => {
        const item = document.createElement('div');
        item.className = 'calc-selector-item';
        item.dataset.id = topic.id;
        item.innerHTML = `<div class="icon">${topic.icon}</div><div class="name">${topic.title}</div>`;
        item.addEventListener('click', function() {
            selectCalculator(topic.id);
        });
        selector.appendChild(item);
    });
}

let currentCalcId = null;

function selectCalculator(id) {
    const topic = topics.find(t => t.id === id);
    if (!topic) return;
    currentCalcId = id;
    // Actualizar selector
    document.querySelectorAll('.calc-selector-item').forEach(el => {
        el.classList.toggle('active', el.dataset.id === id);
    });
    // Renderizar calculadora
    const container = document.getElementById('calcContainer');
    container.innerHTML = `
        <h2>${topic.icon} ${topic.title}</h2>
        <div class="help-box">${topic.calcHelp}</div>
        <form id="calcForm">
            ${topic.calcFields.map(f => `
                <div class="field-group">
                    <label for="${f.id}">${f.label}</label>
                    ${f.type === 'textarea' 
                        ? `<textarea id="${f.id}" ${f.rows ? `rows="${f.rows}"` : ''}>${f.default || ''}</textarea>`
                        : `<input type="${f.type}" id="${f.id}" value="${f.default || ''}" ${f.step ? `step="${f.step}"` : ''} ${f.min !== undefined ? `min="${f.min}"` : ''} ${f.max !== undefined ? `max="${f.max}"` : ''} />`
                    }
                </div>
            `).join('')}
            <div class="calc-actions">
                <button type="button" class="btn-primary" id="calcSubmit">Calcular</button>
                <button type="button" class="btn-secondary" id="calcClear">Limpiar</button>
            </div>
            <div class="result-box" id="calcResult"></div>
        </form>
    `;
    // Eventos
    document.getElementById('calcSubmit').addEventListener('click', function() {
        const values = {};
        topic.calcFields.forEach(f => {
            const el = document.getElementById(f.id);
            values[f.id] = el ? el.value : '';
        });
        const resultBox = document.getElementById('calcResult');
        try {
            const html = topic.calculate(values);
            resultBox.innerHTML = html;
            resultBox.classList.add('visible');
            if (window.MathJax && MathJax.typesetPromise) {
                MathJax.typesetPromise().catch(() => {});
            }
        } catch (e) {
            resultBox.innerHTML = `<span style="color: var(--red);">Error: ${e.message}</span>`;
            resultBox.classList.add('visible');
        }
    });
    document.getElementById('calcClear').addEventListener('click', function() {
        topic.calcFields.forEach(f => {
            const el = document.getElementById(f.id);
            if (el) {
                if (f.type === 'textarea') el.value = f.default || '';
                else el.value = f.default !== undefined ? f.default : '';
            }
        });
        const resultBox = document.getElementById('calcResult');
        resultBox.classList.remove('visible');
        resultBox.innerHTML = '';
    });
    // Si hay parámetro en URL, seleccionar automáticamente
    // Ya lo hace el selector
}

// Inicializar al cargar la página si estamos en calculadora.html
document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const calcId = params.get('calc');
    if (calcId && document.getElementById('calcSelector')) {
        // Esperar a que el selector esté renderizado
        setTimeout(() => selectCalculator(calcId), 100);
    }
});