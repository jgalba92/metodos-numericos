// main.js — Renderizado de teoría y calculadoras, gráficos y toolbar.
// La matemática vive en nm-core.js; las definiciones de temas en data.js.

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

function chartDefaults() {
    return {
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

function renderChart(canvasId, chartDef) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    destroyChart(canvasId);
    const ctx = canvas.getContext('2d');
    const options = deepMerge(chartDefaults(), chartDef.options || {});
    chartRegistry[canvasId] = new Chart(ctx, {
        type: chartDef.type === 'scatter' ? 'scatter' : 'line',
        data: chartDef.type === 'scatter'
            ? { datasets: chartDef.datasets }
            : { labels: chartDef.labels, datasets: chartDef.datasets },
        options
    });
}

// ================================================================
//  DETECCIÓN DE CDNs CAÍDOS
// ================================================================
function checkCdns(container) {
    if (!container) return;
    // MathJax carga async: esperar a window.load + margen antes de reportar.
    const doCheck = () => {
        const missing = [];
        const needsCharts = !!document.getElementById('calcSelector');
        if (needsCharts && typeof Chart === 'undefined') missing.push('Chart.js (gráficas)');
        if (typeof MathJax === 'undefined' || !MathJax.typesetPromise) missing.push('MathJax (fórmulas)');
        const prev = container.querySelector('.cdn-warning');
        if (prev) prev.remove();
        if (missing.length) {
            const div = document.createElement('div');
            div.className = 'cdn-warning';
            div.textContent = `⚠ Sin conexión a: ${missing.join(', ')}. Los cálculos funcionan igual; solo se pierde ese renderizado.`;
            container.prepend(div);
        }
    };
    if (document.readyState === 'complete') setTimeout(doCheck, 2500);
    else window.addEventListener('load', () => setTimeout(doCheck, 2500));
}

function typeset() {
    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise().catch(() => {});
    }
}

// ================================================================
//  TOOLBAR DE SÍMBOLOS Y PRESETS
// ================================================================
const SYMBOLS = ['+', '-', '*', '/', '(', ')', '^', '.'];
const FUNCTIONS = ['sin(', 'cos(', 'tan(', 'exp(', 'ln(', 'sqrt(', 'abs(', 'pi', 'e'];
const PRESETS = [
    { label: 'x³-x-2', val: 'x^3 - x - 2' },
    { label: 'x³-4x-9', val: 'x^3 - 4*x - 9' },
    { label: 'e⁻ˣ-x', val: 'exp(-x) - x' },
    { label: 'cos(x)-x', val: 'cos(x) - x' },
    { label: 'ln(x)+x²-4', val: 'ln(x) + x^2 - 4' },
    { label: 'x²-5', val: 'x^2 - 5' }
];

function buildToolbar(inputId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const symGroup = document.createElement('div');
    symGroup.className = 'sym-group';
    SYMBOLS.concat(FUNCTIONS).forEach(s => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sym-btn';
        btn.textContent = s.endsWith('(') ? s + '…)' : s;
        btn.onclick = () => insertAtCursor(inputId, s);
        symGroup.appendChild(btn);
    });
    container.appendChild(symGroup);
    const presetGroup = document.createElement('div');
    presetGroup.className = 'preset-group';
    PRESETS.forEach(p => {
        const btn = document.createElement('button');
        btn.type = 'button';
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
    const preview = document.getElementById(inputId + '-preview');
    if (!el || !preview) return;
    const fn = NM.makeFn(el.value);
    if (!fn) {
        preview.textContent = '⚠ expresión inválida';
        preview.style.color = 'var(--red)';
        return;
    }
    const v = fn(1);
    preview.textContent = `f(1) = ${isFinite(v) ? v.toPrecision(6) : 'indefinido en x=1'}`;
    preview.style.color = 'var(--text-muted)';
}

// ================================================================
//  TEORÍA (teoria.html)
// ================================================================
function renderTheoryGrid() {
    const grid = document.getElementById('theoryGrid');
    if (!grid) return;
    grid.innerHTML = '';
    if (typeof topics === 'undefined' || !topics.length) {
        grid.innerHTML = '<p style="color:var(--red);">Error: no se cargaron los temas (data.js).</p>';
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
        card.querySelector('.btn-theory-detail').addEventListener('click', () => openTheoryDetail(topic.id));
        grid.appendChild(card);
    });
    checkCdns(grid.parentElement);
}

function openTheoryDetail(id) {
    const topic = topics.find(t => t.id === id);
    if (!topic || !topic.theory) return;
    const detail = document.getElementById('theoryDetail');
    document.getElementById('theoryDetailContent').innerHTML = topic.theory;
    document.getElementById('toCalcFromDetail').href = `calculadora.html?calc=${topic.id}`;
    detail.classList.add('open');
    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    typeset();
}

// ================================================================
//  CALCULADORA (calculadora.html)
// ================================================================
let currentCalcId = null;

