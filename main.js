// main.js - Funciones de renderizado y gráficos

// ================================================================
//  FUNCIONES AUXILIARES
// ================================================================
function parseMatrix(text) {
    return text.trim().split('\n').filter(l => l.trim()).map(l => l.trim().split(/\s+/).map(Number));
}
function parseVector(text) {
    return text.trim().split('\n').filter(l => l.trim()).map(Number);
}

// ================================================================
//  GRÁFICOS CON CHART.JS
// ================================================================
const chartRegistry = {};

function destroyChart(id) {
    if (chartRegistry[id]) {
        chartRegistry[id].destroy();
        delete chartRegistry[id];
    }
}

function makeLineChart(canvasId, labels, datasets, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    destroyChart(canvasId);
    const ctx = canvas.getContext('2d');
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#8b949e', font: { size: 11 } } },
            tooltip: { backgroundColor: '#1c2230', titleColor: '#e6edf3', bodyColor: '#8b949e' }
        },
        scales: {
            x: { grid: { color: '#21262d' }, ticks: { color: '#8b949e', font: { size: 10 } } },
            y: { grid: { color: '#21262d' }, ticks: { color: '#8b949e', font: { size: 10 } } }
        }
    };
    const mergedOptions = deepMerge(defaultOptions, options);
    chartRegistry[canvasId] = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: mergedOptions
    });
}

function makeScatterChart(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    destroyChart(canvasId);
    const ctx = canvas.getContext('2d');
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#8b949e', font: { size: 11 } } },
            tooltip: { backgroundColor: '#1c2230', titleColor: '#e6edf3', bodyColor: '#8b949e' }
        },
        scales: {
            x: { grid: { color: '#21262d' }, ticks: { color: '#8b949e', font: { size: 10 } } },
            y: { grid: { color: '#21262d' }, ticks: { color: '#8b949e', font: { size: 10 } } }
        }
    };
    const mergedOptions = deepMerge(defaultOptions, options);
    chartRegistry[canvasId] = new Chart(ctx, {
        type: 'scatter',
        data: { datasets: data },
        options: mergedOptions
    });
}

function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(target[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

// ================================================================
//  BUILDFN SAFE (para evaluar funciones matemáticas)
// ================================================================
function parseFunc(raw) {
    if (!raw || !raw.trim()) return null;
    let s = raw.trim();
    s = s.replace(/\^/g, '**');
    s = s.replace(/\bln\b/g, 'Math.log');
    s = s.replace(/\blog\b/g, 'Math.log10');
    s = s.replace(/\bexp\b/g, 'Math.exp');
    s = s.replace(/\bsqrt\b/g, 'Math.sqrt');
    s = s.replace(/\bsin\b/g, 'Math.sin');
    s = s.replace(/\bcos\b/g, 'Math.cos');
    s = s.replace(/\btan\b/g, 'Math.tan');
    s = s.replace(/\babs\b/g, 'Math.abs');
    s = s.replace(/\bpi\b/gi, 'Math.PI');
    s = s.replace(/\be\b(?![+-]?\d)/g, 'Math.E');
    return s;
}

function buildFn(raw) {
    const parsed = parseFunc(raw);
    if (!parsed) return null;
    try {
        return new Function('x', `"use strict"; return (${parsed});`);
    } catch(e) { return null; }
}

function buildFnSafe(raw) {
    const f = buildFn(raw);
    if (!f) return null;
    return (x) => { try { const v = f(x); return isFinite(v) ? v : NaN; } catch(e){ return NaN; } };
}

// ================================================================
//  TOOLBAR DE SÍMBOLOS Y PRESETS
// ================================================================
const SYMBOLS = ['+', '-', '*', '/', '(', ')', '^', '.', ','];
const FUNCTIONS = ['sin(', 'cos(', 'tan(', 'exp(', 'ln(', 'sqrt(', 'abs(', 'pi', 'e'];
const PRESETS = [
    { label: 'x³-x-2', val: 'x^3 - x - 2' },
    { label: 'x³-4x-9', val: 'x^3 - 4*x - 9' },
    { label: 'e^(-x)-x', val: 'exp(-x) - x' },
    { label: 'cos(x)-x', val: 'cos(x) - x' },
    { label: 'ln(x)+x²-4', val: 'ln(x) + x^2 - 4' },
    { label: 'x²-5', val: 'x^2 - 5' },
    { label: 'x³-2x-5', val: 'x^3 - 2*x - 5' }
];

function buildToolbar(inputId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    // Símbolos
    const symGroup = document.createElement('div');
    symGroup.className = 'sym-group';
    SYMBOLS.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'sym-btn';
        btn.textContent = s;
        btn.onclick = () => insertAtCursor(inputId, s);
        symGroup.appendChild(btn);
    });
    container.appendChild(symGroup);

    // Funciones
    const funcGroup = document.createElement('div');
    funcGroup.className = 'sym-group';
    FUNCTIONS.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'sym-btn';
        btn.textContent = s.replace('(', '(…)');
        btn.onclick = () => insertAtCursor(inputId, s);
        funcGroup.appendChild(btn);
    });
    container.appendChild(funcGroup);

    // Presets
    const presetGroup = document.createElement('div');
    presetGroup.className = 'preset-group';
    PRESETS.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'preset-btn';
        btn.textContent = p.label;
        btn.onclick = () => {
            document.getElementById(inputId).value = p.val;
            updatePreview(inputId);
        };
        presetGroup.appendChild(btn);
    });
    container.appendChild(presetGroup);
}

