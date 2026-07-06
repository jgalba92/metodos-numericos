// data.js — Definición de los temas y sus calculadoras.
// Toda la matemática vive en nm-core.js (NM.*). Aquí solo hay parsing de
// entradas, formato de resultados y definición de gráficas.
// calculate(values, detailed): detailed=true agrega el paso a paso narrado
// con los valores del usuario.

// ============================================================
//  HELPERS
// ============================================================
function parseMatrix(text) {
    return text.trim().split('\n').filter(l => l.trim()).map(l => l.trim().split(/\s+/).map(Number));
}
function parseVector(text) {
    return text.trim().split(/[\n,]+/).filter(s => s.trim()).map(Number);
}
const _f = (v, d = 6) => Number(v).toFixed(d);
const _f8 = v => Number(v).toFixed(8);
const _e = v => Number(v).toExponential(2);
const _err = msg => ({ html: `<span style="color:var(--red)">${msg}</span>`, charts: [] });

function _table(headers, rows) {
    return `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>` +
        `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
const _step = html => `<div class="step">${html}</div>`;
const _metrics = pairs => `<div class="metric-row">${pairs.map(p =>
    `<div class="metric"><span class="label">${p[0]}</span><span class="value">${p[1]}</span></div>`).join('')}</div>`;

function buildConvergenceChart(labels, data, label, color = '#4f8ef7', logY = true) {
    return {
        type: 'line', title: label, labels,
        datasets: [{ label, data, borderColor: color, backgroundColor: color + '22', fill: true, tension: 0.1, pointRadius: 2 }],
        options: { scales: { y: { type: logY ? 'logarithmic' : 'linear' } } }
    };
}
// Gráfica con eje x numérico real (evita el bug de ejes de categorías)
function buildXYChart(title, datasets) {
    return {
        type: 'scatter', title,
        datasets: datasets.map(d => ({ pointRadius: 0, showLine: true, fill: false, ...d })),
        options: { scales: { x: { type: 'linear' }, y: { type: 'linear' } } }
    };
}

// Valida un número que puede venir como expresión (PI, sqrt(2), 1e-6...)
function _num(raw, name) {
    const v = NM.evalConst(raw);
    if (!isFinite(v)) throw new Error(`Valor inválido en "${name}": ${raw}`);
    return v;
}

const VAR_NAMES = ['x', 'y', 'z', 'w'];

// ============================================================
//  TOPICS
// ============================================================
const topics = [

// ------------------------------------------------------------
//  1. ERRORES
// ------------------------------------------------------------
{
    id: 'errores',
    icon: '📊',
    title: 'Errores Numéricos',
    description: 'Absoluto, relativo, redondeo y truncamiento.',
    calcFields: [
        { id: 'err-exact', label: 'Valor exacto (x)', type: 'text', default: '87.245' },
        { id: 'err-aprox', label: 'Valor aprox. (x̃)', type: 'text', default: '87.19' },
        { id: 'err-dec', label: 'Decimales', type: 'number', default: 6, min: 1, max: 15 }
    ],
    calculate: function (values, detailed) {
        const xe = _num(values['err-exact'], 'valor exacto');
        const xa = _num(values['err-aprox'], 'valor aproximado');
        const dec = parseInt(values['err-dec']) || 6;
        if (xe === 0) return _err('El valor exacto no puede ser cero (error relativo indefinido).');
        const r = NM.errors(xe, xa);
        let html = _metrics([
            ['Error absoluto', r.ea.toFixed(dec)],
            ['Error relativo', r.er.toFixed(dec)],
            ['Error porcentual', r.ep.toFixed(dec) + '%']
        ]);
        if (detailed) {
            html += _step(`<strong>Paso 1 — Error absoluto:</strong> $E_a = |x - \\tilde{x}| = |${xe} - ${xa}| = ${r.ea.toFixed(dec)}$`);
            html += _step(`<strong>Paso 2 — Error relativo:</strong> $E_r = \\dfrac{E_a}{|x|} = \\dfrac{${r.ea.toFixed(dec)}}{${Math.abs(xe)}} = ${r.er.toFixed(dec)}$`);
            html += _step(`<strong>Paso 3 — Error porcentual:</strong> $E_p = E_r \\cdot 100 = ${r.ep.toFixed(dec)}\\%$`);
        }
        return { html, charts: [] };
    }
},

// ------------------------------------------------------------
//  2. AISLAMIENTO DE RAÍCES
// ------------------------------------------------------------
{
    id: 'aislamiento',
    icon: '🔍',
    title: 'Aislamiento de Raíces',
    description: 'Búsqueda incremental de intervalos con cambio de signo.',
    calcFields: [
        { id: 'ais-func', label: 'f(x)', type: 'text', default: 'x^3 - 4*x - 9' },
        { id: 'ais-a', label: 'a', type: 'text', default: '0' },
        { id: 'ais-b', label: 'b', type: 'text', default: '4' },
        { id: 'ais-step', label: 'Paso Δx', type: 'text', default: '0.5' }
    ],
    calculate: function (values, detailed) {
        const f = NM.makeFn(values['ais-func']);
        if (!f) return _err('f(x) inválida.');
        const a = _num(values['ais-a'], 'a'), b = _num(values['ais-b'], 'b'), step = _num(values['ais-step'], 'Δx');
        if (step <= 0 || b <= a) return _err('Se requiere b > a y Δx > 0.');
        if ((b - a) / step > 10000) return _err('Demasiados subintervalos (máx 10000).');
        const r = NM.incrementalSearch(f, a, b, step);
        let html = _metrics([
            ['Subintervalos', r.rows.length],
            ['Raíces aisladas', r.intervals.length]
        ]);
        html += _table(['xᵢ', 'xᵢ₊₁', 'f(xᵢ)', 'f(xᵢ₊₁)', 'Cambio'],
            r.rows.map(row => [_f(row.x1, 4), _f(row.x2, 4), _f(row.f1), _f(row.f2),
                row.change ? '<span class="badge-green">SÍ</span>' : 'no']));
        html += r.intervals.length
            ? _step(`<strong>Intervalos con raíz:</strong> ${r.intervals.map(iv => `[${_f(iv[0], 4)}, ${_f(iv[1], 4)}]`).join(' , ')}`)
            : _step('Sin cambios de signo. Pruebe con paso menor u otro intervalo.');
        if (detailed) {
            html += _step(`<strong>¿Cómo se obtuvo?</strong> Se evaluó f en ${r.rows.length + 1} nodos desde
                ${_f(a, 4)} hasta ${_f(b, 4)} con paso ${_f(step, 4)}. En cada par consecutivo se revisó el signo del
                producto $f(x_i) \\cdot f(x_{i+1})$: si es negativo, por el teorema de Bolzano hay al menos una raíz dentro.`);
            r.rows.filter(row => row.change).forEach(row => {
                html += _step(`En $[${_f(row.x1, 4)}, ${_f(row.x2, 4)}]$: $f(${_f(row.x1, 4)}) = ${_f(row.f1)}$ y
                    $f(${_f(row.x2, 4)}) = ${_f(row.f2)}$ → producto negativo → <strong>raíz aislada</strong>.`);
            });
        }
        const N = 120;
        const pts = Array.from({ length: N + 1 }, (_, i) => { const x = a + (b - a) * i / N; return { x, y: f(x) }; });
        const charts = [buildXYChart('f(x) en [a, b]', [
            { label: 'f(x)', data: pts, borderColor: '#4f8ef7' },
            { label: 'y = 0', data: [{ x: a, y: 0 }, { x: b, y: 0 }], borderColor: '#8b949e', borderDash: [6, 6] }
        ])];
        return { html, charts };
    }
},

// ------------------------------------------------------------
//  3. BISECCIÓN
// ------------------------------------------------------------
{
    id: 'biseccion',
    icon: '✂️',
    title: 'Bisección',
    description: 'Método cerrado para hallar raíces.',
    calcFields: [
        { id: 'bis-func', label: 'f(x)', type: 'text', default: 'x^3 - 4*x - 9' },
        { id: 'bis-a', label: 'a', type: 'text', default: '2' },
        { id: 'bis-b', label: 'b', type: 'text', default: '3' },
        { id: 'bis-tol', label: 'Tolerancia', type: 'text', default: '1e-6' },
        { id: 'bis-maxiter', label: 'Max iter.', type: 'number', default: 100 }
    ],
    calculate: function (values, detailed) {
        const f = NM.makeFn(values['bis-func']);
        if (!f) return _err('f(x) inválida.');
        const a = _num(values['bis-a'], 'a'), b = _num(values['bis-b'], 'b');
        const tol = _num(values['bis-tol'], 'tolerancia'), maxIter = parseInt(values['bis-maxiter']) || 100;
        const r = NM.bisection(f, a, b, tol, maxIter);
        if (!r.ok) return _err(`No hay cambio de signo: f(${a}) = ${_f(f(a))}, f(${b}) = ${_f(f(b))}.`);
        let html = _metrics([
            ['Raíz aprox.', _f8(r.root)],
            ['f(raíz)', _e(r.froot)],
            ['Iteraciones', r.rows.length]
        ]);
        if (detailed) {
            html += _step(`<strong>Planteamiento:</strong> $f(${_f(a, 4)}) = ${_f(f(a))}$ y $f(${_f(b, 4)}) = ${_f(f(b))}$
                tienen signos opuestos → hay raíz en $[${_f(a, 4)}, ${_f(b, 4)}]$.`);
            r.rows.slice(0, 3).forEach(row => {
                const keepLeft = row.fa * row.fc < 0;
                html += _step(`<strong>Iteración ${row.iter}:</strong>
                    $c = \\dfrac{${_f(row.a)} + ${_f(row.b)}}{2} = ${_f8(row.c)}$, $f(c) = ${_f(row.fc)}$.
                    Como $f(a)f(c) ${keepLeft ? '< 0' : '> 0'}$, la raíz queda en
                    $[${_f(keepLeft ? row.a : row.c)}, ${_f(keepLeft ? row.c : row.b)}]$. Error ≤ ${_e(row.error)}.`);
            });
            if (r.rows.length > 3) html += _step(`… el proceso continúa hasta que el error ≤ tolerancia (ver tabla).`);
        }
        html += _table(['n', 'a', 'b', 'c', 'f(c)', 'error ≤'],
            r.rows.map(row => [row.iter, _f(row.a), _f(row.b), _f8(row.c), _e(row.fc), _e(row.error)]));
        const labels = r.rows.map(row => row.iter);
        const charts = [
            buildConvergenceChart(labels, r.rows.map(row => row.error), 'Error (cota)', '#4f8ef7', true),
            buildConvergenceChart(labels, r.rows.map(row => row.b - row.a), 'Ancho del intervalo', '#3fb950', false)
        ];
        return { html, charts };
    }
},

// ------------------------------------------------------------
//  4. REGLA FALSA
// ------------------------------------------------------------
{
    id: 'reglafalsa',
    icon: '📏',
    title: 'Regla Falsa',
    description: 'Regula falsi: secante en lugar de punto medio.',
    calcFields: [
        { id: 'rf-func', label: 'f(x)', type: 'text', default: 'x^3 - 4*x - 9' },
        { id: 'rf-a', label: 'a', type: 'text', default: '2' },
        { id: 'rf-b', label: 'b', type: 'text', default: '3' },
        { id: 'rf-tol', label: 'Tolerancia', type: 'text', default: '1e-6' },
        { id: 'rf-maxiter', label: 'Max iter.', type: 'number', default: 100 }
    ],
    calculate: function (values, detailed) {
        const f = NM.makeFn(values['rf-func']);
        if (!f) return _err('f(x) inválida.');
        const a = _num(values['rf-a'], 'a'), b = _num(values['rf-b'], 'b');
        const tol = _num(values['rf-tol'], 'tolerancia'), maxIter = parseInt(values['rf-maxiter']) || 100;
        const r = NM.falsePosition(f, a, b, tol, maxIter);
        if (!r.ok) return _err(`No hay cambio de signo: f(${a}) = ${_f(f(a))}, f(${b}) = ${_f(f(b))}.`);
        let html = _metrics([
            ['Raíz aprox.', _f8(r.root)],
            ['f(raíz)', _e(r.froot)],
            ['Iteraciones', r.rows.length]
        ]);
        if (detailed) {
            r.rows.slice(0, 3).forEach(row => {
                html += _step(`<strong>Iteración ${row.iter}:</strong>
                    $c = b - \\dfrac{f(b)(b-a)}{f(b)-f(a)} =
                    ${_f(row.b)} - \\dfrac{${_f(row.fb)}(${_f(row.b)} - ${_f(row.a)})}{${_f(row.fb)} - (${_f(row.fa)})} = ${_f8(row.c)}$,
                    $f(c) = ${_f(row.fc)}$. Se reemplaza el extremo que tiene el mismo signo que $f(c)$.`);
            });
            if (r.rows.length > 3) html += _step('… continúa hasta cumplir la tolerancia (ver tabla).');
        }
        html += _table(['n', 'a', 'b', 'f(a)', 'f(b)', 'c', 'f(c)'],
            r.rows.map(row => [row.iter, _f(row.a), _f(row.b), _f(row.fa), _f(row.fb), _f8(row.c), _e(row.fc)]));
        const labels = r.rows.map(row => row.iter);
        const charts = [buildConvergenceChart(labels, r.rows.map(row => Math.abs(row.fc)), '|f(c)|', '#d29922', true)];
        return { html, charts };
    }
},

// ------------------------------------------------------------
//  5. PUNTO FIJO
// ------------------------------------------------------------
{
    id: 'puntofijo',
    icon: '🎯',
    title: 'Punto Fijo',
    description: 'Iteración x = g(x).',
    calcFields: [
        { id: 'pf-func', label: 'g(x)', type: 'text', default: 'exp(-x)' },
        { id: 'pf-x0', label: 'x₀', type: 'text', default: '0.5' },
        { id: 'pf-tol', label: 'Tolerancia', type: 'text', default: '1e-6' },
        { id: 'pf-maxiter', label: 'Max iter.', type: 'number', default: 100 }
    ],
    calculate: function (values, detailed) {
        const g = NM.makeFn(values['pf-func']);
        if (!g) return _err('g(x) inválida.');
        const x0 = _num(values['pf-x0'], 'x₀');
        const tol = _num(values['pf-tol'], 'tolerancia'), maxIter = parseInt(values['pf-maxiter']) || 100;
        const r = NM.fixedPoint(g, x0, tol, maxIter);
        if (!r.ok) return _err('La iteración divergió (g devolvió un valor no finito). Pruebe otro despeje g(x) u otro x₀.');
        let html = _metrics([
            ['Punto fijo aprox.', _f8(r.root)],
            ['Iteraciones', r.rows.length],
            ['Error final', _e(r.rows[r.rows.length - 1].err)]
        ]);
        if (detailed) {
            r.rows.slice(0, 3).forEach(row => {
                html += _step(`<strong>Iteración ${row.iter}:</strong>
                    $x_{${row.iter}} = g(${_f8(row.x)}) = ${_f8(row.xn)}$,
                    error $= |x_{${row.iter}} - x_{${row.iter - 1}}| = ${_e(row.err)}$`);
            });
            if (r.rows.length > 3) html += _step('… la sucesión se repite hasta que el error < tolerancia (ver tabla).');
            html += _step(`<strong>Convergencia:</strong> requiere $|g'(x)| < 1$ cerca del punto fijo.
                Si la columna de error crece, el despeje elegido no converge.`);
        }
        html += _table(['n', 'xₙ', 'xₙ₊₁ = g(xₙ)', 'error'],
            r.rows.map(row => [row.iter, _f8(row.x), _f8(row.xn), _e(row.err)]));
        const labels = r.rows.map(row => row.iter);
        const charts = [
            buildConvergenceChart(labels, r.rows.map(row => row.xn), 'xₙ', '#bc8cff', false),
            buildConvergenceChart(labels, r.rows.map(row => row.err), 'Error', '#f85149', true)
        ];
        return { html, charts };
    }
},

// ------------------------------------------------------------
//  6. NEWTON-RAPHSON
// ------------------------------------------------------------
{
    id: 'newton',
    icon: '🚀',
    title: 'Newton-Raphson',
    description: 'Método abierto de convergencia cuadrática.',
    calcFields: [
        { id: 'nr-func', label: 'f(x)', type: 'text', default: 'x^3 - x - 2' },
        { id: 'nr-dfunc', label: "f'(x) (opcional: vacío = derivada numérica)", type: 'text', default: '3*x^2 - 1' },
        { id: 'nr-x0', label: 'x₀', type: 'text', default: '1.5' },
        { id: 'nr-tol', label: 'Tolerancia', type: 'text', default: '1e-6' },
        { id: 'nr-maxiter', label: 'Max iter.', type: 'number', default: 100 }
    ],
    calculate: function (values, detailed) {
        const f = NM.makeFn(values['nr-func']);
        if (!f) return _err('f(x) inválida.');
        const fp = values['nr-dfunc'] && values['nr-dfunc'].trim() ? NM.makeFn(values['nr-dfunc']) : null;
        const x0 = _num(values['nr-x0'], 'x₀');
        const tol = _num(values['nr-tol'], 'tolerancia'), maxIter = parseInt(values['nr-maxiter']) || 100;
        const r = NM.newtonRaphson(f, fp, x0, tol, maxIter);
        if (!r.ok) return _err('Derivada cercana a cero — Newton no puede continuar. Pruebe otro x₀.');
        let html = _metrics([
            ['Raíz aprox.', _f8(r.root)],
            ['f(raíz)', _e(r.froot)],
            ['Iteraciones', r.rows.length]
        ]);
        if (detailed) {
            html += _step(`<strong>Derivada:</strong> ${fp ? 'ingresada por el usuario' : 'aproximada numéricamente (diferencia centrada)'}.`);
            r.rows.slice(0, 3).forEach(row => {
                html += _step(`<strong>Iteración ${row.iter}:</strong>
                    $f(${_f8(row.x)}) = ${_f(row.fx)}$, $f'(${_f8(row.x)}) = ${_f(row.fpx)}$<br>
                    $x_{${row.iter}} = ${_f8(row.x)} - \\dfrac{${_f(row.fx)}}{${_f(row.fpx)}} = ${_f8(row.xn)}$,
                    error $= ${_e(row.err)}$`);
            });
            if (r.rows.length > 3) html += _step('… convergencia cuadrática: el error se eleva al cuadrado en cada paso (ver tabla).');
        }
        html += _table(['n', 'xₙ', 'f(xₙ)', "f'(xₙ)", 'xₙ₊₁', 'error'],
            r.rows.map(row => [row.iter, _f8(row.x), _e(row.fx), _f(row.fpx), _f8(row.xn), _e(row.err)]));
        const labels = r.rows.map(row => row.iter);
        const charts = [
            buildConvergenceChart(labels, r.rows.map(row => row.xn), 'xₙ', '#f85149', false),
            buildConvergenceChart(labels, r.rows.map(row => Math.abs(row.fx)), '|f(xₙ)|', '#d29922', true)
        ];
        return { html, charts };
    }
},

// ------------------------------------------------------------
//  7. JACOBI
// ------------------------------------------------------------
{
    id: 'jacobi',
    icon: '🔢',
    title: 'Jacobi',
    description: 'Método iterativo para sistemas lineales N×N.',
    calcFields: [
        { id: 'jac-A', label: 'Matriz A (una fila por línea, valores separados por espacios)', type: 'textarea', default: '10 -1 2\n1 8 -1\n2 -1 9', rows: 4 },
        { id: 'jac-b', label: 'Vector b (una componente por línea o separado por comas)', type: 'textarea', default: '7\n8\n6', rows: 3 },
        { id: 'jac-x0', label: 'x⁽⁰⁾ (separado por comas; vacío = ceros)', type: 'text', default: '0,0,0' },
        { id: 'jac-tol', label: 'Tolerancia', type: 'text', default: '1e-6' },
        { id: 'jac-max', label: 'Max iter.', type: 'number', default: 100 }
    ],
    calculate: function (values, detailed) {
        return linearIterCalc(values, 'jac', 'jacobi', detailed);
    }
},

// ------------------------------------------------------------
//  8. GAUSS-SEIDEL
// ------------------------------------------------------------
{
    id: 'gaussseidel',
    icon: '🔁',
    title: 'Gauss-Seidel',
    description: 'Variante de Jacobi con actualización inmediata.',
    calcFields: [
        { id: 'gs-A', label: 'Matriz A (una fila por línea, valores separados por espacios)', type: 'textarea', default: '10 -1 2\n1 8 -1\n2 -1 9', rows: 4 },
        { id: 'gs-b', label: 'Vector b (una componente por línea o separado por comas)', type: 'textarea', default: '7\n8\n6', rows: 3 },
        { id: 'gs-x0', label: 'x⁽⁰⁾ (separado por comas; vacío = ceros)', type: 'text', default: '0,0,0' },
        { id: 'gs-tol', label: 'Tolerancia', type: 'text', default: '1e-6' },
        { id: 'gs-max', label: 'Max iter.', type: 'number', default: 100 }
    ],
    calculate: function (values, detailed) {
        return linearIterCalc(values, 'gs', 'gaussSeidel', detailed);
    }
},

// ------------------------------------------------------------
//  9. SOR
// ------------------------------------------------------------
{
    id: 'sor',
    icon: '⚡',
    title: 'SOR (Relajación)',
    description: 'Relajación sucesiva con parámetro ω.',
    calcFields: [
        { id: 'sor-A', label: 'Matriz A (una fila por línea, valores separados por espacios)', type: 'textarea', default: '4 -1\n-1 5', rows: 3 },
        { id: 'sor-b', label: 'Vector b (una componente por línea o separado por comas)', type: 'textarea', default: '7\n8', rows: 2 },
        { id: 'sor-x0', label: 'x⁽⁰⁾ (separado por comas; vacío = ceros)', type: 'text', default: '0,0' },
        { id: 'sor-omega', label: 'ω (0 < ω < 2)', type: 'text', default: '1.1' },
        { id: 'sor-tol', label: 'Tolerancia', type: 'text', default: '1e-6' },
        { id: 'sor-max', label: 'Max iter.', type: 'number', default: 100 }
    ],
    calculate: function (values, detailed) {
        return linearIterCalc(values, 'sor', 'sor', detailed);
    }
},

// ------------------------------------------------------------
//  10. NEWTON SISTEMAS NO LINEALES
// ------------------------------------------------------------
{
    id: 'newtonsistemas',
    icon: '🧮',
    title: 'Newton (sistemas no lineales)',
    description: 'Newton multivariable con Jacobiano numérico (2 a 4 ecuaciones).',
    calcFields: [
        { id: 'ns-eqs', label: 'Ecuaciones = 0 (una por línea, variables x, y, z, w)', type: 'textarea', default: 'x^2 + y^2 - 4\nx - y - 1', rows: 3 },
        { id: 'ns-x0', label: 'Punto inicial (separado por comas)', type: 'text', default: '1.5, 0.5' },
        { id: 'ns-tol', label: 'Tolerancia', type: 'text', default: '1e-6' },
        { id: 'ns-max', label: 'Max iter.', type: 'number', default: 50 }
    ],
    calculate: function (values, detailed) {
        const eqLines = values['ns-eqs'].trim().split('\n').filter(l => l.trim());
        const x0 = parseVector(values['ns-x0']);
        const n = eqLines.length;
        if (n < 2 || n > 4) return _err('Se admiten entre 2 y 4 ecuaciones.');
        if (x0.length !== n || x0.some(isNaN)) return _err(`El punto inicial debe tener ${n} componentes numéricas.`);
        const vars = VAR_NAMES.slice(0, n);
        const fs = eqLines.map(l => NM.makeFn(l, vars));
        if (fs.some(f => !f)) return _err('Alguna ecuación es inválida.');
        const tol = _num(values['ns-tol'], 'tolerancia'), maxIter = parseInt(values['ns-max']) || 50;
        const r = NM.newtonSystem(fs, x0, tol, maxIter);
        if (!r.ok) return _err('Jacobiano singular — Newton no puede continuar. Pruebe otro punto inicial.');
        let html = _metrics(r.x.map((v, i) => [vars[i], _f8(v)])
            .concat([['Iteraciones', r.rows.length]]));
        if (detailed) {
            r.rows.slice(0, 2).forEach(row => {
                html += _step(`<strong>Iteración ${row.iter}:</strong>
                    punto actual $(${row.x.map(v => _f(v)).join(',\\; ')})$,
                    $F = (${row.F.map(v => _f(v)).join(',\\; ')})$.<br>
                    Se arma el Jacobiano por diferencias centradas y se resuelve $J\\,\\Delta = -F$ →
                    $\\Delta = (${row.d.map(v => _f(v)).join(',\\; ')})$.<br>
                    Nuevo punto: $(${row.xn.map(v => _f8(v)).join(',\\; ')})$, error $= ${_e(row.err)}$`);
            });
            if (r.rows.length > 2) html += _step('… se repite hasta que la corrección sea menor que la tolerancia (ver tabla).');
        }
        html += _table(['k'].concat(vars).concat(eqLines.map((_, i) => `f${i + 1}`)).concat(['error']),
            r.rows.map(row => [row.iter].concat(row.x.map(v => _f8(v))).concat(row.F.map(v => _e(v))).concat([_e(row.err)])));
        const labels = r.rows.map(row => row.iter);
        const palette = ['#4f8ef7', '#3fb950', '#d29922', '#bc8cff'];
        const charts = [
            { type: 'line', title: 'Variables vs iteración', labels,
              datasets: vars.map((v, i) => ({ label: v, data: r.rows.map(row => row.xn[i]), borderColor: palette[i], fill: false, pointRadius: 2 })),
              options: { scales: { y: { type: 'linear' } } } },
            buildConvergenceChart(labels, r.rows.map(row => row.err), 'Error', '#f85149', true)
        ];
        return { html, charts };
    }
},

// ------------------------------------------------------------
//  11. INTERPOLACIÓN
// ------------------------------------------------------------
{
    id: 'interpolacion',
    icon: '📐',
    title: 'Interpolación (Newton / Lagrange)',
    description: 'Polinomio interpolante por diferencias divididas y Lagrange.',
    calcFields: [
        { id: 'int-pts', label: 'Puntos x,y (uno por línea)', type: 'textarea', default: '1,2\n2,3\n4,7', rows: 4 },
        { id: 'int-xv', label: 'Evaluar en x =', type: 'text', default: '3' }
    ],
    calculate: function (values, detailed) {
        const lines = values['int-pts'].trim().split('\n').filter(l => l.trim());
        const pts = lines.map(l => l.split(',').map(Number));
        if (pts.length < 2 || pts.some(p => p.length !== 2 || p.some(isNaN))) return _err('Formato inválido: use "x,y" por línea, mínimo 2 puntos.');
        const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
        if (new Set(xs).size !== xs.length) return _err('Los valores de x deben ser distintos.');
        const xv = _num(values['int-xv'], 'x');
        const n = xs.length;
        const dd = NM.dividedDifferences(xs, ys);
        const N = NM.newtonInterpEval(xs, dd.coefs, xv);
        const L = NM.lagrangeEval(xs, ys, xv);
        let html = _metrics([
            [`Newton P(${xv})`, _f8(N)],
            [`Lagrange P(${xv})`, _f8(L.P)],
            ['|dif.|', _e(Math.abs(N - L.P))]
        ]);
        if (detailed) {
            html += _step(`<strong>Newton — coeficientes (diferencias divididas):</strong>
                ${dd.coefs.map((c, i) => `$a_{${i}} = ${_f(c)}$`).join(', ')}`);
            html += _step(`<strong>Polinomio de Newton:</strong> $P(x) = ${_f(dd.coefs[0])}` +
                dd.coefs.slice(1).map((c, i) =>
                    ` ${c >= 0 ? '+' : '-'} ${_f(Math.abs(c))}` + xs.slice(0, i + 1).map(x0 => `(x - ${x0})`).join('')).join('') + '$');
            html += _step(`<strong>Lagrange en x = ${xv}:</strong><br>` +
                L.terms.map(t => `$L_{${t.i}}(${xv}) = ${_f(t.L)}$, aporte $y_{${t.i}}L_{${t.i}} = ${_f(t.contrib)}$`).join('<br>') +
                `<br>Suma: $P(${xv}) = ${_f8(L.P)}$`);
        }
        html += '<p style="margin-top:0.6rem"><strong>Tabla de diferencias divididas:</strong></p>';
        html += _table(['i', 'xᵢ', 'yᵢ'].concat(Array.from({ length: n - 1 }, (_, i) => `Orden ${i + 1}`)),
            xs.map((xi, i) => [i, xi, ys[i]].concat(Array.from({ length: n - 1 }, (_, k) =>
                (k + 1 < dd.table.length && i < dd.table[k + 1].length) ? _f(dd.table[k + 1][i]) : ''))));
        const xMin = Math.min(...xs, xv) - 0.5, xMax = Math.max(...xs, xv) + 0.5;
        const M = 120;
        const curve = Array.from({ length: M + 1 }, (_, i) => {
            const x = xMin + (xMax - xMin) * i / M;
            return { x, y: NM.newtonInterpEval(xs, dd.coefs, x) };
        });
        const charts = [buildXYChart('Polinomio interpolante', [
            { label: 'P(x)', data: curve, borderColor: '#4f8ef7' },
            { label: 'Datos', data: xs.map((x, i) => ({ x, y: ys[i] })), borderColor: '#f85149', backgroundColor: '#f85149', pointRadius: 4, showLine: false },
            { label: `P(${xv})`, data: [{ x: xv, y: N }], borderColor: '#3fb950', backgroundColor: '#3fb950', pointRadius: 5, showLine: false }
        ])];
        return { html, charts };
    }
},

// ------------------------------------------------------------
//  12. INTEGRACIÓN
// ------------------------------------------------------------
{
    id: 'integracion',
    icon: '∫',
    title: 'Integración Numérica',
    description: 'Trapecio, Simpson 1/3, Simpson 3/8 y Gauss-Legendre.',
    calcFields: [
        { id: 'int-fx', label: 'f(x)', type: 'text', default: 'x^2 + 1' },
        { id: 'int-a', label: 'a (acepta PI, sqrt(2), exp(1)...)', type: 'text', default: '0' },
        { id: 'int-b', label: 'b', type: 'text', default: '2' },
        { id: 'int-n', label: 'n (subintervalos)', type: 'number', default: 6 }
    ],
    calculate: function (values, detailed) {
        const f = NM.makeFn(values['int-fx']);
        if (!f) return _err('f(x) inválida.');
        const a = _num(values['int-a'], 'a'), b = _num(values['int-b'], 'b');
        const n = parseInt(values['int-n']);
        if (!(n > 0)) return _err('n debe ser un entero positivo.');
        const t = NM.trapezoid(f, a, b, n);
        const n13 = n % 2 === 0 ? n : n + 1;
        const s13 = NM.simpson13(f, a, b, n13);
        const n38 = n % 3 === 0 ? n : n + (3 - n % 3);
        const s38 = NM.simpson38(f, a, b, n38);
        const g = NM.gaussLegendre2(f, a, b);
        let html = _metrics([
            [`Trapecio (n=${n})`, _f8(t.I)],
            [`Simpson 1/3 (n=${n13})`, _f8(s13.I)],
            [`Simpson 3/8 (n=${n38})`, _f8(s38.I)],
            ['Gauss-Legendre (2 pts)', _f8(g.I)]
        ]);
        if (n13 !== n || n38 !== n) {
            html += `<div class="cdn-warning">Simpson 1/3 requiere n par y Simpson 3/8 requiere n múltiplo de 3:
                se ajustaron a n=${n13} y n=${n38} respectivamente.</div>`;
        }
        if (detailed) {
            html += _step(`<strong>Malla del trapecio:</strong> $h = \\dfrac{${_f(b, 4)} - ${_f(a, 4)}}{${n}} = ${_f(t.h)}$`);
            html += _table(['i', 'xᵢ', 'f(xᵢ)', 'peso trapecio'],
                t.xs.map((x, i) => [i, _f(x, 4), _f(t.fs[i]), (i === 0 || i === n) ? 1 : 2]));
            html += _step(`<strong>Trapecio:</strong> $I \\approx \\dfrac{h}{2}[f_0 + 2(f_1 + \\cdots + f_{n-1}) + f_n] = ${_f8(t.I)}$`);
            html += _step(`<strong>Simpson 1/3</strong> (pesos 1,4,2,4,…,1 con n=${n13}): $I \\approx \\dfrac{h}{3}\\,\\Sigma = ${_f8(s13.I)}$`);
            html += _step(`<strong>Simpson 3/8</strong> (pesos 1,3,3,2,3,3,…,1 con n=${n38}): $I \\approx \\dfrac{3h}{8}\\,\\Sigma = ${_f8(s38.I)}$`);
            html += _step(`<strong>Gauss-Legendre 2 puntos:</strong> nodos $x_{1,2} = \\frac{a+b}{2} \\pm \\frac{b-a}{2\\sqrt{3}}$
                = ${_f(g.x1)}, ${_f(g.x2)} → $I \\approx ${_f8(g.I)}$ (exacto hasta grado 3).`);
        }
        const M = 120;
        const curve = Array.from({ length: M + 1 }, (_, i) => { const x = a + (b - a) * i / M; return { x, y: f(x) }; });
        const charts = [buildXYChart('f(x) y nodos del trapecio', [
            { label: 'f(x)', data: curve, borderColor: '#4f8ef7' },
            { label: 'nodos', data: t.xs.map((x, i) => ({ x, y: t.fs[i] })), borderColor: '#3fb950', backgroundColor: '#3fb950', pointRadius: 4, showLine: false }
        ])];
        return { html, charts };
    }
},

// ------------------------------------------------------------
//  13. DIFERENCIACIÓN
// ------------------------------------------------------------
{
    id: 'diferenciacion',
    icon: '∂',
    title: 'Diferenciación',
    description: 'Progresiva, regresiva y centrada.',
    calcFields: [
        { id: 'diff-fx', label: 'f(x)', type: 'text', default: 'x^2' },
        { id: 'diff-x0', label: 'x₀', type: 'text', default: '1' },
        { id: 'diff-h', label: 'h', type: 'text', default: '0.1' },
        { id: 'diff-exact', label: "f'(x₀) exacta (opcional)", type: 'text', default: '2' }
    ],
    calculate: function (values, detailed) {
        const f = NM.makeFn(values['diff-fx']);
        if (!f) return _err('f(x) inválida.');
        const x0 = _num(values['diff-x0'], 'x₀'), h = _num(values['diff-h'], 'h');
        if (h <= 0) return _err('h debe ser positivo.');
        const exact = values['diff-exact'] && values['diff-exact'].trim() ? NM.evalConst(values['diff-exact']) : NaN;
        const p = NM.diffForward(f, x0, h);
        const rg = NM.diffBackward(f, x0, h);
        const c = NM.diffCentral(f, x0, h);
        let html = _metrics([
            ['Progresiva', _f8(p)],
            ['Regresiva', _f8(rg)],
            ['Centrada', _f8(c)]
        ]);
        if (isFinite(exact)) {
            html += _metrics([
                ['Err. progresiva', _e(Math.abs(p - exact))],
                ['Err. regresiva', _e(Math.abs(rg - exact))],
                ['Err. centrada', _e(Math.abs(c - exact))]
            ]);
        }
        if (detailed) {
            html += _step(`<strong>Evaluaciones:</strong> $f(${_f(x0 + h, 4)}) = ${_f8(f(x0 + h))}$,
                $f(${_f(x0, 4)}) = ${_f8(f(x0))}$, $f(${_f(x0 - h, 4)}) = ${_f8(f(x0 - h))}$`);
            html += _step(`<strong>Progresiva</strong> $O(h)$: $\\dfrac{${_f8(f(x0 + h))} - ${_f8(f(x0))}}{${_f(h, 4)}} = ${_f8(p)}$`);
            html += _step(`<strong>Regresiva</strong> $O(h)$: $\\dfrac{${_f8(f(x0))} - ${_f8(f(x0 - h))}}{${_f(h, 4)}} = ${_f8(rg)}$`);
            html += _step(`<strong>Centrada</strong> $O(h^2)$: $\\dfrac{${_f8(f(x0 + h))} - ${_f8(f(x0 - h))}}{2(${_f(h, 4)})} = ${_f8(c)}$`);
        }
        return { html, charts: [] };
    }
},

// ------------------------------------------------------------
//  14. SEGUNDA DERIVADA
// ------------------------------------------------------------
{
    id: 'segundaderivada',
    icon: '∂²',
    title: 'Segunda Derivada',
    description: 'Fórmula centrada para f″.',
    calcFields: [
        { id: 'd2-fx', label: 'f(x)', type: 'text', default: 'x^3' },
        { id: 'd2-x0', label: 'x₀', type: 'text', default: '1' },
        { id: 'd2-h', label: 'h', type: 'text', default: '0.1' },
        { id: 'd2-exact', label: "f''(x₀) exacta (opcional)", type: 'text', default: '6' }
    ],
    calculate: function (values, detailed) {
        const f = NM.makeFn(values['d2-fx']);
        if (!f) return _err('f(x) inválida.');
        const x0 = _num(values['d2-x0'], 'x₀'), h = _num(values['d2-h'], 'h');
        if (h <= 0) return _err('h debe ser positivo.');
        const exact = values['d2-exact'] && values['d2-exact'].trim() ? NM.evalConst(values['d2-exact']) : NaN;
        const d2 = NM.diffSecond(f, x0, h);
        const metrics = [["f''(x₀) aprox.", _f8(d2)]];
        if (isFinite(exact)) {
            metrics.push(['Exacta', _f8(exact)], ['Error', _e(Math.abs(d2 - exact))]);
        }
        let html = _metrics(metrics);
        if (detailed) {
            const num = f(x0 + h) - 2 * f(x0) + f(x0 - h);
            html += _step(`<strong>Paso 1:</strong> $f(${_f(x0 + h, 4)}) = ${_f8(f(x0 + h))}$,
                $f(${_f(x0, 4)}) = ${_f8(f(x0))}$, $f(${_f(x0 - h, 4)}) = ${_f8(f(x0 - h))}$`);
            html += _step(`<strong>Paso 2 — numerador:</strong> $${_f8(f(x0 + h))} - 2(${_f8(f(x0))}) + ${_f8(f(x0 - h))} = ${_f8(num)}$`);
            html += _step(`<strong>Paso 3:</strong> $f''(x_0) \\approx \\dfrac{${_f8(num)}}{(${_f(h, 4)})^2} = ${_f8(d2)}$`);
        }
        return { html, charts: [] };
    }
},

// ------------------------------------------------------------
//  15. RICHARDSON
// ------------------------------------------------------------
{
    id: 'richardson',
    icon: '🎚️',
    title: 'Extrapolación Richardson',
    description: 'Combina D(h) y D(h/2) para cancelar el error dominante.',
    calcFields: [
        { id: 'rich-Dh', label: 'D(h)', type: 'text', default: '0.995' },
        { id: 'rich-Dh2', label: 'D(h/2)', type: 'text', default: '0.99875' },
        { id: 'rich-p', label: 'p (orden del error)', type: 'number', default: 2, min: 1, max: 8 },
        { id: 'rich-exact', label: 'Valor exacto (opcional)', type: 'text', default: '1' }
    ],
    calculate: function (values, detailed) {
        const Dh = _num(values['rich-Dh'], 'D(h)');
        const Dh2 = _num(values['rich-Dh2'], 'D(h/2)');
        const p = parseInt(values['rich-p']) || 2;
        const exact = values['rich-exact'] && values['rich-exact'].trim() ? NM.evalConst(values['rich-exact']) : NaN;
        const DR = NM.richardson(Dh, Dh2, p);
        const twoP = Math.pow(2, p);
        const metrics = [['D_R', DR.toFixed(10)]];
        if (isFinite(exact)) {
            metrics.push(['Err D(h)', _e(Math.abs(Dh - exact))],
                ['Err D(h/2)', _e(Math.abs(Dh2 - exact))],
                ['Err D_R', _e(Math.abs(DR - exact))]);
        }
        let html = _metrics(metrics);
        if (detailed) {
            html += _step(`<strong>Paso 1:</strong> orden $p = ${p}$ → $2^p = ${twoP}$`);
            html += _step(`<strong>Paso 2:</strong> $D_R = \\dfrac{2^p D(h/2) - D(h)}{2^p - 1}
                = \\dfrac{${twoP}(${_f8(Dh2)}) - ${_f8(Dh)}}{${twoP - 1}} = ${DR.toFixed(10)}$`);
            if (isFinite(exact)) {
                html += _step(`<strong>Ganancia:</strong> el error pasa de ${_e(Math.abs(Dh2 - exact))} a
                    ${_e(Math.abs(DR - exact))} — se canceló el término $O(h^{${p}})$ completo.`);
            }
        }
        return { html, charts: [] };
    }
},

// ------------------------------------------------------------
//  16. EULER
// ------------------------------------------------------------
{
    id: 'euler',
    icon: '📈',
    title: 'Euler (EDO)',
    description: 'Método de Euler para y′ = f(x, y).',
    calcFields: [
        { id: 'eul-f', label: "f(x, y) de y' = f(x,y)", type: 'text', default: 'x + y' },
        { id: 'eul-x0', label: 'x₀', type: 'text', default: '0' },
        { id: 'eul-y0', label: 'y₀', type: 'text', default: '1' },
        { id: 'eul-h', label: 'h', type: 'text', default: '0.1' },
        { id: 'eul-n', label: 'n pasos', type: 'number', default: 5 },
        { id: 'eul-exact', label: 'Solución exacta y(x) (opcional)', type: 'text', default: '2*exp(x) - x - 1' }
    ],
    calculate: function (values, detailed) { return odeCalc(values, 'eul', 'euler', detailed); }
},

// ------------------------------------------------------------
//  17. RK2
// ------------------------------------------------------------
{
    id: 'rk2',
    icon: '📊',
    title: 'Runge-Kutta 2 (Heun)',
    description: 'Método de segundo orden.',
    calcFields: [
        { id: 'rk2-f', label: "f(x, y) de y' = f(x,y)", type: 'text', default: 'x + y' },
        { id: 'rk2-x0', label: 'x₀', type: 'text', default: '0' },
        { id: 'rk2-y0', label: 'y₀', type: 'text', default: '1' },
        { id: 'rk2-h', label: 'h', type: 'text', default: '0.1' },
        { id: 'rk2-n', label: 'n pasos', type: 'number', default: 5 },
        { id: 'rk2-exact', label: 'Solución exacta y(x) (opcional)', type: 'text', default: '2*exp(x) - x - 1' }
    ],
    calculate: function (values, detailed) { return odeCalc(values, 'rk2', 'rk2', detailed); }
},

// ------------------------------------------------------------
//  18. RK4
// ------------------------------------------------------------
{
    id: 'rk4',
    icon: '🏆',
    title: 'Runge-Kutta 4',
    description: 'Método de cuarto orden.',
    calcFields: [
        { id: 'rk4-f', label: "f(x, y) de y' = f(x,y)", type: 'text', default: 'y' },
        { id: 'rk4-x0', label: 'x₀', type: 'text', default: '0' },
        { id: 'rk4-y0', label: 'y₀', type: 'text', default: '1' },
        { id: 'rk4-h', label: 'h', type: 'text', default: '0.1' },
        { id: 'rk4-n', label: 'n pasos', type: 'number', default: 10 },
        { id: 'rk4-exact', label: 'Solución exacta y(x) (opcional)', type: 'text', default: 'exp(x)' }
    ],
    calculate: function (values, detailed) { return odeCalc(values, 'rk4', 'rk4', detailed); }
},

// ------------------------------------------------------------
//  19. SISTEMAS DE EDO
// ------------------------------------------------------------
{
    id: 'sistemasedo',
    icon: '🔗',
    title: 'Sistemas EDO (RK4)',
    description: 'RK4 vectorial para 2 a 4 ecuaciones acopladas.',
    calcFields: [
        { id: 'sis-eqs', label: "Derivadas y₀', y₁', ... (una por línea; variables x, y0, y1, y2, y3)", type: 'textarea', default: 'y1\n-y0', rows: 3 },
        { id: 'sis-x0', label: 'x₀', type: 'text', default: '0' },
        { id: 'sis-y0', label: 'Condiciones iniciales (separado por comas)', type: 'text', default: '1, 0' },
        { id: 'sis-h', label: 'h', type: 'text', default: '0.1' },
        { id: 'sis-n', label: 'n pasos', type: 'number', default: 20 }
    ],
    calculate: function (values, detailed) {
        const eqLines = values['sis-eqs'].trim().split('\n').filter(l => l.trim());
        const ys0 = parseVector(values['sis-y0']);
        const m = eqLines.length;
        if (m < 2 || m > 4) return _err('Se admiten entre 2 y 4 ecuaciones.');
        if (ys0.length !== m || ys0.some(isNaN)) return _err(`Las condiciones iniciales deben tener ${m} componentes numéricas.`);
        const vars = ['x'].concat(Array.from({ length: m }, (_, i) => `y${i}`));
        const fs = eqLines.map(l => NM.makeFn(l, vars));
        if (fs.some(f => !f)) return _err('Alguna ecuación es inválida.');
        const x0 = _num(values['sis-x0'], 'x₀'), h = _num(values['sis-h'], 'h');
        const n = parseInt(values['sis-n']) || 20;
        if (h <= 0 || n <= 0 || n > 100000) return _err('Revise h > 0 y 0 < n ≤ 100000.');
        const r = NM.rk4System(fs, x0, ys0, h, n);
        let html = _metrics(r.ys.map((v, i) => [`y${i}(${_f(r.x, 4)})`, _f8(v)]));
        if (detailed) {
            const s1 = r.rows[1];
            html += _step(`<strong>Paso 1 (de x=${_f(x0, 4)} a x=${_f(s1.x, 4)}):</strong><br>
                $\\mathbf{k}_1 = (${s1.k1.map(v => _f(v)).join(',\\; ')})$,
                $\\mathbf{k}_2 = (${s1.k2.map(v => _f(v)).join(',\\; ')})$,<br>
                $\\mathbf{k}_3 = (${s1.k3.map(v => _f(v)).join(',\\; ')})$,
                $\\mathbf{k}_4 = (${s1.k4.map(v => _f(v)).join(',\\; ')})$<br>
                $\\mathbf{y}_1 = \\mathbf{y}_0 + \\frac{h}{6}(\\mathbf{k}_1 + 2\\mathbf{k}_2 + 2\\mathbf{k}_3 + \\mathbf{k}_4)
                = (${s1.ys.map(v => _f8(v)).join(',\\; ')})$`);
            if (r.rows.length > 2) html += _step('… cada paso repite el esquema con los 4 vectores de pendiente (ver tabla).');
        }
        const maxRows = 25;
        html += _table(['n', 'x'].concat(Array.from({ length: m }, (_, i) => `y${i}`)),
            r.rows.slice(0, maxRows).map(row => [row.i, _f(row.x, 4)].concat(row.ys.map(v => _f8(v)))));
        if (r.rows.length > maxRows) html += `<p style="color:var(--text-muted)">… ${r.rows.length - maxRows} filas más (tabla truncada).</p>`;
        const palette = ['#4f8ef7', '#3fb950', '#d29922', '#bc8cff'];
        const charts = [
            buildXYChart('Solución vs x', Array.from({ length: m }, (_, i) => ({
                label: `y${i}(x)`, data: r.rows.map(row => ({ x: row.x, y: row.ys[i] })), borderColor: palette[i], pointRadius: 1
            }))),
            buildXYChart('Plano de fase (y0 vs y1)', [{
                label: 'trayectoria', data: r.rows.map(row => ({ x: row.ys[0], y: row.ys[1] })),
                borderColor: '#bc8cff', pointRadius: 1
            }])
        ];
        return { html, charts };
    }
}];

// ============================================================
//  CALCULADORA COMPARTIDA: sistemas lineales iterativos
// ============================================================
function linearIterCalc(values, prefix, method, detailed) {
    const A = parseMatrix(values[prefix + '-A']);
    const b = parseVector(values[prefix + '-b']);
    const n = b.length;
    if (!A.length || A.length !== n || A.some(row => row.length !== n || row.some(isNaN)) || b.some(isNaN))
        return _err('Dimensiones inválidas: A debe ser N×N y b de tamaño N (revise filas y espacios).');
    if (A.some((row, i) => row[i] === 0))
        return _err('Hay ceros en la diagonal de A — el método no puede dividir. Reordene las ecuaciones.');
    const x0raw = (values[prefix + '-x0'] || '').trim();
    const x0 = x0raw ? parseVector(x0raw) : new Array(n).fill(0);
    if (x0.length !== n || x0.some(isNaN)) return _err(`x⁽⁰⁾ debe tener ${n} componentes.`);
    const tol = _num(values[prefix + '-tol'], 'tolerancia');
    const maxIter = parseInt(values[prefix + '-max']) || 100;
    let omega = 1;
    if (method === 'sor') {
        omega = _num(values[prefix + '-omega'], 'ω');
        if (!(omega > 0 && omega < 2)) return _err('ω debe estar en (0, 2) — teorema de Kahan.');
    }
    // Chequeo de dominancia diagonal (informativo)
    const dominant = A.every((row, i) => Math.abs(row[i]) > row.reduce((s, v, j) => j === i ? s : s + Math.abs(v), 0));
    const r = method === 'sor' ? NM.sor(A, b, x0, omega, tol, maxIter)
        : method === 'jacobi' ? NM.jacobi(A, b, x0, tol, maxIter)
        : NM.gaussSeidel(A, b, x0, tol, maxIter);
    const last = r.rows[r.rows.length - 1];
    const converged = last.err < tol;
    let html = _metrics(
        (method === 'sor' ? [['ω', omega.toFixed(2)]] : [])
        .concat(r.x.map((v, i) => [`x${i + 1}`, _f(v)]))
        .concat([['Iteraciones', r.rows.length], ['Error final', _e(last.err)]]));
    if (!dominant) html += `<div class="cdn-warning">⚠ A no es estrictamente diagonal dominante: la convergencia no está garantizada.</div>`;
    if (!converged) html += `<div class="cdn-warning">⚠ No se alcanzó la tolerancia en ${maxIter} iteraciones.</div>`;
    if (detailed) {
        const methodName = method === 'jacobi' ? 'Jacobi' : method === 'sor' ? 'SOR' : 'Gauss-Seidel';
        html += _step(`<strong>Despejes (${methodName}):</strong> de cada fila $i$ se despeja $x_i$: ` +
            A.map((row, i) => `$x_{${i + 1}} = \\frac{1}{${row[i]}}\\big(${b[i]}` +
                row.map((v, j) => j !== i && v !== 0 ? ` ${-v >= 0 ? '+' : '-'} ${Math.abs(v)}x_{${j + 1}}` : '').join('') + `\\big)$`).join(', '));
        r.rows.slice(0, 2).forEach((row, k) => {
            const prev = k === 0 ? x0 : r.rows[k - 1].x;
            html += _step(`<strong>Iteración ${row.iter}:</strong> partiendo de
                $(${prev.map(v => _f(v)).join(',\\; ')})$ se obtiene
                $(${row.x.map(v => _f(v)).join(',\\; ')})$, error $= ${_e(row.err)}$` +
                (method === 'gaussSeidel' || method === 'sor' ? ' (cada $x_i$ usa los valores ya actualizados de esta misma iteración)' : ' (usa solo valores de la iteración anterior)') +
                (method === 'sor' ? `, mezclados con $\\omega = ${omega}$: $x_i = (1-\\omega)x_i^{ant} + \\omega x_i^{GS}$` : ''));
        });
        if (r.rows.length > 2) html += _step('… se repite hasta que la variación máxima < tolerancia (ver tabla).');
    }
    html += _table(['k'].concat(Array.from({ length: n }, (_, i) => `x${i + 1}`)).concat(['error']),
        r.rows.map(row => [row.iter].concat(row.x.map(v => _f8(v))).concat([_e(row.err)])));
    const labels = r.rows.map(row => row.iter);
    const palette = ['#4f8ef7', '#3fb950', '#d29922', '#bc8cff', '#f85149', '#39d2c0'];
    const charts = [
        { type: 'line', title: 'Evolución de variables', labels,
          datasets: Array.from({ length: n }, (_, i) => ({
              label: `x${i + 1}`, data: r.rows.map(row => row.x[i]),
              borderColor: palette[i % palette.length], fill: false, pointRadius: 2 })),
          options: { scales: { y: { type: 'linear' } } } },
        buildConvergenceChart(labels, r.rows.map(row => row.err), 'Error', '#f85149', true)
    ];
    return { html, charts };
}

// ============================================================
//  CALCULADORA COMPARTIDA: EDOs de un paso (Euler / RK2 / RK4)
// ============================================================
function odeCalc(values, prefix, method, detailed) {
    const f = NM.makeFn(values[prefix + '-f'], ['x', 'y']);
    if (!f) return _err('f(x, y) inválida.');
    const x0 = _num(values[prefix + '-x0'], 'x₀'), y0 = _num(values[prefix + '-y0'], 'y₀');
    const h = _num(values[prefix + '-h'], 'h');
    const n = parseInt(values[prefix + '-n']);
    if (h <= 0 || !(n > 0) || n > 100000) return _err('Revise h > 0 y 0 < n ≤ 100000.');
    const exactRaw = values[prefix + '-exact'];
    const exactFn = exactRaw && exactRaw.trim() ? NM.makeFn(exactRaw) : null;
    const r = method === 'euler' ? NM.euler(f, x0, y0, h, n)
        : method === 'rk2' ? NM.rk2(f, x0, y0, h, n)
        : NM.rk4(f, x0, y0, h, n);
    if (!isFinite(r.y)) return _err('La solución se desbordó (no finita). Reduzca h o revise f(x,y).');
    const metrics = [[`y(${_f(r.x, 4)})`, _f8(r.y)]];
    if (exactFn && isFinite(exactFn(r.x))) {
        metrics.push(['Exacta', _f8(exactFn(r.x))], ['Error final', _e(Math.abs(r.y - exactFn(r.x)))]);
    }
    let html = _metrics(metrics);
    if (detailed) {
        const s1 = r.rows[1];
        if (method === 'euler') {
            html += _step(`<strong>Paso 1:</strong> pendiente $f(${_f(x0, 4)}, ${_f(y0, 4)}) = ${_f(s1.slope)}$<br>
                $y_1 = ${_f(y0, 4)} + ${_f(h, 4)}(${_f(s1.slope)}) = ${_f8(s1.y)}$ en $x_1 = ${_f(s1.x, 4)}$`);
        } else if (method === 'rk2') {
            html += _step(`<strong>Paso 1:</strong>
                $k_1 = f(${_f(x0, 4)}, ${_f(y0, 4)}) = ${_f(s1.k1)}$,
                $k_2 = f(${_f(x0 + h, 4)}, ${_f(y0, 4)} + ${_f(h, 4)}(${_f(s1.k1)})) = ${_f(s1.k2)}$<br>
                $y_1 = ${_f(y0, 4)} + \\frac{${_f(h, 4)}}{2}(${_f(s1.k1)} + ${_f(s1.k2)}) = ${_f8(s1.y)}$`);
        } else {
            html += _step(`<strong>Paso 1:</strong>
                $k_1 = ${_f(s1.k1)}$, $k_2 = ${_f(s1.k2)}$, $k_3 = ${_f(s1.k3)}$, $k_4 = ${_f(s1.k4)}$<br>
                $y_1 = ${_f(y0, 4)} + \\frac{${_f(h, 4)}}{6}\\big(k_1 + 2k_2 + 2k_3 + k_4\\big) = ${_f8(s1.y)}$`);
        }
        if (r.rows.length > 2) html += _step('… cada paso repite el mismo esquema desde el punto anterior (ver tabla).');
    }
    const kCols = method === 'euler' ? ['pendiente'] : method === 'rk2' ? ['k₁', 'k₂'] : ['k₁', 'k₂', 'k₃', 'k₄'];
    const maxRows = 25;
    html += _table(['n', 'xₙ'].concat(kCols).concat(['yₙ']).concat(exactFn ? ['exacta', 'error'] : []),
        r.rows.slice(0, maxRows).map(row => {
            const ks = method === 'euler' ? [row.slope] : method === 'rk2' ? [row.k1, row.k2] : [row.k1, row.k2, row.k3, row.k4];
            return [row.i, _f(row.x, 4)]
                .concat(ks.map(k => k !== undefined ? _f(k) : '—'))
                .concat([_f8(row.y)])
                .concat(exactFn ? [_f8(exactFn(row.x)), _e(Math.abs(row.y - exactFn(row.x)))] : []);
        }));
    if (r.rows.length > maxRows) html += `<p style="color:var(--text-muted)">… ${r.rows.length - maxRows} filas más (tabla truncada).</p>`;
    const methodLabel = method === 'euler' ? 'Euler' : method.toUpperCase();
    const datasets = [{ label: methodLabel, data: r.rows.map(row => ({ x: row.x, y: row.y })), borderColor: '#4f8ef7', pointRadius: 2 }];
    if (exactFn) {
        const M = 120;
        datasets.push({
            label: 'Exacta',
            data: Array.from({ length: M + 1 }, (_, i) => { const x = x0 + (r.x - x0) * i / M; return { x, y: exactFn(x) }; }),
            borderColor: '#3fb950', borderDash: [6, 4]
        });
    }
    const charts = [buildXYChart('Solución aproximada' + (exactFn ? ' vs exacta' : ''), datasets)];
    if (exactFn) {
        charts.push(buildConvergenceChart(r.rows.map(row => row.i),
            r.rows.map(row => Math.max(1e-16, Math.abs(row.y - exactFn(row.x)))), 'Error global', '#f85149', true));
    }
    return { html, charts };
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { topics };
} else {
    window.topics = topics;
}
