// data.js - Todos los temas con gráficos integrados

// ============================================================
//  FUNCIÓN AUXILIAR PARA GRÁFICOS
// ============================================================
function buildConvergenceChart(labels, data, label, color = '#3b82f6', logY = true) {
    return {
        type: 'line',
        title: label,
        labels: labels,
        datasets: [{
            label: label,
            data: data,
            borderColor: color,
            backgroundColor: color + '22',
            fill: true,
            tension: 0.1,
            pointRadius: 2
        }],
        options: {
            scales: {
                y: { type: logY ? 'logarithmic' : 'linear' }
            }
        }
    };
}

function buildScatterChart(data, label, color = '#3b82f6') {
    return {
        type: 'scatter',
        title: label,
        datasets: [{
            label: label,
            data: data,
            borderColor: color,
            backgroundColor: color,
            pointRadius: 3
        }]
    };
}

// ============================================================
//  FUNCIONES AUXILIARES PARA CÁLCULOS
// ============================================================
function parseMatrix(text) {
    return text.trim().split('\n').filter(l => l.trim()).map(l => l.trim().split(/\s+/).map(Number));
}
function parseVector(text) {
    return text.trim().split('\n').filter(l => l.trim()).map(Number);
}

// ============================================================
//  1. ERRORES
// ============================================================
const topics = [{
    id: 'errores',
    icon: '📊',
    title: 'Errores Numéricos',
    description: 'Absoluto, relativo, redondeo y truncamiento.',
    calcFields: [
        { id: 'err-exact', label: 'Valor exacto (x)', type: 'number', default: 87.245 },
        { id: 'err-aprox', label: 'Valor aprox. (x̃)', type: 'number', default: 87.19 },
        { id: 'err-dec', label: 'Decimales', type: 'number', default: 6, min: 1, max: 15 }
    ],
    calcHelp: 'Ingrese el valor exacto y el aproximado para calcular los errores.',
    calculate: function(values) {
        const xe = parseFloat(values['err-exact']);
        const xa = parseFloat(values['err-aprox']);
        const dec = parseInt(values['err-dec']);
        if (isNaN(xe) || isNaN(xa)) return { html: 'Ingrese valores válidos.' };
        if (xe === 0) return { html: 'El valor exacto no puede ser cero.' };
        const ea = Math.abs(xe - xa);
        const er = ea / Math.abs(xe);
        const ep = er * 100;
        const html = `
            <div class="metric-row">
                <div class="metric"><span class="label">Error absoluto</span><span class="value">${ea.toFixed(dec)}</span></div>
                <div class="metric"><span class="label">Error relativo</span><span class="value">${er.toFixed(dec)}</span></div>
                <div class="metric"><span class="label">Error relativo %</span><span class="value">${ep.toFixed(dec)}%</span></div>
            </div>
            <div class="step"><strong>Paso 1:</strong> $E_a = |${xe} - ${xa}| = ${ea.toFixed(dec)}$</div>
            <div class="step"><strong>Paso 2:</strong> $E_r = \\frac{${ea.toFixed(dec)}}{|${xe}|} = ${er.toFixed(dec)}$</div>
            <div class="step"><strong>Paso 3:</strong> $E_r\\% = 100 \\cdot ${er.toFixed(dec)} = ${ep.toFixed(dec)}\\%$</div>
        `;
        return { html, charts: [] };
    }
},

// ============================================================
//  2. BISECCIÓN
// ============================================================
{
    id: 'biseccion',
    icon: '✂️',
    title: 'Bisección',
    description: 'Método cerrado para hallar raíces.',
    calcFields: [
        { id: 'bis-func', label: 'f(x)', type: 'text', default: 'x^3 - 4*x - 9' },
        { id: 'bis-a', label: 'a', type: 'number', default: 2 },
        { id: 'bis-b', label: 'b', type: 'number', default: 3 },
        { id: 'bis-tol', label: 'Tolerancia', type: 'number', default: 1e-6 },
        { id: 'bis-maxiter', label: 'Max iter.', type: 'number', default: 50 }
    ],
    calcHelp: 'Ingrese f(x) y el intervalo [a,b] con cambio de signo.',
    calculate: function(values) {
        try {
            const f = new Function('x', `return (${values['bis-func']})`);
            let a = parseFloat(values['bis-a']), b = parseFloat(values['bis-b']);
            const tol = parseFloat(values['bis-tol']), maxIter = parseInt(values['bis-maxiter']);
            if (f(a) * f(b) >= 0) return { html: 'No hay cambio de signo en el intervalo.' };
            let rows = [];
            for (let i = 0; i < maxIter; i++) {
                let c = (a + b) / 2, fc = f(c);
                let error = (b - a) / 2;
                rows.push({ iter: i + 1, a, b, c, fc, error });
                if (Math.abs(fc) < tol || error < tol) break;
                if (f(a) * fc < 0) b = c;
                else a = c;
            }
            const last = rows[rows.length - 1];
            const html = `
                <div class="metric-row">
                    <div class="metric"><span class="label">Aprox.</span><span class="value">${last.c.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">f(c)</span><span class="value">${last.fc.toExponential(2)}</span></div>
                    <div class="metric"><span class="label">Error</span><span class="value">${last.error.toExponential(2)}</span></div>
                </div>
                <table>
                    <thead><tr><th>Iter</th><th>a</th><th>b</th><th>c</th><th>f(c)</th><th>Error</th></tr></thead>
                    <tbody>
                        ${rows.map(r => `<tr><td>${r.iter}</td><td>${r.a.toFixed(6)}</td><td>${r.b.toFixed(6)}</td><td>${r.c.toFixed(8)}</td><td>${r.fc.toExponential(2)}</td><td>${r.error.toExponential(2)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> En cada iteración se calcula el punto medio y se evalúa la función.</div>
            `;
            const labels = rows.map(r => r.iter);
            const errData = rows.map(r => r.error);
            const intervalData = rows.map(r => r.b - r.a);
            const charts = [
                buildConvergenceChart(labels, errData, 'Error (cota)', '#3b82f6', true),
                buildConvergenceChart(labels, intervalData, 'Ancho del intervalo', '#22c55e', false)
            ];
            return { html, charts };
        } catch (e) { return { html: `Error: ${e.message}` }; }
    }
},

// ============================================================
//  3. REGLA FALSA
// ============================================================
{
    id: 'reglafalsa',
    icon: '📏',
    title: 'Regla Falsa',
    description: 'Regula falsi, secante en lugar de punto medio.',
    calcFields: [
        { id: 'rf-func', label: 'f(x)', type: 'text', default: 'x^3 - 4*x - 9' },
        { id: 'rf-a', label: 'a', type: 'number', default: 2 },
        { id: 'rf-b', label: 'b', type: 'number', default: 3 },
        { id: 'rf-tol', label: 'Tolerancia', type: 'number', default: 1e-6 },
        { id: 'rf-maxiter', label: 'Max iter.', type: 'number', default: 50 }
    ],
    calcHelp: 'Ingrese f(x) y el intervalo [a,b] con cambio de signo.',
    calculate: function(values) {
        try {
            const f = new Function('x', `return (${values['rf-func']})`);
            let a = parseFloat(values['rf-a']), b = parseFloat(values['rf-b']);
            const tol = parseFloat(values['rf-tol']), maxIter = parseInt(values['rf-maxiter']);
            if (f(a) * f(b) >= 0) return { html: 'No hay cambio de signo.' };
            let rows = [];
            for (let i = 0; i < maxIter; i++) {
                let fa = f(a), fb = f(b);
                if (fa === fb) break;
                let c = b - fb * (b - a) / (fb - fa);
                let fc = f(c);
                rows.push({ iter: i + 1, a, b, c, fc });
                if (Math.abs(fc) < tol) break;
                if (f(a) * fc < 0) b = c;
                else a = c;
            }
            const last = rows[rows.length - 1];
            const html = `
                <div class="metric-row">
                    <div class="metric"><span class="label">Aprox.</span><span class="value">${last.c.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">f(c)</span><span class="value">${last.fc.toExponential(2)}</span></div>
                </div>
                <table>
                    <thead><tr><th>Iter</th><th>a</th><th>b</th><th>c</th><th>f(c)</th></tr></thead>
                    <tbody>
                        ${rows.map(r => `<tr><td>${r.iter}</td><td>${r.a.toFixed(6)}</td><td>${r.b.toFixed(6)}</td><td>${r.c.toFixed(8)}</td><td>${r.fc.toExponential(2)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Se calcula la intersección de la secante con el eje x.</div>
            `;
            const labels = rows.map(r => r.iter);
            const fcData = rows.map(r => Math.abs(r.fc));
            const charts = [buildConvergenceChart(labels, fcData, '|f(c)|', '#d29922', true)];
            return { html, charts };
        } catch (e) { return { html: `Error: ${e.message}` }; }
    }
},

// ============================================================
//  4. PUNTO FIJO
// ============================================================
{
    id: 'puntofijo',
    icon: '🎯',
    title: 'Punto Fijo',
    description: 'Iteración x = g(x).',
    calcFields: [
        { id: 'pf-func', label: 'g(x)', type: 'text', default: 'exp(-x)' },
        { id: 'pf-x0', label: 'x₀', type: 'number', default: 0.5 },
        { id: 'pf-tol', label: 'Tolerancia', type: 'number', default: 1e-6 },
        { id: 'pf-maxiter', label: 'Max iter.', type: 'number', default: 50 }
    ],
    calcHelp: 'Ingrese g(x) tal que x = g(x).',
    calculate: function(values) {
        try {
            const g = new Function('x', `return (${values['pf-func']})`);
            let x = parseFloat(values['pf-x0']);
            const tol = parseFloat(values['pf-tol']), maxIter = parseInt(values['pf-maxiter']);
            let rows = [];
            for (let i = 0; i < maxIter; i++) {
                let xn = g(x);
                let err = Math.abs(xn - x);
                rows.push({ iter: i + 1, x, xn, err });
                if (err < tol) break;
                x = xn;
            }
            const last = rows[rows.length - 1];
            const html = `
                <div class="metric-row">
                    <div class="metric"><span class="label">Aprox.</span><span class="value">${last.xn.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">Error</span><span class="value">${last.err.toExponential(2)}</span></div>
                </div>
                <table>
                    <thead><tr><th>Iter</th><th>xₙ</th><th>xₙ₊₁</th><th>Error</th></tr></thead>
                    <tbody>
                        ${rows.map(r => `<tr><td>${r.iter}</td><td>${r.x.toFixed(8)}</td><td>${r.xn.toFixed(8)}</td><td>${r.err.toExponential(2)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Se aplica la iteración xₙ₊₁ = g(xₙ).</div>
            `;
            const labels = rows.map(r => r.iter);
            const xData = rows.map(r => r.xn);
            const errData = rows.map(r => r.err);
            const charts = [
                buildConvergenceChart(labels, xData, 'xₙ', '#bc8cff', false),
                buildConvergenceChart(labels, errData, 'Error', '#ff7b72', true)
            ];
            return { html, charts };
        } catch (e) { return { html: `Error: ${e.message}` }; }
    }
},

// ============================================================
//  5. NEWTON-RAPHSON
// ============================================================
{
    id: 'newton',
    icon: '🚀',
    title: 'Newton-Raphson',
    description: 'Método abierto de convergencia cuadrática.',
    calcFields: [
        { id: 'nr-func', label: 'f(x)', type: 'text', default: 'x^3 - x - 2' },
        { id: 'nr-dfunc', label: "f'(x) (opcional)", type: 'text', default: '3*x^2 - 1' },
        { id: 'nr-x0', label: 'x₀', type: 'number', default: 1.5 },
        { id: 'nr-tol', label: 'Tolerancia', type: 'number', default: 1e-6 },
        { id: 'nr-maxiter', label: 'Max iter.', type: 'number', default: 50 }
    ],
    calcHelp: 'Ingrese f(x) y su derivada (opcional).',
    calculate: function(values) {
        try {
            const f = new Function('x', `return (${values['nr-func']})`);
            let fp = null;
            try { fp = new Function('x', `return (${values['nr-dfunc'] || '0'})`); } catch (e) {}
            let x = parseFloat(values['nr-x0']);
            const tol = parseFloat(values['nr-tol']), maxIter = parseInt(values['nr-maxiter']);
            let rows = [];
            for (let i = 0; i < maxIter; i++) {
                let fx = f(x);
                let fpx = fp ? fp(x) : (f(x + 1e-7) - f(x - 1e-7)) / (2e-7);
                if (Math.abs(fpx) < 1e-15) return { html: 'Derivada cercana a cero.' };
                let xn = x - fx / fpx;
                let err = Math.abs(xn - x);
                rows.push({ iter: i + 1, x, fx, fpx, xn, err });
                if (err < tol) break;
                x = xn;
            }
            const last = rows[rows.length - 1];
            const html = `
                <div class="metric-row">
                    <div class="metric"><span class="label">Aprox.</span><span class="value">${last.xn.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">f(x)</span><span class="value">${f(last.xn).toExponential(2)}</span></div>
                </div>
                <table>
                    <thead><tr><th>Iter</th><th>x</th><th>f(x)</th><th>f'(x)</th><th>xₙ₊₁</th><th>Error</th></tr></thead>
                    <tbody>
                        ${rows.map(r => `<tr><td>${r.iter}</td><td>${r.x.toFixed(8)}</td><td>${r.fx.toExponential(2)}</td><td>${r.fpx.toExponential(2)}</td><td>${r.xn.toFixed(8)}</td><td>${r.err.toExponential(2)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Se evalúa f y f', se calcula la corrección.</div>
            `;
            const labels = rows.map(r => r.iter);
            const xData = rows.map(r => r.xn);
            const resData = rows.map(r => Math.abs(r.fx));
            const charts = [
                buildConvergenceChart(labels, xData, 'xₙ', '#ff7b72', false),
                buildConvergenceChart(labels, resData, '|f(xₙ)|', '#d29922', true)
            ];
            return { html, charts };
        } catch (e) { return { html: `Error: ${e.message}` }; }
    }
},

// ============================================================
//  6. JACOBI
// ============================================================
{
    id: 'jacobi',
    icon: '🔢',
    title: 'Jacobi',
    description: 'Método iterativo para sistemas lineales.',
    calcFields: [
        { id: 'jac-A', label: 'Matriz A (filas \n)', type: 'textarea', default: '10 -1 2\n1 8 -1\n2 -1 9' },
        { id: 'jac-b', label: 'Vector b (\n)', type: 'textarea', default: '7\n8\n6' },
        { id: 'jac-x0', label: 'x₀ (comas)', type: 'text', default: '0,0,0' },
        { id: 'jac-tol', label: 'Tolerancia', type: 'number', default: 1e-6 },
        { id: 'jac-max', label: 'Max iter.', type: 'number', default: 50 }
    ],
    calcHelp: 'Ingrese la matriz A y el vector b.',
    calculate: function(values) {
        try {
            const A = parseMatrix(values['jac-A']);
            const b = parseVector(values['jac-b']);
            const x0 = values['jac-x0'].split(',').map(Number);
            const tol = parseFloat(values['jac-tol']), maxIter = parseInt(values['jac-max']);
            if (A.length !== b.length || x0.length !== b.length) return { html: 'Dimensiones incompatibles.' };
            const n = b.length;
            let x = x0.slice(), rows = [];
            for (let k = 0; k < maxIter; k++) {
                let xn = new Array(n).fill(0);
                for (let i = 0; i < n; i++) {
                    let sum = 0;
                    for (let j = 0; j < n; j++) if (j !== i) sum += A[i][j] * x[j];
                    xn[i] = (b[i] - sum) / A[i][i];
                }
                let err = Math.max(...xn.map((v, i) => Math.abs(v - x[i])));
                rows.push({ iter: k + 1, x: xn.slice(), err });
                x = xn.slice();
                if (err < tol) break;
            }
            const last = rows[rows.length - 1];
            const html = `
                <div class="metric-row">
                    <div class="metric"><span class="label">Iter.</span><span class="value">${rows.length}</span></div>
                    ${last.x.map((v,i) => `<div class="metric"><span class="label">x${i}</span><span class="value">${v.toFixed(6)}</span></div>`).join('')}
                    <div class="metric"><span class="label">Error</span><span class="value">${last.err.toExponential(2)}</span></div>
                </div>
                <table>
                    <thead><tr><th>Iter</th>${Array.from({length:n},(_,i)=>`<th>x${i}</th>`).join('')}<th>Error</th></tr></thead>
                    <tbody>
                        ${rows.map(r => `<tr><td>${r.iter}</td>${r.x.map(v=>`<td>${v.toFixed(8)}</td>`).join('')}<td>${r.err.toExponential(2)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Cada variable se actualiza usando los valores anteriores.</div>
            `;
            const labels = rows.map(r => r.iter);
            const datasets = Array.from({length:n}, (_,i) => ({
                label: `x${i}`,
                data: rows.map(r => r.x[i]),
                borderColor: ['#3b82f6', '#22c55e', '#d29922', '#bc8cff', '#ff7b72'][i % 5],
                fill: false,
                pointRadius: 2
            }));
            const errData = rows.map(r => r.err);
            const charts = [
                { type: 'line', title: 'Evolución de variables', labels, datasets, options: { scales: { y: { type: 'linear' } } } },
                buildConvergenceChart(labels, errData, 'Error', '#ef4444', true)
            ];
            return { html, charts };
        } catch (e) { return { html: `Error: ${e.message}` }; }
    }
},

// ============================================================
//  7. GAUSS-SEIDEL
// ============================================================
{
    id: 'gaussseidel',
    icon: '🔁',
    title: 'Gauss-Seidel',
    description: 'Variante de Jacobi con actualización inmediata.',
    calcFields: [
        { id: 'gs-A', label: 'Matriz A (filas \n)', type: 'textarea', default: '10 -1 2\n1 8 -1\n2 -1 9' },
        { id: 'gs-b', label: 'Vector b (\n)', type: 'textarea', default: '7\n8\n6' },
        { id: 'gs-x0', label: 'x₀ (comas)', type: 'text', default: '0,0,0' },
        { id: 'gs-tol', label: 'Tolerancia', type: 'number', default: 1e-6 },
        { id: 'gs-max', label: 'Max iter.', type: 'number', default: 50 }
    ],
    calcHelp: 'Ingrese la matriz A y el vector b.',
    calculate: function(values) {
        try {
            const A = parseMatrix(values['gs-A']);
            const b = parseVector(values['gs-b']);
            const x0 = values['gs-x0'].split(',').map(Number);
            const tol = parseFloat(values['gs-tol']), maxIter = parseInt(values['gs-max']);
            if (A.length !== b.length || x0.length !== b.length) return { html: 'Dimensiones incompatibles.' };
            const n = b.length;
            let x = x0.slice(), rows = [];
            for (let k = 0; k < maxIter; k++) {
                let xn = x.slice();
                for (let i = 0; i < n; i++) {
                    let sum = 0;
                    for (let j = 0; j < i; j++) sum += A[i][j] * xn[j];
                    for (let j = i + 1; j < n; j++) sum += A[i][j] * x[j];
                    xn[i] = (b[i] - sum) / A[i][i];
                }
                let err = Math.max(...xn.map((v, i) => Math.abs(v - x[i])));
                rows.push({ iter: k + 1, x: xn.slice(), err });
                x = xn.slice();
                if (err < tol) break;
            }
            const last = rows[rows.length - 1];
            const html = `
                <div class="metric-row">
                    <div class="metric"><span class="label">Iter.</span><span class="value">${rows.length}</span></div>
                    ${last.x.map((v,i) => `<div class="metric"><span class="label">x${i}</span><span class="value">${v.toFixed(6)}</span></div>`).join('')}
                    <div class="metric"><span class="label">Error</span><span class="value">${last.err.toExponential(2)}</span></div>
                </div>
                <table>
                    <thead><tr><th>Iter</th>${Array.from({length:n},(_,i)=>`<th>x${i}</th>`).join('')}<th>Error</th></tr></thead>
                    <tbody>
                        ${rows.map(r => `<tr><td>${r.iter}</td>${r.x.map(v=>`<td>${v.toFixed(8)}</td>`).join('')}<td>${r.err.toExponential(2)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Cada variable se actualiza inmediatamente usando los valores más recientes.</div>
            `;
            const labels = rows.map(r => r.iter);
            const datasets = Array.from({length:n}, (_,i) => ({
                label: `x${i}`,
                data: rows.map(r => r.x[i]),
                borderColor: ['#3b82f6', '#22c55e', '#d29922', '#bc8cff', '#ff7b72'][i % 5],
                fill: false,
                pointRadius: 2
            }));
            const errData = rows.map(r => r.err);
            const charts = [
                { type: 'line', title: 'Evolución de variables', labels, datasets, options: { scales: { y: { type: 'linear' } } } },
                buildConvergenceChart(labels, errData, 'Error', '#ef4444', true)
            ];
            return { html, charts };
        } catch (e) { return { html: `Error: ${e.message}` }; }
    }
},

// ============================================================
//  8. SOR
// ============================================================
{
    id: 'sor',
    icon: '⚡',
    title: 'SOR (Relajación)',
    description: 'Relajación sucesiva con parámetro ω.',
    calcFields: [
        { id: 'sor-A', label: 'Matriz A (filas \n)', type: 'textarea', default: '4 -1\n-1 5' },
        { id: 'sor-b', label: 'Vector b (\n)', type: 'textarea', default: '7\n8' },
        { id: 'sor-x0', label: 'x₀ (comas)', type: 'text', default: '0,0' },
        { id: 'sor-omega', label: 'ω', type: 'number', default: 1.1, step: 0.05, min: 0.1, max: 1.95 },
        { id: 'sor-tol', label: 'Tolerancia', type: 'number', default: 1e-6 },
        { id: 'sor-max', label: 'Max iter.', type: 'number', default: 50 }
    ],
    calcHelp: 'Ingrese la matriz A y el vector b. Ajuste ω para acelerar convergencia.',
    calculate: function(values) {
        try {
            const A = parseMatrix(values['sor-A']);
            const b = parseVector(values['sor-b']);
            const x0 = values['sor-x0'].split(',').map(Number);
            const omega = parseFloat(values['sor-omega']);
            const tol = parseFloat(values['sor-tol']), maxIter = parseInt(values['sor-max']);
            if (A.length !== b.length || x0.length !== b.length) return { html: 'Dimensiones incompatibles.' };
            const n = b.length;
            let x = x0.slice(), rows = [];
            for (let k = 0; k < maxIter; k++) {
                let xn = x.slice();
                for (let i = 0; i < n; i++) {
                    let sum = 0;
                    for (let j = 0; j < i; j++) sum += A[i][j] * xn[j];
                    for (let j = i + 1; j < n; j++) sum += A[i][j] * x[j];
                    let x_gs = (b[i] - sum) / A[i][i];
                    xn[i] = (1 - omega) * x[i] + omega * x_gs;
                }
                let err = Math.max(...xn.map((v, i) => Math.abs(v - x[i])));
                rows.push({ iter: k + 1, x: xn.slice(), err });
                x = xn.slice();
                if (err < tol) break;
            }
            const last = rows[rows.length - 1];
            const html = `
                <div class="metric-row">
                    <div class="metric"><span class="label">Iter.</span><span class="value">${rows.length}</span></div>
                    <div class="metric"><span class="label">ω</span><span class="value">${omega.toFixed(2)}</span></div>
                    ${last.x.map((v,i) => `<div class="metric"><span class="label">x${i}</span><span class="value">${v.toFixed(6)}</span></div>`).join('')}
                    <div class="metric"><span class="label">Error</span><span class="value">${last.err.toExponential(2)}</span></div>
                </div>
                <table>
                    <thead><tr><th>Iter</th>${Array.from({length:n},(_,i)=>`<th>x${i}</th>`).join('')}<th>Error</th></tr></thead>
                    <tbody>
                        ${rows.map(r => `<tr><td>${r.iter}</td>${r.x.map(v=>`<td>${v.toFixed(8)}</td>`).join('')}<td>${r.err.toExponential(2)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Se calcula el valor de Gauss-Seidel y luego se combina con el valor anterior usando ω.</div>
            `;
            const labels = rows.map(r => r.iter);
            const datasets = Array.from({length:n}, (_,i) => ({
                label: `x${i}`,
                data: rows.map(r => r.x[i]),
                borderColor: ['#3b82f6', '#22c55e', '#d29922', '#bc8cff', '#ff7b72'][i % 5],
                fill: false,
                pointRadius: 2
            }));
            const errData = rows.map(r => r.err);
            const charts = [
                { type: 'line', title: 'Evolución de variables', labels, datasets, options: { scales: { y: { type: 'linear' } } } },
                buildConvergenceChart(labels, errData, 'Error', '#ef4444', true)
            ];
            return { html, charts };
        } catch (e) { return { html: `Error: ${e.message}` }; }
    }
},

// ============================================================
//  9. NEWTON SISTEMAS 2x2
// ============================================================
{
    id: 'newtonsistemas',
    icon: '🧮',
    title: 'Newton (sistemas 2x2)',
    description: 'Newton para sistemas no lineales.',
    calcFields: [
        { id: 'ns-f1', label: 'f1(x,y)', type: 'text', default: 'x*x + y*y - 4' },
        { id: 'ns-f2', label: 'f2(x,y)', type: 'text', default: 'x - y - 1' },
        { id: 'ns-x0', label: 'x₀', type: 'number', default: 1.5 },
        { id: 'ns-y0', label: 'y₀', type: 'number', default: 0.5 },
        { id: 'ns-tol', label: 'Tolerancia', type: 'number', default: 1e-6 },
        { id: 'ns-max', label: 'Max iter.', type: 'number', default: 20 }
    ],
    calcHelp: 'Ingrese f1(x,y) y f2(x,y). Se usará Newton con Jacobiano numérico.',
    calculate: function(values) {
        try {
            const f1 = new Function('x', 'y', `return (${values['ns-f1']})`);
            const f2 = new Function('x', 'y', `return (${values['ns-f2']})`);
            let x = parseFloat(values['ns-x0']), y = parseFloat(values['ns-y0']);
            const tol = parseFloat(values['ns-tol']), maxIter = parseInt(values['ns-max']);
            let rows = [];
            for (let k = 0; k < maxIter; k++) {
                let fx = f1(x, y), fy = f2(x, y);
                let h = 1e-7;
                let J11 = (f1(x + h, y) - f1(x - h, y)) / (2 * h);
                let J12 = (f1(x, y + h) - f1(x, y - h)) / (2 * h);
                let J21 = (f2(x + h, y) - f2(x - h, y)) / (2 * h);
                let J22 = (f2(x, y + h) - f2(x, y - h)) / (2 * h);
                let det = J11 * J22 - J12 * J21;
                if (Math.abs(det) < 1e-15) return { html: 'Jacobiano singular.' };
                let dx = (-fx * J22 + fy * J12) / det;
                let dy = (-J11 * fy + J21 * fx) / det;
                let xn = x + dx, yn = y + dy;
                let err = Math.max(Math.abs(dx), Math.abs(dy));
                rows.push({ iter: k + 1, x, y, fx, fy, dx, dy, xn, yn, err });
                if (err < tol) break;
                x = xn; y = yn;
            }
            const last = rows[rows.length - 1];
            const html = `
                <div class="metric-row">
                    <div class="metric"><span class="label">x</span><span class="value">${last.xn.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">y</span><span class="value">${last.yn.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">f1</span><span class="value">${f1(last.xn,last.yn).toExponential(2)}</span></div>
                    <div class="metric"><span class="label">f2</span><span class="value">${f2(last.xn,last.yn).toExponential(2)}</span></div>
                </div>
                <table>
                    <thead><tr><th>Iter</th><th>x</th><th>y</th><th>f1</th><th>f2</th><th>Δx</th><th>Δy</th></tr></thead>
                    <tbody>
                        ${rows.map(r => `<tr><td>${r.iter}</td><td>${r.x.toFixed(8)}</td><td>${r.y.toFixed(8)}</td><td>${r.fx.toExponential(2)}</td><td>${r.fy.toExponential(2)}</td><td>${r.dx.toExponential(2)}</td><td>${r.dy.toExponential(2)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Se calcula la Jacobiana y se resuelve el sistema lineal para obtener la corrección.</div>
            `;
            const labels = rows.map(r => r.iter);
            const xData = rows.map(r => r.xn);
            const yData = rows.map(r => r.yn);
            const errData = rows.map(r => r.err);
            const charts = [
                { type: 'line', title: 'x e y vs iteración', labels, datasets: [
                    { label: 'x', data: xData, borderColor: '#3b82f6', fill: false, pointRadius: 2 },
                    { label: 'y', data: yData, borderColor: '#22c55e', fill: false, pointRadius: 2 }
                ], options: { scales: { y: { type: 'linear' } } } },
                buildConvergenceChart(labels, errData, 'Error', '#ef4444', true)
            ];
            return { html, charts };
        } catch (e) { return { html: `Error: ${e.message}` }; }
    }
},

// ============================================================
//  10. INTERPOLACIÓN
// ============================================================
{
    id: 'interpolacion',
    icon: '📐',
    title: 'Interpolación (Newton / Lagrange)',
    description: 'Newton y Lagrange.',
    calcFields: [
        { id: 'int-pts', label: 'Puntos (x,y) uno por línea', type: 'textarea', default: '1,2\n2,3\n4,7' },
        { id: 'int-xv', label: 'Evaluar en x =', type: 'number', default: 3 }
    ],
    calcHelp: 'Ingrese los puntos (x,y) y el valor x a evaluar.',
    calculate: function(values) {
        try {
            const lines = values['int-pts'].trim().split('\n').filter(l => l.trim());
            const pts = lines.map(l => l.split(',').map(Number));
            const xv = parseFloat(values['int-xv']);
            if (pts.some(p => p.length !== 2 || isNaN(p[0]) || isNaN(p[1]))) return { html: 'Formato inválido.' };
            const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
            const n = xs.length;
            // Lagrange
            let P = 0;
            for (let i = 0; i < n; i++) {
                let L = 1;
                for (let j = 0; j < n; j++) if (j !== i) L *= (xv - xs[j]) / (xs[i] - xs[j]);
                P += ys[i] * L;
            }
            // Newton
            let coefs = [], tabla = [ys.slice()];
            for (let k = 1; k < n; k++) {
                let col = [];
                for (let i = 0; i < n - k; i++) {
                    col.push((tabla[k - 1][i + 1] - tabla[k - 1][i]) / (xs[i + k] - xs[i]));
                }
                tabla.push(col);
            }
            for (let k = 0; k < n; k++) coefs.push(tabla[k][0]);
            let N = coefs[0];
            let term = 1;
            for (let i = 1; i < n; i++) {
                term *= (xv - xs[i - 1]);
                N += coefs[i] * term;
            }
            const html = `
                <div class="metric-row">
                    <div class="metric"><span class="label">Newton P(${xv})</span><span class="value">${N.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">Lagrange P(${xv})</span><span class="value">${P.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">Diferencia</span><span class="value">${Math.abs(N-P).toExponential(2)}</span></div>
                </div>
                <table>
                    <thead><tr><th>i</th><th>x</th><th>y</th>${Array.from({length:n-1},(_,i)=>`<th>Ord.${i+1}</th>`).join('')}</tr></thead>
                    <tbody>
                        ${xs.map((xi,i) => `<tr><td>${i}</td><td>${xi}</td><td>${ys[i]}</td>${Array.from({length:n-1},(_,k)=>`<td>${k < tabla.length && i < tabla[k].length ? tabla[k][i].toFixed(6) : ''}</td>`).join('')}</tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Se construyen los polinomios base o las diferencias divididas.</div>
            `;
            // Gráfica del polinomio
            const xMin = Math.min(...xs) - 0.5, xMax = Math.max(...xs) + 0.5;
            const steps = 100;
            const xPlot = Array.from({length:steps}, (_,i) => xMin + (xMax - xMin) * i / (steps - 1));
            const yPlot = xPlot.map(x => {
                let res = coefs[0], term = 1;
                for (let i = 1; i < coefs.length; i++) {
                    term *= (x - xs[i-1]);
                    res += coefs[i] * term;
                }
                return res;
            });
            const charts = [{
                type: 'line',
                title: 'Polinomio interpolante',
                labels: xPlot.map(x => x.toFixed(2)),
                datasets: [
                    { label: 'P(x)', data: yPlot, borderColor: '#3b82f6', fill: false, pointRadius: 0, tension: 0.1 },
                    { label: 'Datos', data: xs.map((x,i) => ({ x: x, y: ys[i] })), borderColor: '#ef4444', pointRadius: 4, showLine: false, type: 'scatter' }
                ],
                options: { scales: { y: { type: 'linear' } } }
            }];
            return { html, charts };
        } catch (e) { return { html: `Error: ${e.message}` }; }
    }
},

// ============================================================
//  11. INTEGRACIÓN
// ============================================================
{
    id: 'integracion',
    icon: '∫',
    title: 'Integración Numérica',
    description: 'Trapecio, Simpson, Gauss.',
    calcFields: [
        { id: 'int-fx', label: 'f(x)', type: 'text', default: 'x*x + 1' },
        { id: 'int-a', label: 'a', type: 'number', default: 0 },
        { id: 'int-b', label: 'b', type: 'number', default: 2 },
        { id: 'int-n', label: 'n (subintervalos)', type: 'number', default: 4 }
    ],
    calcHelp: 'Ingrese f(x), límites y número de subintervalos.',
    calculate: function(values) {
        try {
            const f = new Function('x', `return (${values['int-fx']})`);
            const a = parseFloat(values['int-a']), b = parseFloat(values['int-b']);
            let n = parseInt(values['int-n']);
            let h = (b - a) / n;
            let xs = Array.from({ length: n + 1 }, (_, i) => a + i * h);
            let fs = xs.map(x => f(x));
            let T = h / 2 * (fs[0] + 2 * fs.slice(1, -1).reduce((a, b) => a + b, 0) + fs[fs.length - 1]);
            let n2 = n % 2 === 0 ? n : n + 1;
            let h2 = (b - a) / n2;
            let xs2 = Array.from({ length: n2 + 1 }, (_, i) => a + i * h2);
            let fs2 = xs2.map(x => f(x));
            let S = fs2[0] + fs2[fs2.length - 1];
            for (let i = 1; i < n2; i++) S += (i % 2 === 0 ? 2 : 4) * fs2[i];
            S *= h2 / 3;
            let t1 = -1 / Math.sqrt(3), t2 = 1 / Math.sqrt(3);
            let x1 = (b - a) / 2 * t1 + (a + b) / 2;
            let x2 = (b - a) / 2 * t2 + (a + b) / 2;
            let G = (b - a) / 2 * (f(x1) + f(x2));
            const html = `
                <div class="metric-row">
                    <div class="metric"><span class="label">Trapecio (n=${n})</span><span class="value">${T.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">Simpson (n=${n2})</span><span class="value">${S.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">Gauss-Legendre</span><span class="value">${G.toFixed(8)}</span></div>
                </div>
                <div class="step"><strong>Paso a paso:</strong> Se discretiza el intervalo y se aplican las fórmulas de cuadratura.</div>
            `;
            return { html, charts: [] };
        } catch (e) { return { html: `Error: ${e.message}` }; }
    }
},

// ============================================================
//  12. DIFERENCIACIÓN
// ============================================================
{
    id: 'diferenciacion',
    icon: '∂',
    title: 'Diferenciación',
    description: 'Progresiva, regresiva, centrada.',
    calcFields: [
        { id: 'diff-fx', label: 'f(x)', type: 'text', default: 'x*x' },
        { id: 'diff-x0', label: 'x₀', type: 'number', default: 1 },
        { id: 'diff-h', label: 'h', type: 'number', default: 0.1 },
        { id: 'diff-exact', label: 'Exacta (opcional)', type: 'text', default: '2' }
    ],
    calcHelp: 'Ingrese f(x), x₀ y h. Se calculan las tres fórmulas.',
    calculate: function(values) {
        try {
            const f = new Function('x', `return (${values['diff-fx']})`);
            const x0 = parseFloat(values['diff-x0']);
            const h = parseFloat(values['diff-h']);
            let exact = null;
            try { exact = new Function(`return (${values['diff-exact']})`)(); } catch (e) {}
            const prog = (f(x0 + h) - f(x0)) / h;
            const reg = (f(x0) - f(x0 - h)) / h;
            const cen = (f(x0 + h) - f(x0 - h)) / (2 * h);
            let html = `
                <div class="metric-row">
                    <div class="metric"><span class="label">Progresiva</span><span class="value">${prog.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">Regresiva</span><span class="value">${reg.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">Centrada</span><span class="value">${cen.toFixed(8)}</span></div>
                </div>
                <div class="step"><strong>Paso 1:</strong> $f(${x0+h}) = ${f(x0+h).toFixed(8)}$</div>
                <div class="step"><strong>Paso 2:</strong> $f(${x0}) = ${f(x0).toFixed(8)}$</div>
                <div class="step"><strong>Paso 3:</strong> $f(${x0-h}) = ${f(x0-h).toFixed(8)}$</div>
                <div class="step"><strong>Paso 4:</strong> Aplicar cada fórmula.</div>
            `;
            if (exact !== null) {
                html += `
                    <div class="metric-row">
                        <div class="metric"><span class="label">Err Prog</span><span class="value">${Math.abs(prog-exact).toExponential(2)}</span></div>
                        <div class="metric"><span class="label">Err Reg</span><span class="value">${Math.abs(reg-exact).toExponential(2)}</span></div>
                        <div class="metric"><span class="label">Err Cent</span><span class="value">${Math.abs(cen-exact).toExponential(2)}</span></div>
                    </div>
                `;
            }
            return { html, charts: [] };
        } catch (e) { return { html: `Error: ${e.message}` }; }
    }
},

// ============================================================
//  13. SEGUNDA DERIVADA
// ============================================================
{
    id: 'segundaderivada',
    icon: '∂²',
    title: 'Segunda Derivada',
    description: 'Fórmula centrada para f″.',
    calcFields: [
        { id: 'd2-fx', label: 'f(x)', type: 'text', default: 'x*x*x' },
        { id: 'd2-x0', label: 'x₀', type: 'number', default: 1 },
        { id: 'd2-h', label: 'h', type: 'number', default: 0.1 },
        { id: 'd2-exact', label: 'Exacta', type: 'number', default: 6 }
    ],
    calcHelp: 'Ingrese f(x), x₀ y h.',
    calculate: function(values) {
        try {
            const f = new Function('x', `return (${values['d2-fx']})`);
            const x0 = parseFloat(values['d2-x0']), h = parseFloat(values['d2-h']);
            const exact = parseFloat(values['d2-exact']);
            const d2 = (f(x0 + h) - 2 * f(x0) + f(x0 - h)) / (h * h);
            const html = `
                <div class="metric-row">
                    <div class="metric"><span class="label">f''(x₀)</span><span class="value">${d2.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">Exacta</span><span class="value">${exact.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">Error</span><span class="value">${Math.abs(d2-exact).toExponential(2)}</span></div>
                </div>
                <div class="step"><strong>Paso 1:</strong> Evaluar $f(x_0+h)$, $f(x_0)$, $f(x_0-h)$.</div>
                <div class="step"><strong>Paso 2:</strong> Calcular el numerador: $f(x_0+h) - 2f(x_0) + f(x_0-h)$.</div>
                <div class="step"><strong>Paso 3:</strong> Dividir por $h^2$.</div>
            `;
            return { html, charts: [] };
        } catch (e) { return { html: `Error: ${e.message}` }; }
    }
},

// ============================================================
//  14. RICHARDSON
// ============================================================
{
    id: 'richardson',
    icon: 'R',
    title: 'Extrapolación Richardson',
    description: 'Extrapolación para mejorar precisión.',
    calcFields: [
        { id: 'rich-Dh', label: 'D(h)', type: 'number', default: 0.995 },
        { id: 'rich-Dh2', label: 'D(h/2)', type: 'number', default: 0.99875 },
        { id: 'rich-p', label: 'p (orden)', type: 'number', default: 2, min: 1, max: 6 },
        { id: 'rich-exact', label: 'Exacta (opcional)', type: 'number', default: 1 }
    ],
    calcHelp: 'Ingrese D(h), D(h/2) y el orden p.',
    calculate: function(values) {
        try {
            const Dh = parseFloat(values['rich-Dh']);
            const Dh2 = parseFloat(values['rich-Dh2']);
            const p = parseInt(values['rich-p']);
            const exact = parseFloat(values['rich-exact']);
            const DR = (Math.pow(2, p) * Dh2 - Dh) / (Math.pow(2, p) - 1);
            let html = `
                <div class="metric-row">
                    <div class="metric"><span class="label">D(h)</span><span class="value">${Dh.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">D(h/2)</span><span class="value">${Dh2.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">D_R</span><span class="value">${DR.toFixed(10)}</span></div>
                </div>
                <div class="step"><strong>Paso 1:</strong> Identificar el orden $p = ${p}$.</div>
                <div class="step"><strong>Paso 2:</strong> Aplicar la fórmula: $D_R = \\frac{2^{${p}} \\cdot ${Dh2.toFixed(8)} - ${Dh.toFixed(8)}}{2^{${p}} - 1}$</div>
                <div class="step"><strong>Paso 3:</strong> Resultado: $D_R = ${DR.toFixed(10)}$.</div>
            `;
            if (!isNaN(exact)) {
                html += `
                    <div class="metric-row">
                        <div class="metric"><span class="label">Err D(h)</span><span class="value">${Math.abs(Dh-exact).toExponential(2)}</span></div>
                        <div class="metric"><span class="label">Err D_R</span><span class="value">${Math.abs(DR-exact).toExponential(2)}</span></div>
                    </div>
                    <p>La extrapolación reduce significativamente el error.</p>
                `;
            }
            return { html, charts: [] };
        } catch (e) { return { html: `Error: ${e.message}` }; }
    }
},

// ============================================================
//  15. EULER
// ============================================================
{
    id: 'euler',
    icon: 'E',
    title: 'Euler (EDO)',
    description: 'Método de Euler para EDOs.',
    calcFields: [
        { id: 'eul-f', label: 'f(x,y)', type: 'text', default: 'x + y' },
        { id: 'eul-x0', label: 'x₀', type: 'number', default: 0 },
        { id: 'eul-y0', label: 'y₀', type: 'number', default: 1 },
        { id: 'eul-h', label: 'h', type: 'number', default: 0.1 },
        { id: 'eul-n', label: 'n pasos', type: 'number', default: 5 },
        { id: 'eul-exact', label: 'Exacta y(x) (opcional)', type: 'text', default: '2*Math.exp(x)-x-1' }
    ],
    calcHelp: 'Ingrese f(x,y), condición inicial y pasos.',
    calculate: function(values) {
        try {
            const f = new Function('x', 'y', `return (${values['eul-f']})`);
            const x0 = parseFloat(values['eul-x0']), y0 = parseFloat(values['eul-y0']);
            const h = parseFloat(values['eul-h']), n = parseInt(values['eul-n']);
            let exactFn = null;
            try { exactFn = new Function('x', `return (${values['eul-exact']})`); } catch (e) {}
            let xs = [x0], ys = [y0];
            let x = x0, y = y0;
            for (let i = 0; i < n; i++) {
                y = y + h * f(x, y);
                x += h;
                xs.push(x);
                ys.push(y);
            }
            const html = `
                <div class="metric-row">
                    <div class="metric"><span class="label">y(${xs[xs.length-1].toFixed(4)})</span><span class="value">${ys[ys.length-1].toFixed(8)}</span></div>
                </div>
                <table>
                    <thead><tr><th>n</th><th>x</th><th>y</th>${exactFn ? '<th>Exacta</th><th>Error</th>' : ''}</tr></thead>
                    <tbody>
                        ${xs.map((xi,i) => `<tr><td>${i}</td><td>${xi.toFixed(4)}</td><td>${ys[i].toFixed(8)}</td>${exactFn ? `<td>${exactFn(xi).toFixed(8)}</td><td>${Math.abs(ys[i]-exactFn(xi)).toExponential(2)}</td>` : ''}</tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> En cada paso se calcula la pendiente y se avanza.</div>
            `;
            const charts = [];
            if (exactFn) {
                const xPlot = Array.from({length:100}, (_,i) => x0 + (xs[xs.length-1] - x0) * i / 99);
                const yExact = xPlot.map(x => exactFn(x));
                charts.push({
                    type: 'line',
                    title: 'Solución aproximada vs exacta',
                    labels: xPlot.map(x => x.toFixed(2)),
                    datasets: [
                        { label: 'Euler', data: xs.map((xi,i) => ({ x: xi, y: ys[i] })), borderColor: '#3b82f6', pointRadius: 2, showLine: true },
                        { label: 'Exacta', data: yExact, borderColor: '#22c55e', pointRadius: 0, showLine: true, borderDash: [5,5] }
                    ],
                    options: { scales: { y: { type: 'linear' } } }
                });
            }
            return { html, charts };
        } catch (e) { return { html: `Error: ${e.message}` }; }
    }
},

// ============================================================
//  16. RK2
// ============================================================
{
    id: 'rk2',
    icon: 'K₂',
    title: 'Runge-Kutta 2 (Heun)',
    description: 'Método de segundo orden.',
    calcFields: [
        { id: 'rk2-f', label: 'f(x,y)', type: 'text', default: 'x + y' },
        { id: 'rk2-x0', label: 'x₀', type: 'number', default: 0 },
        { id: 'rk2-y0', label: 'y₀', type: 'number', default: 1 },
        { id: 'rk2-h', label: 'h', type: 'number', default: 0.1 },
        { id: 'rk2-n', label: 'n pasos', type: 'number', default: 5 },
        { id: 'rk2-exact', label: 'Exacta y(x) (opcional)', type: 'text', default: '2*Math.exp(x)-x-1' }
    ],
    calcHelp: 'Ingrese f(x,y), condición inicial y pasos.',
    calculate: function(values) {
        try {
            const f = new Function('x', 'y', `return (${values['rk2-f']})`);
            const x0 = parseFloat(values['rk2-x0']), y0 = parseFloat(values['rk2-y0']);
            const h = parseFloat(values['rk2-h']), n = parseInt(values['rk2-n']);
            let exactFn = null;
            try { exactFn = new Function('x', `return (${values['rk2-exact']})`); } catch (e) {}
            let xs = [x0], ys = [y0];
            let x = x0, y = y0;
            for (let i = 0; i < n; i++) {
                let k1 = f(x, y);
                let k2 = f(x + h, y + h * k1);
                y = y + h / 2 * (k1 + k2);
                x += h;
                xs.push(x);
                ys.push(y);
            }
            const html = `
                <div class="metric-row">
                    <div class="metric"><span class="label">y(${xs[xs.length-1].toFixed(4)})</span><span class="value">${ys[ys.length-1].toFixed(8)}</span></div>
                </div>
                <table>
                    <thead><tr><th>n</th><th>x</th><th>y</th>${exactFn ? '<th>Exacta</th><th>Error</th>' : ''}</tr></thead>
                    <tbody>
                        ${xs.map((xi,i) => `<tr><td>${i}</td><td>${xi.toFixed(4)}</td><td>${ys[i].toFixed(8)}</td>${exactFn ? `<td>${exactFn(xi).toFixed(8)}</td><td>${Math.abs(ys[i]-exactFn(xi)).toExponential(2)}</td>` : ''}</tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Se calculan k1 y k2, se promedian y se actualiza y.</div>
            `;
            const charts = [];
            if (exactFn) {
                const xPlot = Array.from({length:100}, (_,i) => x0 + (xs[xs.length-1] - x0) * i / 99);
                const yExact = xPlot.map(x => exactFn(x));
                charts.push({
                    type: 'line',
                    title: 'Solución aproximada vs exacta',
                    labels: xPlot.map(x => x.toFixed(2)),
                    datasets: [
                        { label: 'RK2', data: xs.map((xi,i) => ({ x: xi, y: ys[i] })), borderColor: '#22c55e', pointRadius: 2, showLine: true },
                        { label: 'Exacta', data: yExact, borderColor: '#3b82f6', pointRadius: 0, showLine: true, borderDash: [5,5] }
                    ],
                    options: { scales: { y: { type: 'linear' } } }
                });
            }
            return { html, charts };
        } catch (e) { return { html: `Error: ${e.message}` }; }
    }
},

// ============================================================
//  17. RK4
// ============================================================
{
    id: 'rk4',
    icon: 'K₄',
    title: 'Runge-Kutta 4',
    description: 'Método de cuarto orden.',
    calcFields: [
        { id: 'rk4-f', label: 'f(x,y)', type: 'text', default: 'x + y' },
        { id: 'rk4-x0', label: 'x₀', type: 'number', default: 0 },
        { id: 'rk4-y0', label: 'y₀', type: 'number', default: 1 },
        { id: 'rk4-h', label: 'h', type: 'number', default: 0.1 },
        { id: 'rk4-n', label: 'n pasos', type: 'number', default: 5 },
        { id: 'rk4-exact', label: 'Exacta y(x) (opcional)', type: 'text', default: '2*Math.exp(x)-x-1' }
    ],
    calcHelp: 'Ingrese f(x,y), condición inicial y pasos.',
    calculate: function(values) {
        try {
            const f = new Function('x', 'y', `return (${values['rk4-f']})`);
            const x0 = parseFloat(values['rk4-x0']), y0 = parseFloat(values['rk4-y0']);
            const h = parseFloat(values['rk4-h']), n = parseInt(values['rk4-n']);
            let exactFn = null;
            try { exactFn = new Function('x', `return (${values['rk4-exact']})`); } catch (e) {}
            let xs = [x0], ys = [y0];
            let x = x0, y = y0;
            for (let i = 0; i < n; i++) {
                let k1 = f(x, y);
                let k2 = f(x + h / 2, y + h / 2 * k1);
                let k3 = f(x + h / 2, y + h / 2 * k2);
                let k4 = f(x + h, y + h * k3);
                y = y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4);
                x += h;
                xs.push(x);
                ys.push(y);
            }
            const html = `
                <div class="metric-row">
                    <div class="metric"><span class="label">y(${xs[xs.length-1].toFixed(4)})</span><span class="value">${ys[ys.length-1].toFixed(8)}</span></div>
                </div>
                <table>
                    <thead><tr><th>n</th><th>x</th><th>y</th>${exactFn ? '<th>Exacta</th><th>Error</th>' : ''}</tr></thead>
                    <tbody>
                        ${xs.map((xi,i) => `<tr><td>${i}</td><td>${xi.toFixed(4)}</td><td>${ys[i].toFixed(8)}</td>${exactFn ? `<td>${exactFn(xi).toFixed(8)}</td><td>${Math.abs(ys[i]-exactFn(xi)).toExponential(2)}</td>` : ''}</tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Se calculan los cuatro coeficientes y se actualiza.</div>
            `;
            const charts = [];
            if (exactFn) {
                const xPlot = Array.from({length:100}, (_,i) => x0 + (xs[xs.length-1] - x0) * i / 99);
                const yExact = xPlot.map(x => exactFn(x));
                charts.push({
                    type: 'line',
                    title: 'Solución aproximada vs exacta',
                    labels: xPlot.map(x => x.toFixed(2)),
                    datasets: [
                        { label: 'RK4', data: xs.map((xi,i) => ({ x: xi, y: ys[i] })), borderColor: '#bc8cff', pointRadius: 2, showLine: true },
                        { label: 'Exacta', data: yExact, borderColor: '#3b82f6', pointRadius: 0, showLine: true, borderDash: [5,5] }
                    ],
                    options: { scales: { y: { type: 'linear' } } }
                });
            }
            return { html, charts };
        } catch (e) { return { html: `Error: ${e.message}` }; }
    }
},

// ============================================================
//  18. SISTEMAS EDO 2x2
// ============================================================
{
    id: 'sistemasedo',
    icon: 'S',
    title: 'Sistemas EDO 2×2 (RK4)',
    description: 'RK4 para sistemas.',
    calcFields: [
        { id: 'sis-f0', label: 'f₀(x,y₀,y₁)', type: 'text', default: 'y1' },
        { id: 'sis-f1', label: 'f₁(x,y₀,y₁)', type: 'text', default: '-y0' },
        { id: 'sis-x0', label: 'x₀', type: 'number', default: 0 },
        { id: 'sis-y00', label: 'y₀(0)', type: 'number', default: 1 },
        { id: 'sis-y10', label: 'y₁(0)', type: 'number', default: 0 },
        { id: 'sis-h', label: 'h', type: 'number', default: 0.1 },
        { id: 'sis-n', label: 'n pasos', type: 'number', default: 20 }
    ],
    calcHelp: 'Ingrese f₀ y f₁. Se aplica RK4 al sistema.',
    calculate: function(values) {
        try {
            const f0 = new Function('x', 'y0', 'y1', `return (${values['sis-f0']})`);
            const f1 = new Function('x', 'y0', 'y1', `return (${values['sis-f1']})`);
            const x0 = parseFloat(values['sis-x0']);
            let y0 = parseFloat(values['sis-y00']);
            let y1 = parseFloat(values['sis-y10']);
            const h = parseFloat(values['sis-h']), n = parseInt(values['sis-n']);
            let xs = [x0], y0s = [y0], y1s = [y1];
            let x = x0;
            for (let i = 0; i < n; i++) {
                let k1a = f0(x, y0, y1), k1b = f1(x, y0, y1);
                let k2a = f0(x + h / 2, y0 + h / 2 * k1a, y1 + h / 2 * k1b);
                let k2b = f1(x + h / 2, y0 + h / 2 * k1a, y1 + h / 2 * k1b);
                let k3a = f0(x + h / 2, y0 + h / 2 * k2a, y1 + h / 2 * k2b);
                let k3b = f1(x + h / 2, y0 + h / 2 * k2a, y1 + h / 2 * k2b);
                let k4a = f0(x + h, y0 + h * k3a, y1 + h * k3b);
                let k4b = f1(x + h, y0 + h * k3a, y1 + h * k3b);
                y0 = y0 + h / 6 * (k1a + 2 * k2a + 2 * k3a + k4a);
                y1 = y1 + h / 6 * (k1b + 2 * k2b + 2 * k3b + k4b);
                x += h;
                xs.push(x);
                y0s.push(y0);
                y1s.push(y1);
            }
            const html = `
                <div class="metric-row">
                    <div class="metric"><span class="label">y₀ final</span><span class="value">${y0s[y0s.length-1].toFixed(6)}</span></div>
                    <div class="metric"><span class="label">y₁ final</span><span class="value">${y1s[y1s.length-1].toFixed(6)}</span></div>
                </div>
                <table>
                    <thead><tr><th>x</th><th>y₀</th><th>y₁</th></tr></thead>
                    <tbody>
                        ${xs.map((xi,i) => `<tr><td>${xi.toFixed(4)}</td><td>${y0s[i].toFixed(6)}</td><td>${y1s[i].toFixed(6)}</td></tr>`).slice(0,12).join('')}
                        ${n > 12 ? '<tr><td colspan="3">...</td></tr>' : ''}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Se aplica RK4 a ambas componentes simultáneamente.</div>
            `;
            const charts = [
                {
                    type: 'line',
                    title: 'Solución vs t',
                    labels: xs.map(x => x.toFixed(2)),
                    datasets: [
                        { label: 'y₀(t)', data: y0s, borderColor: '#3b82f6', fill: false, pointRadius: 1 },
                        { label: 'y₁(t)', data: y1s, borderColor: '#22c55e', fill: false, pointRadius: 1 }
                    ],
                    options: { scales: { y: { type: 'linear' } } }
                },
                {
                    type: 'scatter',
                    title: 'Plano de fase (y₀ vs y₁)',
                    datasets: [{
                        label: 'Trayectoria',
                        data: y0s.map((v,i) => ({ x: v, y: y1s[i] })),
                        borderColor: '#bc8cff',
                        backgroundColor: '#bc8cff',
                        pointRadius: 2,
                        showLine: true
                    }],
                    options: { scales: { x: { type: 'linear' }, y: { type: 'linear' } } }
                }
            ];
            return { html, charts };
        } catch (e) { return { html: `Error: ${e.message}` }; }
    }
}];

// Exportar para uso en main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { topics };
} else {
    window.topics = topics;
}