function insertAtCursor(inputId, text) {
    const el = document.getElementById(inputId);
    if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    el.value = el.value.slice(0, s) + text + el.value.slice(e);
    el.selectionStart = el.selectionEnd = s + text.length;
    el.focus();
    el.dispatchEvent(new Event('input'));
}

function updatePreview(inputId) {
    const el = document.getElementById(inputId);
    const previewId = inputId + '-preview';
    const preview = document.getElementById(previewId);
    if (!el || !preview) return;
    const raw = el.value;
    const f = buildFnSafe(raw);
    if (!f) {
        preview.textContent = '⚠ expresión inválida';
        preview.style.color = 'var(--red)';
        return;
    }
    try {
        const v = f(1);
        preview.textContent = `f(1) = ${isFinite(v) ? v.toExponential(4) : 'indefinido'}`;
        preview.style.color = 'var(--text-muted)';
    } catch (e) {
        preview.textContent = '⚠ error de evaluación';
        preview.style.color = 'var(--red)';
    }
}

// ================================================================
//  RENDER TEORÍA
// ================================================================
function renderTheoryGrid() {
    const grid = document.getElementById('theoryGrid');
    if (!grid) return;
    grid.innerHTML = '';
    // Asegurar que topics existe
    if (typeof topics === 'undefined' || !topics.length) {
        grid.innerHTML = '<p style="color:var(--red);">Error: No se cargaron los temas. Revisa data.js.</p>';
        return;
    }
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
    document.getElementById('toCalcFromDetail').href = `calculadora.html?calc=${topic.id}`;
    detail.classList.add('open');
    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

// ================================================================
//  RENDER CALCULADORA
// ================================================================
let currentCalcId = null;

function renderCalcSelector() {
    const selector = document.getElementById('calcSelector');
    if (!selector) return;
    selector.innerHTML = '';
    if (typeof topics === 'undefined' || !topics.length) {
        selector.innerHTML = '<p style="color:var(--red);">Error: No se cargaron los temas. Revisa data.js.</p>';
        return;
    }
    topics.forEach(topic => {
        const item = document.createElement('div');
        item.className = 'calc-selector-item';
        item.dataset.id = topic.id;
        item.innerHTML = `<div class="icon">${topic.icon}</div><div class="name">${topic.title}</div>`;
        item.addEventListener('click', () => selectCalculator(topic.id));
        selector.appendChild(item);
    });
}

function selectCalculator(id) {
    const topic = topics.find(t => t.id === id);
    if (!topic) return;
    currentCalcId = id;

    // Actualizar selector
    document.querySelectorAll('.calc-selector-item').forEach(el => {
        el.classList.toggle('active', el.dataset.id === id);
    });

    const container = document.getElementById('calcContainer');
    // Generar toolbar y campos
    let fieldsHtml = topic.calcFields.map(f => `
        <div class="field-group">
            <label for="${f.id}">${f.label}</label>
            ${f.type === 'textarea'
                ? `<textarea id="${f.id}" ${f.rows ? `rows="${f.rows}"` : ''}>${f.default || ''}</textarea>`
                : `<input type="${f.type}" id="${f.id}" value="${f.default || ''}" ${f.step ? `step="${f.step}"` : ''} ${f.min !== undefined ? `min="${f.min}"` : ''} ${f.max !== undefined ? `max="${f.max}"` : ''} />`
            }
        </div>
    `).join('');

    // Si hay campos de función (text), añadir toolbar
    let toolbarHtml = '';
    const funcFields = topic.calcFields.filter(f => f.type === 'text' && f.id.includes('func'));
    if (funcFields.length > 0) {
        toolbarHtml = funcFields.map(f => `
            <div class="toolbar-container" id="toolbar-${f.id}"></div>
            <div class="func-preview" id="${f.id}-preview"></div>
        `).join('');
    }

    container.innerHTML = `
        <h2>${topic.icon} ${topic.title}</h2>
        <div class="help-box">${topic.calcHelp}</div>
        <form id="calcForm">
            ${fieldsHtml}
            ${toolbarHtml}
            <div class="calc-actions">
                <button type="button" class="btn-primary" id="calcSubmit">Calcular</button>
                <button type="button" class="btn-secondary" id="calcClear">Limpiar</button>
            </div>
            <div class="result-box" id="calcResult"></div>
            <div id="chartContainer" style="margin-top:16px; display:grid; grid-template-columns:1fr 1fr; gap:12px;"></div>
        </form>
    `;

    // Construir toolbars después de renderizar
    funcFields.forEach(f => {
        const tbId = `toolbar-${f.id}`;
        buildToolbar(f.id, tbId);
        document.getElementById(f.id).addEventListener('input', () => updatePreview(f.id));
        updatePreview(f.id);
    });

    // Eventos de botones
    document.getElementById('calcSubmit').addEventListener('click', function() {
        const values = {};
        topic.calcFields.forEach(f => {
            const el = document.getElementById(f.id);
            values[f.id] = el ? el.value : '';
        });
        const resultBox = document.getElementById('calcResult');
        const chartContainer = document.getElementById('chartContainer');
        chartContainer.innerHTML = '';
        try {
            const result = topic.calculate(values);
            if (typeof result === 'object' && result.html) {
                resultBox.innerHTML = result.html;
                resultBox.classList.add('visible');
                if (result.charts && result.charts.length > 0) {
                    chartContainer.style.display = 'grid';
                    result.charts.forEach((chartDef, idx) => {
                        const canvasId = `chart-${Date.now()}-${idx}`;
                        const div = document.createElement('div');
                        div.className = 'chart-card';
                        div.style.height = '200px';
                        div.innerHTML = `<div class="chart-title">${chartDef.title || ''}</div><canvas id="${canvasId}"></canvas>`;
                        chartContainer.appendChild(div);
                        setTimeout(() => {
                            if (chartDef.type === 'line') {
                                makeLineChart(canvasId, chartDef.labels, chartDef.datasets, chartDef.options || {});
                            } else if (chartDef.type === 'scatter') {
                                makeScatterChart(canvasId, chartDef.datasets, chartDef.options || {});
                            }
                        }, 100);
                    });
                } else {
                    chartContainer.style.display = 'none';
                }
            } else {
                resultBox.innerHTML = result;
                resultBox.classList.add('visible');
                chartContainer.style.display = 'none';
            }
            if (window.MathJax && MathJax.typesetPromise) {
                MathJax.typesetPromise().catch(() => {});
            }
        } catch (e) {
            resultBox.innerHTML = `<span style="color: var(--red);">Error: ${e.message}</span>`;
            resultBox.classList.add('visible');
            chartContainer.style.display = 'none';
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
        document.getElementById('calcResult').classList.remove('visible');
        document.getElementById('calcResult').innerHTML = '';
        document.getElementById('chartContainer').innerHTML = '';
        document.getElementById('chartContainer').style.display = 'none';
        topic.calcFields.filter(f => f.type === 'text' && f.id.includes('func')).forEach(f => updatePreview(f.id));
    });
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Si estamos en teoria.html, renderTheoryGrid se llama desde su propio script
    // Si estamos en calculadora.html, renderCalcSelector se llama desde su propio script
    // Esta función se ejecutará en ambos casos, pero no daña.
    if (document.getElementById('calcSelector')) {
        renderCalcSelector();
        const params = new URLSearchParams(window.location.search);
        const calcId = params.get('calc');
        if (calcId) {
            setTimeout(() => selectCalculator(calcId), 100);
        }
    }
});