function renderCalcSelector() {
    const selector = document.getElementById('calcSelector');
    if (!selector) return;
    selector.innerHTML = '';
    if (typeof topics === 'undefined' || !topics.length) {
        selector.innerHTML = '<p style="color:var(--red);">Error: no se cargaron los temas (data.js).</p>';
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
    checkCdns(selector.parentElement);
}

function runCalculation(topic, detailed) {
    const values = {};
    topic.calcFields.forEach(f => {
        const el = document.getElementById(f.id);
        values[f.id] = el ? el.value : '';
    });
    const resultBox = document.getElementById('calcResult');
    const chartContainer = document.getElementById('chartContainer');
    chartContainer.innerHTML = '';
    chartContainer.style.display = 'none';
    try {
        const result = topic.calculate(values, detailed);
        resultBox.innerHTML = result.html;
        resultBox.classList.add('visible');
        if (result.charts && result.charts.length && typeof Chart !== 'undefined') {
            chartContainer.style.display = 'grid';
            result.charts.forEach((chartDef, idx) => {
                const canvasId = `chart-${topic.id}-${idx}`;
                const div = document.createElement('div');
                div.className = 'chart-card';
                div.style.height = '220px';
                div.innerHTML = `<div class="chart-title">${chartDef.title || ''}</div><canvas id="${canvasId}"></canvas>`;
                chartContainer.appendChild(div);
                requestAnimationFrame(() => renderChart(canvasId, chartDef));
            });
        }
        typeset();
    } catch (e) {
        resultBox.innerHTML = `<span style="color: var(--red);">Error: ${e.message}</span>`;
        resultBox.classList.add('visible');
    }
}

function closeHelp() {
    const helpBox = document.getElementById('calcHelp');
    const backdrop = document.getElementById('helpBackdrop');
    if (helpBox) helpBox.classList.remove('visible');
    if (backdrop) backdrop.classList.remove('visible');
}

function toggleHelp(topic) {
    const helpBox = document.getElementById('calcHelp');
    if (!helpBox) return;
    let backdrop = document.getElementById('helpBackdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'helpBackdrop';
        backdrop.className = 'help-backdrop';
        backdrop.addEventListener('click', closeHelp);
        document.body.appendChild(backdrop);
    }
    if (helpBox.classList.contains('visible')) {
        closeHelp();
        return;
    }
    helpBox.innerHTML = `<button type="button" class="help-close" onclick="closeHelp()">✕ Cerrar</button>` +
        (topic.theory || '<p>Sin teoría disponible para este método.</p>');
    helpBox.classList.add('visible');
    backdrop.classList.add('visible');
    helpBox.scrollTop = 0;
    typeset();
}

function selectCalculator(id) {
    const topic = topics.find(t => t.id === id);
    if (!topic) return;
    currentCalcId = id;

    document.querySelectorAll('.calc-selector-item').forEach(el => {
        el.classList.toggle('active', el.dataset.id === id);
    });

    const container = document.getElementById('calcContainer');
    const fieldsHtml = topic.calcFields.map(f => `
        <div class="field-group">
            <label for="${f.id}">${f.label}</label>
            ${f.type === 'textarea'
                ? `<textarea id="${f.id}" ${f.rows ? `rows="${f.rows}"` : ''}>${f.default || ''}</textarea>`
                : `<input type="${f.type}" id="${f.id}" value="${f.default !== undefined ? f.default : ''}" ${f.step ? `step="${f.step}"` : ''} ${f.min !== undefined ? `min="${f.min}"` : ''} ${f.max !== undefined ? `max="${f.max}"` : ''} />`
            }
        </div>
    `).join('');

    const funcFields = topic.calcFields.filter(f => f.type === 'text' && f.id.includes('func'));
    const toolbarHtml = funcFields.map(f => `
        <div class="toolbar-container" id="toolbar-${f.id}"></div>
        <div class="func-preview" id="${f.id}-preview"></div>
    `).join('');

    container.innerHTML = `
        <h2>${topic.icon} ${topic.title}</h2>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:0.8rem;">${topic.description}</p>
        <div class="help-box" id="calcHelp"></div>
        <form id="calcForm" onsubmit="return false;">
            ${fieldsHtml}
            ${toolbarHtml}
            <div class="calc-actions">
                <button type="button" class="btn-primary" id="calcSubmit">Calcular</button>
                <button type="button" class="btn-steps" id="calcSteps">📗 Paso a paso</button>
                <button type="button" class="btn-help" id="calcHelpBtn">📘 Ayuda</button>
                <button type="button" class="btn-secondary" id="calcClear">Limpiar</button>
            </div>
            <div class="result-box" id="calcResult"></div>
            <div id="chartContainer" style="margin-top:16px; display:none; grid-template-columns:1fr 1fr; gap:12px;"></div>
        </form>
    `;

    funcFields.forEach(f => {
        buildToolbar(f.id, `toolbar-${f.id}`);
        document.getElementById(f.id).addEventListener('input', () => updatePreview(f.id));
        updatePreview(f.id);
    });

    document.getElementById('calcSubmit').addEventListener('click', () => runCalculation(topic, false));
    document.getElementById('calcSteps').addEventListener('click', () => runCalculation(topic, true));
    document.getElementById('calcHelpBtn').addEventListener('click', () => toggleHelp(topic));
    document.getElementById('calcClear').addEventListener('click', () => {
        topic.calcFields.forEach(f => {
            const el = document.getElementById(f.id);
            if (el) el.value = f.default !== undefined ? f.default : '';
        });
        const resultBox = document.getElementById('calcResult');
        resultBox.classList.remove('visible');
        resultBox.innerHTML = '';
        const chartContainer = document.getElementById('chartContainer');
        chartContainer.innerHTML = '';
        chartContainer.style.display = 'none';
        funcFields.forEach(f => updatePreview(f.id));
    });
}

// ================================================================
//  INICIALIZACIÓN (única, sin duplicados)
// ================================================================
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('theoryGrid')) {
        renderTheoryGrid();
        const closeBtn = document.getElementById('closeTheoryDetail');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('theoryDetail').classList.remove('open');
            });
        }
    }
    if (document.getElementById('calcSelector')) {
        renderCalcSelector();
        const calcId = new URLSearchParams(window.location.search).get('calc');
        if (calcId) selectCalculator(calcId);
    }
});
