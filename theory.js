// theory.js — Contenido teórico de los 18 temas.
// Los ejemplos resueltos y su paso a paso se calculan ejecutando los
// algoritmos reales de nm-core.js: los números mostrados nunca se escriben a mano.
(function (root) {
    'use strict';
    const NM = (typeof module !== 'undefined' && module.exports)
        ? require('./nm-core.js')
        : root.NM;

    // ---------- helpers de formato ----------
    const f6 = v => Number(v).toFixed(6);
    const f8 = v => Number(v).toFixed(8);
    const f4 = v => Number(v).toFixed(4);
    const e2 = v => Number(v).toExponential(2);

    function table(headers, rows) {
        return `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>` +
            `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    }
    const step = html => `<div class="iter-step">${html}</div>`;
    const formula = tex => `<div class="formula">$$${tex}$$</div>`;
    const section = t => `<h3>${t}</h3>`;
    const exampleBox = (title, body) => `<div class="example-box"><h4>📝 ${title}</h4>${body}</div>`;

    const T = {};

    // ============================================================
    // CORTE I
    // ============================================================

    // ---------- 1. Errores ----------
    (function () {
        const xe = 87.245, xa = 87.19;
        const r = NM.errors(xe, xa);
        T.errores = `
<h2>📊 Análisis de Errores Numéricos</h2>
${section('¿Qué es y cuándo se usa?')}
<p>Todo cálculo numérico produce aproximaciones. El análisis de errores cuantifica qué tan lejos
está un valor aproximado \\( \\tilde{x} \\) del valor exacto \\( x \\). Se usa siempre: para decidir
cuántas cifras reportar, para fijar criterios de paro en métodos iterativos y para comparar métodos.</p>
${section('Fórmulas')}
${formula('E_a = |x - \\tilde{x}| \\qquad E_r = \\frac{|x - \\tilde{x}|}{|x|} \\qquad E_p = E_r \\cdot 100\\%')}
<p>Fuentes de error: <strong>redondeo</strong> (representación finita de la máquina) y
<strong>truncamiento</strong> (cortar un proceso infinito, p. ej. una serie de Taylor).</p>
${section('Condiciones')}
<ul>
<li>\\(E_r\\) solo está definido si \\(x \\neq 0\\).</li>
<li>Si no se conoce el valor exacto, se usa el error aproximado \\( \\varepsilon_a = \\left| \\frac{x_{nuevo} - x_{viejo}}{x_{nuevo}} \\right| \\cdot 100\\% \\).</li>
</ul>
${section('Ejemplo resuelto')}
${exampleBox(`Con x = ${xe} y x̃ = ${xa}`, `
${step(`<strong>Paso 1 — Error absoluto:</strong> \\(E_a = |${xe} - ${xa}| = ${f6(r.ea)}\\)`)}
${step(`<strong>Paso 2 — Error relativo:</strong> \\(E_r = \\dfrac{${f6(r.ea)}}{|${xe}|} = ${f6(r.er)}\\)`)}
${step(`<strong>Paso 3 — Error porcentual:</strong> \\(E_p = ${f6(r.er)} \\times 100 = ${f6(r.ep)}\\,\\%\\)`)}
`)}`;
    })();

    // ---------- 2. Aislamiento de raíces ----------
    (function () {
        const f = NM.makeFn('x^3 - 4*x - 9');
        const r = NM.incrementalSearch(f, 2, 3, 0.25);
        T.aislamiento = `
<h2>🔍 Aislamiento de Raíces (búsqueda incremental)</h2>
${section('¿Qué es y cuándo se usa?')}
<p>Antes de aplicar un método de raíces hay que <strong>localizar</strong> un intervalo que contenga
una sola raíz. La búsqueda incremental recorre \\([a,b]\\) con paso \\(\\Delta x\\) y detecta cambios
de signo de \\(f\\). Se usa como paso previo a bisección, regla falsa, etc.</p>
${section('Fundamento (Teorema de Bolzano)')}
${formula('f \\in C[a,b] \\;\\wedge\\; f(a)\\,f(b) < 0 \\;\\Rightarrow\\; \\exists\\, c \\in (a,b) : f(c) = 0')}
${section('Condiciones')}
<ul>
<li>\\(f\\) continua en el intervalo explorado.</li>
<li>Si \\(\\Delta x\\) es muy grande pueden "saltarse" raíces pares o raíces muy juntas.</li>
</ul>
${section('Ejemplo resuelto')}
${exampleBox(`f(x) = x³ − 4x − 9 en [2, 3] con Δx = 0.25`, `
<p>Se evalúa \\(f\\) en cada nodo y se revisa el producto \\(f(x_i)\\,f(x_{i+1})\\):</p>
${table(['x_i', 'x_{i+1}', 'f(x_i)', 'f(x_{i+1})', '¿Cambio de signo?'],
        r.rows.map(row => [f4(row.x1), f4(row.x2), f6(row.f1), f6(row.f2),
            row.change ? '<span class="badge-green">SÍ</span>' : 'no']))}
${step(`<strong>Conclusión:</strong> hay una raíz aislada en \\([${f4(r.intervals[0][0])},\\; ${f4(r.intervals[0][1])}]\\),
porque \\(f(${f4(r.intervals[0][0])}) = ${f6(f(r.intervals[0][0]))} < 0\\) y
\\(f(${f4(r.intervals[0][1])}) = ${f6(f(r.intervals[0][1]))} > 0\\).`)}
`)}`;
    })();

    // ---------- 3. Bisección ----------
    (function () {
        const f = NM.makeFn('x^3 - 4*x - 9');
        const r = NM.bisection(f, 2, 3, 1e-6, 100);
        const it1 = r.rows[0], it2 = r.rows[1], it3 = r.rows[2];
        T.biseccion = `
<h2>✂️ Método de Bisección</h2>
${section('¿Qué es y cuándo se usa?')}
<p>Método <strong>cerrado</strong>: parte de un intervalo \\([a,b]\\) con cambio de signo y lo divide
a la mitad en cada iteración, quedándose con la mitad que conserva el cambio de signo.
Se usa cuando se necesita <strong>convergencia garantizada</strong>, aunque sea lenta.</p>
${section('Fórmulas')}
${formula('c_n = \\frac{a_n + b_n}{2} \\qquad \\text{error} \\le \\frac{b_n - a_n}{2} = \\frac{b_0 - a_0}{2^{n+1}}')}
<p>Número de iteraciones para garantizar tolerancia \\(\\varepsilon\\):</p>
${formula('n \\ge \\log_2\\!\\left(\\frac{b_0 - a_0}{\\varepsilon}\\right) - 1')}
${section('Condiciones de convergencia')}
<ul>
<li>\\(f\\) continua en \\([a,b]\\) y \\(f(a)\\,f(b) < 0\\).</li>
<li>Siempre converge (orden lineal, razón 1/2).</li>
</ul>
${section('Ejemplo resuelto')}
${exampleBox(`f(x) = x³ − 4x − 9 en [2, 3], tolerancia 10⁻⁶`, `
<p>Verificación inicial: \\(f(2) = ${f6(f(2))}\\) y \\(f(3) = ${f6(f(3))}\\) → hay cambio de signo.</p>
${step(`<strong>Iteración 1:</strong> \\(c = \\frac{${f6(it1.a)} + ${f6(it1.b)}}{2} = ${f8(it1.c)}\\),
\\(f(c) = ${f6(it1.fc)}\\). Como \\(f(a)f(c) ${it1.fc * f(it1.a) < 0 ? '<' : '>'} 0\\), la raíz está en
\\([${f6(it1.fc * f(it1.a) < 0 ? it1.a : it1.c)}, ${f6(it1.fc * f(it1.a) < 0 ? it1.c : it1.b)}]\\).`)}
${step(`<strong>Iteración 2:</strong> \\(c = \\frac{${f6(it2.a)} + ${f6(it2.b)}}{2} = ${f8(it2.c)}\\),
\\(f(c) = ${f6(it2.fc)}\\).`)}
${step(`<strong>Iteración 3:</strong> \\(c = \\frac{${f6(it3.a)} + ${f6(it3.b)}}{2} = ${f8(it3.c)}\\),
\\(f(c) = ${f6(it3.fc)}\\).`)}
<p>Tabla completa de las ${r.rows.length} iteraciones:</p>
${table(['n', 'a', 'b', 'c', 'f(c)', 'error ≤'],
        r.rows.map(row => [row.iter, f6(row.a), f6(row.b), f8(row.c), e2(row.fc), e2(row.error)]))}
${step(`<strong>Resultado:</strong> \\(x \\approx ${f8(r.root)}\\) tras ${r.rows.length} iteraciones
(raíz de referencia: 2.7065279546).`)}
`)}`;
    })();

    // ---------- 4. Regla falsa ----------
    (function () {
        const f = NM.makeFn('x^3 - 4*x - 9');
        const r = NM.falsePosition(f, 2, 3, 1e-6, 100);
        const it1 = r.rows[0];
        T.reglafalsa = `
<h2>📏 Regla Falsa (Regula Falsi)</h2>
${section('¿Qué es y cuándo se usa?')}
<p>Método <strong>cerrado</strong> como bisección, pero en lugar del punto medio usa la intersección
de la <strong>secante</strong> entre \\((a, f(a))\\) y \\((b, f(b))\\) con el eje x. Suele converger más
rápido que bisección cuando la función es aproximadamente lineal cerca de la raíz.</p>
${section('Fórmula')}
${formula('c = b - \\frac{f(b)\\,(b - a)}{f(b) - f(a)}')}
${section('Condiciones de convergencia')}
<ul>
<li>\\(f\\) continua y \\(f(a)\\,f(b) < 0\\). Convergencia garantizada.</li>
<li>Si \\(f\\) es muy convexa/cóncava, un extremo se "estanca" y converge lento (peor que bisección).</li>
</ul>
${section('Ejemplo resuelto')}
${exampleBox(`f(x) = x³ − 4x − 9 en [2, 3], tolerancia 10⁻⁶`, `
${step(`<strong>Iteración 1:</strong>
\\(c = ${f6(it1.b)} - \\dfrac{${f6(it1.fb)}\\,(${f6(it1.b)} - ${f6(it1.a)})}{${f6(it1.fb)} - (${f6(it1.fa)})} = ${f8(it1.c)}\\),
\\(f(c) = ${f6(it1.fc)}\\). El extremo que conserva el cambio de signo se mantiene.`)}
<p>Tabla completa (${r.rows.length} iteraciones):</p>
${table(['n', 'a', 'b', 'f(a)', 'f(b)', 'c', 'f(c)'],
        r.rows.map(row => [row.iter, f6(row.a), f6(row.b), f6(row.fa), f6(row.fb), f8(row.c), e2(row.fc)]))}
${step(`<strong>Resultado:</strong> \\(x \\approx ${f8(r.root)}\\) con \\(|f(c)| = ${e2(r.froot)}\\).`)}
`)}`;
    })();

    // ---------- 5. Punto fijo ----------
    (function () {
        const g = NM.makeFn('exp(-x)');
        const r = NM.fixedPoint(g, 0.5, 1e-6, 100);
        const it1 = r.rows[0], it2 = r.rows[1];
        T.puntofijo = `
<h2>🎯 Iteración de Punto Fijo</h2>
${section('¿Qué es y cuándo se usa?')}
<p>Reescribe \\(f(x) = 0\\) como \\(x = g(x)\\) y aplica \\(x_{n+1} = g(x_n)\\). El límite (si existe)
es un <strong>punto fijo</strong> de \\(g\\) y una raíz de \\(f\\). Se usa cuando existe un despeje
natural de \\(x\\) y como base teórica de muchos otros métodos.</p>
${section('Fórmula')}
${formula('x_{n+1} = g(x_n), \\quad n = 0, 1, 2, \\dots')}
${section('Condiciones de convergencia (teorema del punto fijo)')}
<ul>
<li>\\(g\\) continua en \\([a,b]\\) y \\(g([a,b]) \\subseteq [a,b]\\).</li>
<li>\\(|g'(x)| \\le k < 1\\) en el intervalo → convergencia lineal con razón \\(k\\).</li>
<li>Si \\(|g'(x^*)| > 1\\) el método <strong>diverge</strong> del punto fijo.</li>
</ul>
${section('Ejemplo resuelto')}
${exampleBox(`g(x) = e^(−x), x₀ = 0.5 (resuelve x = e^(−x), es decir f(x) = x·eˣ − 1 = 0)`, `
<p>Chequeo: \\(g'(x) = -e^{-x}\\), \\(|g'(0.567)| \\approx 0.567 < 1\\) → converge.</p>
${step(`<strong>Iteración 1:</strong> \\(x_1 = g(0.5) = e^{-0.5} = ${f8(it1.xn)}\\),
error \\(= |x_1 - x_0| = ${e2(it1.err)}\\)`)}
${step(`<strong>Iteración 2:</strong> \\(x_2 = g(${f8(it2.x)}) = ${f8(it2.xn)}\\),
error \\(= ${e2(it2.err)}\\)`)}
<p>Tabla completa (${r.rows.length} iteraciones):</p>
${table(['n', 'xₙ', 'xₙ₊₁ = g(xₙ)', 'error'],
        r.rows.map(row => [row.iter, f8(row.x), f8(row.xn), e2(row.err)]))}
${step(`<strong>Resultado:</strong> \\(x \\approx ${f8(r.root)}\\) (constante omega: 0.5671432904).`)}
`)}`;
    })();

    // ---------- 6. Newton-Raphson ----------
    (function () {
        const f = NM.makeFn('x^3 - x - 2');
        const fp = NM.makeFn('3*x^2 - 1');
        const r = NM.newtonRaphson(f, fp, 1.5, 1e-6, 100);
        const it1 = r.rows[0];
        T.newton = `
<h2>🚀 Newton-Raphson</h2>
${section('¿Qué es y cuándo se usa?')}
<p>Método <strong>abierto</strong> que aproxima la raíz con la recta tangente en el punto actual.
Es el método de referencia cuando se dispone de la derivada y de un buen punto inicial:
convergencia <strong>cuadrática</strong> (duplica cifras correctas por iteración).</p>
${section('Fórmula')}
${formula('x_{n+1} = x_n - \\frac{f(x_n)}{f\'(x_n)}')}
${section('Condiciones de convergencia')}
<ul>
<li>\\(f'(x^*) \\neq 0\\) (raíz simple) y \\(f''\\) continua cerca de la raíz.</li>
<li>\\(x_0\\) suficientemente cercano a la raíz; si no, puede divergir u oscilar.</li>
<li>En raíces múltiples la convergencia degrada a lineal.</li>
</ul>
${section('Ejemplo resuelto')}
${exampleBox(`f(x) = x³ − x − 2, f'(x) = 3x² − 1, x₀ = 1.5`, `
${step(`<strong>Iteración 1:</strong> \\(f(1.5) = ${f6(it1.fx)}\\), \\(f'(1.5) = ${f6(it1.fpx)}\\)<br>
\\(x_1 = 1.5 - \\dfrac{${f6(it1.fx)}}{${f6(it1.fpx)}} = ${f8(it1.xn)}\\)`)}
<p>Tabla completa (${r.rows.length} iteraciones — observa cómo el error se aplasta cuadráticamente):</p>
${table(['n', 'xₙ', 'f(xₙ)', "f'(xₙ)", 'xₙ₊₁', 'error'],
        r.rows.map(row => [row.iter, f8(row.x), e2(row.fx), f6(row.fpx), f8(row.xn), e2(row.err)]))}
${step(`<strong>Resultado:</strong> \\(x \\approx ${f8(r.root)}\\) con \\(f(x) = ${e2(r.froot)}\\)
en solo ${r.rows.length} iteraciones.`)}
`)}`;
    })();

    // ============================================================
    // CORTE II
    // ============================================================

    const A3 = [[10, -1, 2], [1, 8, -1], [2, -1, 9]];
    const b3 = [7, 8, 6];

    function sysTex() {
        return formula('\\begin{cases} 10x_1 - x_2 + 2x_3 = 7 \\\\ x_1 + 8x_2 - x_3 = 8 \\\\ 2x_1 - x_2 + 9x_3 = 6 \\end{cases}');
    }

    // ---------- 7. Jacobi ----------
    (function () {
        const r = NM.jacobi(A3, b3, [0, 0, 0], 1e-6, 100);
        const i1 = r.rows[0], i2 = r.rows[1];
        T.jacobi = `
<h2>🔢 Método de Jacobi</h2>
${section('¿Qué es y cuándo se usa?')}
<p>Método <strong>iterativo</strong> para sistemas lineales \\(A\\mathbf{x} = \\mathbf{b}\\): despeja cada
incógnita de su ecuación y calcula toda la iteración nueva usando <em>solo</em> los valores de la
iteración anterior. Útil en sistemas grandes y dispersos donde la eliminación directa es costosa.</p>
${section('Fórmula')}
${formula('x_i^{(k+1)} = \\frac{1}{a_{ii}} \\Big( b_i - \\sum_{j \\ne i} a_{ij}\\, x_j^{(k)} \\Big)')}
${section('Condiciones de convergencia')}
<ul>
<li>Suficiente: matriz <strong>estrictamente diagonal dominante</strong>: \\(|a_{ii}| > \\sum_{j\\ne i} |a_{ij}|\\) en cada fila.</li>
<li>Necesaria y suficiente: radio espectral de la matriz de iteración \\(\\rho(D^{-1}(L+U)) < 1\\).</li>
</ul>
${section('Ejemplo resuelto')}
${exampleBox('Sistema 3×3 con x⁽⁰⁾ = (0, 0, 0), tolerancia 10⁻⁶', `
${sysTex()}
<p>Dominancia diagonal: fila 1: \\(10 > 1+2\\) ✓, fila 2: \\(8 > 1+1\\) ✓, fila 3: \\(9 > 2+1\\) ✓ → converge.</p>
${step(`<strong>Iteración 1</strong> (todo con x⁽⁰⁾):<br>
\\(x_1 = \\frac{7 - (-1)(0) - 2(0)}{10} = ${f6(i1.x[0])}\\)<br>
\\(x_2 = \\frac{8 - 1(0) - (-1)(0)}{8} = ${f6(i1.x[1])}\\)<br>
\\(x_3 = \\frac{6 - 2(0) - (-1)(0)}{9} = ${f6(i1.x[2])}\\)`)}
${step(`<strong>Iteración 2</strong> (todo con x⁽¹⁾):<br>
\\(x_1 = \\frac{7 + ${f6(i1.x[1])} - 2(${f6(i1.x[2])})}{10} = ${f6(i2.x[0])}\\)<br>
\\(x_2 = \\frac{8 - ${f6(i1.x[0])} + ${f6(i1.x[2])}}{8} = ${f6(i2.x[1])}\\)<br>
\\(x_3 = \\frac{6 - 2(${f6(i1.x[0])}) + ${f6(i1.x[1])}}{9} = ${f6(i2.x[2])}\\)`)}
<p>Tabla completa (${r.rows.length} iteraciones):</p>
${table(['k', 'x₁', 'x₂', 'x₃', 'error'],
        r.rows.map(row => [row.iter, f8(row.x[0]), f8(row.x[1]), f8(row.x[2]), e2(row.err)]))}
${step(`<strong>Resultado:</strong> \\(\\mathbf{x} \\approx (${f4(r.x[0])},\\; ${f4(r.x[1])},\\; ${f4(r.x[2])})\\).`)}
`)}`;
    })();

    // ---------- 8. Gauss-Seidel ----------
    (function () {
        const r = NM.gaussSeidel(A3, b3, [0, 0, 0], 1e-6, 100);
        const i1 = r.rows[0];
        const rj = NM.jacobi(A3, b3, [0, 0, 0], 1e-6, 100);
        T.gaussseidel = `
<h2>🔁 Método de Gauss-Seidel</h2>
${section('¿Qué es y cuándo se usa?')}
<p>Variante de Jacobi que usa los valores <strong>recién calculados dentro de la misma iteración</strong>.
Con las mismas condiciones suele converger más rápido que Jacobi (aprox. la mitad de iteraciones).</p>
${section('Fórmula')}
${formula('x_i^{(k+1)} = \\frac{1}{a_{ii}} \\Big( b_i - \\sum_{j<i} a_{ij}\\, x_j^{(k+1)} - \\sum_{j>i} a_{ij}\\, x_j^{(k)} \\Big)')}
${section('Condiciones de convergencia')}
<ul>
<li>Suficiente: diagonal estrictamente dominante, o \\(A\\) simétrica definida positiva.</li>
<li>Necesaria y suficiente: \\(\\rho\\big((D+L)^{-1} U\\big) < 1\\).</li>
</ul>
${section('Ejemplo resuelto')}
${exampleBox('Mismo sistema 3×3, x⁽⁰⁾ = (0, 0, 0), tolerancia 10⁻⁶', `
${sysTex()}
${step(`<strong>Iteración 1</strong> — nota el uso inmediato de los valores nuevos:<br>
\\(x_1 = \\frac{7 - (-1)(0) - 2(0)}{10} = ${f6(i1.x[0])}\\)<br>
\\(x_2 = \\frac{8 - 1(${f6(i1.x[0])}) + 1(0)}{8} = ${f6(i1.x[1])}\\) ← usa el \\(x_1\\) nuevo<br>
\\(x_3 = \\frac{6 - 2(${f6(i1.x[0])}) + 1(${f6(i1.x[1])})}{9} = ${f6(i1.x[2])}\\) ← usa \\(x_1, x_2\\) nuevos`)}
<p>Tabla completa (${r.rows.length} iteraciones):</p>
${table(['k', 'x₁', 'x₂', 'x₃', 'error'],
        r.rows.map(row => [row.iter, f8(row.x[0]), f8(row.x[1]), f8(row.x[2]), e2(row.err)]))}
${step(`<strong>Resultado:</strong> \\(\\mathbf{x} \\approx (${f4(r.x[0])},\\; ${f4(r.x[1])},\\; ${f4(r.x[2])})\\)
en ${r.rows.length} iteraciones (Jacobi necesitó ${rj.rows.length} para la misma tolerancia).`)}
`)}`;
    })();

    // ---------- 9. SOR ----------
    (function () {
        const A2 = [[4, -1], [-1, 5]], b2 = [7, 8];
        const r = NM.sor(A2, b2, [0, 0], 1.1, 1e-6, 100);
        const rgs = NM.gaussSeidel(A2, b2, [0, 0], 1e-6, 100);
        const i1 = r.rows[0];
        T.sor = `
<h2>⚡ SOR — Relajación Sucesiva</h2>
${section('¿Qué es y cuándo se usa?')}
<p>Acelera Gauss-Seidel mezclando el valor nuevo con el anterior mediante un factor
\\(\\omega\\): <strong>sobre-relajación</strong> (\\(1 < \\omega < 2\\)) para acelerar,
<strong>sub-relajación</strong> (\\(0 < \\omega < 1\\)) para estabilizar sistemas difíciles.</p>
${section('Fórmula')}
${formula('x_i^{(k+1)} = (1-\\omega)\\, x_i^{(k)} + \\omega\\, x_i^{GS}')}
<p>donde \\(x_i^{GS}\\) es el valor que daría Gauss-Seidel. Con \\(\\omega = 1\\) se recupera Gauss-Seidel.</p>
${section('Condiciones de convergencia')}
<ul>
<li>Necesario: \\(0 < \\omega < 2\\) (teorema de Kahan).</li>
<li>Si \\(A\\) es simétrica definida positiva, converge para todo \\(\\omega \\in (0,2)\\) (Ostrowski-Reich).</li>
<li>Existe un \\(\\omega\\) óptimo que minimiza las iteraciones.</li>
</ul>
${section('Ejemplo resuelto')}
${exampleBox('A = [[4,−1],[−1,5]], b = (7, 8), ω = 1.1, x⁽⁰⁾ = (0,0), tolerancia 10⁻⁶', `
${step(`<strong>Iteración 1:</strong><br>
\\(x_1^{GS} = \\frac{7 + 1(0)}{4} = 1.75\\) → \\(x_1 = (1-1.1)(0) + 1.1(1.75) = ${f6(i1.x[0])}\\)<br>
\\(x_2^{GS} = \\frac{8 + 1(${f6(i1.x[0])})}{5}\\) → \\(x_2 = (1-1.1)(0) + 1.1\\,x_2^{GS} = ${f6(i1.x[1])}\\)`)}
<p>Tabla completa (${r.rows.length} iteraciones):</p>
${table(['k', 'x₁', 'x₂', 'error'],
        r.rows.map(row => [row.iter, f8(row.x[0]), f8(row.x[1]), e2(row.err)]))}
${step(`<strong>Resultado:</strong> \\(\\mathbf{x} \\approx (${f6(r.x[0])},\\; ${f6(r.x[1])})\\).
Gauss-Seidel puro (ω=1) tarda ${rgs.rows.length} iteraciones; con ω=1.1 tarda ${r.rows.length}.`)}
`)}`;
    })();

    // ---------- 10. Newton sistemas ----------
    (function () {
        const f1 = NM.makeFn('x*x + y*y - 4', ['x', 'y']);
        const f2 = NM.makeFn('x - y - 1', ['x', 'y']);
        const r = NM.newtonSystem([f1, f2], [1.5, 0.5], 1e-6, 50);
        const i1 = r.rows[0];
        T.newtonsistemas = `
<h2>🧮 Newton para Sistemas No Lineales</h2>
${section('¿Qué es y cuándo se usa?')}
<p>Generaliza Newton-Raphson a sistemas \\(\\mathbf{F}(\\mathbf{x}) = \\mathbf{0}\\): en cada iteración
se linealiza con la matriz <strong>Jacobiana</strong> y se resuelve un sistema lineal para la corrección.
Se usa para intersecciones de curvas, equilibrios y ecuaciones acopladas.</p>
${section('Fórmulas')}
${formula('J(\\mathbf{x}^{(k)})\\, \\Delta\\mathbf{x} = -\\mathbf{F}(\\mathbf{x}^{(k)}) \\qquad \\mathbf{x}^{(k+1)} = \\mathbf{x}^{(k)} + \\Delta\\mathbf{x}')}
${formula('J_{ij} = \\frac{\\partial f_i}{\\partial x_j}')}
${section('Condiciones de convergencia')}
<ul>
<li>\\(J\\) no singular en la solución; punto inicial cercano.</li>
<li>Convergencia cuadrática local, igual que en el caso escalar.</li>
</ul>
${section('Ejemplo resuelto')}
${exampleBox('f₁ = x² + y² − 4, f₂ = x − y − 1, (x₀,y₀) = (1.5, 0.5)', `
<p>Jacobiana analítica: \\(J = \\begin{pmatrix} 2x & 2y \\\\ 1 & -1 \\end{pmatrix}\\)
(la calculadora la aproxima numéricamente).</p>
${step(`<strong>Iteración 1:</strong> \\(F = (${f6(i1.F[0])},\\; ${f6(i1.F[1])})\\).
Se resuelve \\(J\\,\\Delta = -F\\) → \\(\\Delta = (${f6(i1.d[0])},\\; ${f6(i1.d[1])})\\)<br>
\\((x_1, y_1) = (${f8(i1.xn[0])},\\; ${f8(i1.xn[1])})\\)`)}
<p>Tabla completa (${r.rows.length} iteraciones):</p>
${table(['k', 'x', 'y', 'f₁', 'f₂', 'error'],
        r.rows.map(row => [row.iter, f8(row.x[0]), f8(row.x[1]), e2(row.F[0]), e2(row.F[1]), e2(row.err)]))}
${step(`<strong>Resultado:</strong> \\((x, y) \\approx (${f8(r.x[0])},\\; ${f8(r.x[1])})\\).
Comprobación: sobre la circunferencia x²+y²=4 y la recta y = x − 1.`)}
`)}`;
    })();

    // ---------- 11. Interpolación ----------
    (function () {
        const xs = [1, 2, 4], ys = [2, 3, 7], xv = 3;
        const dd = NM.dividedDifferences(xs, ys);
        const N = NM.newtonInterpEval(xs, dd.coefs, xv);
        const L = NM.lagrangeEval(xs, ys, xv);
        T.interpolacion = `
<h2>📐 Interpolación: Lagrange y Newton</h2>
${section('¿Qué es y cuándo se usa?')}
<p>Dado un conjunto de puntos \\((x_i, y_i)\\), construye el <strong>polinomio único de grado ≤ n−1</strong>
que pasa por todos. Se usa para estimar valores intermedios de tablas, sensores o funciones costosas.
Lagrange y Newton producen <em>el mismo polinomio</em> escrito de formas distintas.</p>
${section('Fórmulas')}
<p><strong>Lagrange:</strong></p>
${formula('P(x) = \\sum_{i=0}^{n-1} y_i\\, L_i(x), \\qquad L_i(x) = \\prod_{j \\ne i} \\frac{x - x_j}{x_i - x_j}')}
<p><strong>Newton (diferencias divididas):</strong></p>
${formula('P(x) = f[x_0] + f[x_0,x_1](x-x_0) + f[x_0,x_1,x_2](x-x_0)(x-x_1) + \\cdots')}
${formula('f[x_i, x_j] = \\frac{f[x_j] - f[x_i]}{x_j - x_i}')}
${section('Condiciones')}
<ul>
<li>Los \\(x_i\\) deben ser distintos entre sí.</li>
<li>Grados altos con nodos equiespaciados oscilan (fenómeno de Runge) — preferir pocos puntos o nodos de Chebyshev.</li>
<li>Newton permite agregar puntos sin recalcular todo.</li>
</ul>
${section('Ejemplo resuelto')}
${exampleBox('Puntos (1,2), (2,3), (4,7). Evaluar en x = 3', `
<p><strong>Newton — tabla de diferencias divididas:</strong></p>
${step(`\\(f[x_0,x_1] = \\frac{3-2}{2-1} = ${f6(dd.table[1][0])}\\qquad
f[x_1,x_2] = \\frac{7-3}{4-2} = ${f6(dd.table[1][1])}\\qquad
f[x_0,x_1,x_2] = \\frac{${f6(dd.table[1][1])} - ${f6(dd.table[1][0])}}{4-1} = ${f6(dd.table[2][0])}\\)`)}
${step(`\\(P(x) = ${f4(dd.coefs[0])} + ${f4(dd.coefs[1])}(x-1) + ${f4(dd.coefs[2])}(x-1)(x-2)\\)<br>
\\(P(3) = ${f4(dd.coefs[0])} + ${f4(dd.coefs[1])}(2) + ${f4(dd.coefs[2])}(2)(1) = ${f6(N)}\\)`)}
<p><strong>Lagrange — polinomios base en x = 3:</strong></p>
${step(L.terms.map(t =>
            `\\(L_{${t.i}}(3) = ${f6(t.L)}\\), aporte \\(y_{${t.i}} L_{${t.i}} = ${f6(t.contrib)}\\)`).join('<br>')
        + `<br>\\(P(3) = ${f6(L.P)}\\) — coincide con Newton ✓`)}
`)}`;
    })();

    // ---------- 12. Integración ----------
    (function () {
        const f = NM.makeFn('x^2 + 1');
        const a = 0, b = 2, exact = 14 / 3;
        const t = NM.trapezoid(f, a, b, 4);
        const s13 = NM.simpson13(f, a, b, 4);
        const s38 = NM.simpson38(f, a, b, 3);
        T.integracion = `
<h2>∫ Integración Numérica</h2>
${section('¿Qué es y cuándo se usa?')}
<p>Aproxima \\(\\int_a^b f(x)\\,dx\\) sumando áreas de figuras simples sobre una malla.
Se usa cuando no existe antiderivada elemental o cuando \\(f\\) solo se conoce en puntos.</p>
${section('Fórmulas (compuestas, h = (b−a)/n)')}
<p><strong>Trapecio:</strong> (error \\(O(h^2)\\))</p>
${formula('\\int_a^b f\\,dx \\approx \\frac{h}{2}\\Big[f_0 + 2\\sum_{i=1}^{n-1} f_i + f_n\\Big]')}
<p><strong>Simpson 1/3:</strong> requiere \\(n\\) par (error \\(O(h^4)\\))</p>
${formula('\\int_a^b f\\,dx \\approx \\frac{h}{3}\\Big[f_0 + 4\\!\\!\\sum_{i\\,impar}\\!\\! f_i + 2\\!\\!\\sum_{i\\,par}\\!\\! f_i + f_n\\Big]')}
<p><strong>Simpson 3/8:</strong> requiere \\(n\\) múltiplo de 3 (error \\(O(h^4)\\))</p>
${formula('\\int_a^b f\\,dx \\approx \\frac{3h}{8}\\Big[f_0 + 3(f_1 + f_2) + 2f_3 + 3(f_4+f_5) + \\cdots + f_n\\Big]')}
${section('Condiciones')}
<ul>
<li>\\(f\\) suficientemente suave para que apliquen las cotas de error.</li>
<li>Simpson 1/3: n par. Simpson 3/8: n múltiplo de 3.</li>
</ul>
${section('Ejemplo resuelto')}
${exampleBox('∫₀² (x² + 1) dx = 14/3 ≈ 4.66667', `
<p><strong>Trapecio con n = 4</strong> (h = ${f4(t.h)}):</p>
${table(['i', 'xᵢ', 'f(xᵢ)', 'peso'], t.xs.map((x, i) =>
            [i, f4(x), f6(t.fs[i]), i === 0 || i === 4 ? 1 : 2]))}
${step(`\\(I_T = \\frac{${f4(t.h)}}{2}\\big[${f4(t.fs[0])} + 2(${f4(t.fs[1])} + ${f4(t.fs[2])} + ${f4(t.fs[3])}) + ${f4(t.fs[4])}\\big] = ${f8(t.I)}\\)
— error real: ${e2(Math.abs(t.I - exact))}`)}
<p><strong>Simpson 1/3 con n = 4:</strong> pesos 1, 4, 2, 4, 1</p>
${step(`\\(I_S = \\frac{${f4(s13.h)}}{3}\\big[${f4(s13.fs[0])} + 4(${f4(s13.fs[1])}) + 2(${f4(s13.fs[2])}) + 4(${f4(s13.fs[3])}) + ${f4(s13.fs[4])}\\big] = ${f8(s13.I)}\\)
— error: ${e2(Math.abs(s13.I - exact))} (exacto para polinomios de grado ≤ 3)`)}
<p><strong>Simpson 3/8 con n = 3:</strong> pesos 1, 3, 3, 1</p>
${step(`\\(I_{3/8} = \\frac{3(${f4(s38.h)})}{8}\\big[${f4(s38.fs[0])} + 3(${f4(s38.fs[1])}) + 3(${f4(s38.fs[2])}) + ${f4(s38.fs[3])}\\big] = ${f8(s38.I)}\\)
— error: ${e2(Math.abs(s38.I - exact))}`)}
`)}`;
    })();

    // ============================================================
    // CORTE III
    // ============================================================

    // ---------- 13. Diferenciación ----------
    (function () {
        const f = NM.makeFn('x^2');
        const x0 = 1, h = 0.1, exact = 2;
        const p = NM.diffForward(f, x0, h);
        const rg = NM.diffBackward(f, x0, h);
        const c = NM.diffCentral(f, x0, h);
        T.diferenciacion = `
<h2>∂ Diferenciación Numérica</h2>
${section('¿Qué es y cuándo se usa?')}
<p>Aproxima \\(f'(x_0)\\) con cocientes de diferencias sobre puntos cercanos. Se usa cuando
\\(f\\) solo se conoce en datos discretos o su derivada analítica es inmanejable.</p>
${section('Fórmulas')}
${formula("f'(x_0) \\approx \\frac{f(x_0+h) - f(x_0)}{h} \\quad \\text{(progresiva, } O(h))")}
${formula("f'(x_0) \\approx \\frac{f(x_0) - f(x_0-h)}{h} \\quad \\text{(regresiva, } O(h))")}
${formula("f'(x_0) \\approx \\frac{f(x_0+h) - f(x_0-h)}{2h} \\quad \\text{(centrada, } O(h^2))")}
${section('Condiciones')}
<ul>
<li>La centrada es un orden mejor: divide h a la mitad y su error cae ×4.</li>
<li>h demasiado pequeño amplifica error de redondeo (cancelación catastrófica): existe un h óptimo.</li>
</ul>
${section('Ejemplo resuelto')}
${exampleBox("f(x) = x², x₀ = 1, h = 0.1 (valor exacto f'(1) = 2)", `
${step(`<strong>Evaluaciones:</strong> \\(f(1.1) = ${f6(f(1.1))}\\), \\(f(1) = ${f6(f(1))}\\), \\(f(0.9) = ${f6(f(0.9))}\\)`)}
${step(`<strong>Progresiva:</strong> \\(\\frac{${f6(f(1.1))} - ${f6(f(1))}}{0.1} = ${f6(p)}\\) — error ${e2(Math.abs(p - exact))}`)}
${step(`<strong>Regresiva:</strong> \\(\\frac{${f6(f(1))} - ${f6(f(0.9))}}{0.1} = ${f6(rg)}\\) — error ${e2(Math.abs(rg - exact))}`)}
${step(`<strong>Centrada:</strong> \\(\\frac{${f6(f(1.1))} - ${f6(f(0.9))}}{0.2} = ${f6(c)}\\) — error ${e2(Math.abs(c - exact))}
(exacta aquí porque x² es cuadrática)`)}
`)}`;
    })();

    // ---------- 14. Segunda derivada ----------
    (function () {
        const f = NM.makeFn('x^3');
        const x0 = 1, h = 0.1, exact = 6;
        const d2 = NM.diffSecond(f, x0, h);
        T.segundaderivada = `
<h2>∂² Segunda Derivada Numérica</h2>
${section('¿Qué es y cuándo se usa?')}
<p>Aproxima \\(f''(x_0)\\) combinando tres evaluaciones. Aparece al discretizar ecuaciones
diferenciales (calor, onda, Poisson) y al estudiar curvatura de datos.</p>
${section('Fórmula (centrada, error O(h²))')}
${formula("f''(x_0) \\approx \\frac{f(x_0+h) - 2f(x_0) + f(x_0-h)}{h^2}")}
${section('Condiciones')}
<ul>
<li>\\(f\\) cuatro veces diferenciable para la cota \\(O(h^2)\\).</li>
<li>Muy sensible al redondeo: divide por \\(h^2\\).</li>
</ul>
${section('Ejemplo resuelto')}
${exampleBox("f(x) = x³, x₀ = 1, h = 0.1 (valor exacto f''(1) = 6)", `
${step(`<strong>Paso 1:</strong> \\(f(1.1) = ${f6(f(1.1))}\\), \\(f(1) = ${f6(f(1))}\\), \\(f(0.9) = ${f6(f(0.9))}\\)`)}
${step(`<strong>Paso 2:</strong> numerador \\(= ${f6(f(1.1))} - 2(${f6(f(1))}) + ${f6(f(0.9))} = ${f6(f(1.1) - 2 * f(1) + f(0.9))}\\)`)}
${step(`<strong>Paso 3:</strong> \\(f''(1) \\approx \\frac{${f6(f(1.1) - 2 * f(1) + f(0.9))}}{0.01} = ${f6(d2)}\\)
— error ${e2(Math.abs(d2 - exact))}`)}
`)}`;
    })();

    // ---------- 15. Richardson ----------
    (function () {
        const Dh = 0.995, Dh2 = 0.99875, p = 2, exact = 1;
        const DR = NM.richardson(Dh, Dh2, p);
        T.richardson = `
<h2>🎚️ Extrapolación de Richardson</h2>
${section('¿Qué es y cuándo se usa?')}
<p>Combina dos aproximaciones del mismo valor calculadas con pasos \\(h\\) y \\(h/2\\) para
<strong>cancelar el término dominante del error</strong> y ganar dos órdenes de precisión sin
evaluar con paso más fino. Base del método de Romberg.</p>
${section('Fórmula')}
${formula('D_R = \\frac{2^p\\, D(h/2) - D(h)}{2^p - 1}')}
<p>donde \\(p\\) es el orden del error de la fórmula base (p. ej. \\(p=2\\) para la derivada centrada).</p>
${section('Condiciones')}
<ul>
<li>El error debe admitir desarrollo \\(D(h) = D + c\\,h^p + O(h^{p+2})\\) con \\(c\\) estable.</li>
<li>Requiere conocer \\(p\\) correctamente.</li>
</ul>
${section('Ejemplo resuelto')}
${exampleBox('D(h) = 0.995, D(h/2) = 0.99875, p = 2 (valor exacto 1)', `
${step(`<strong>Paso 1:</strong> \\(2^p = 4\\)`)}
${step(`<strong>Paso 2:</strong> \\(D_R = \\frac{4(0.99875) - 0.995}{4 - 1} = \\frac{${f6(4 * Dh2 - Dh)}}{3} = ${DR.toFixed(10)}\\)`)}
${step(`<strong>Comparación de errores:</strong> \\(|D(h) - 1| = ${e2(Math.abs(Dh - exact))}\\),
\\(|D(h/2) - 1| = ${e2(Math.abs(Dh2 - exact))}\\), \\(|D_R - 1| = ${e2(Math.abs(DR - exact))}\\)
— la extrapolación elimina el término \\(h^2\\) completo.`)}
`)}`;
    })();

    // ---------- 16. Euler ----------
    (function () {
        const f = NM.makeFn('x + y', ['x', 'y']);
        const ex = NM.makeFn('2*exp(x) - x - 1');
        const r = NM.euler(f, 0, 1, 0.1, 5);
        const i1 = r.rows[1];
        T.euler = `
<h2>📈 Método de Euler (EDO)</h2>
${section('¿Qué es y cuándo se usa?')}
<p>El método más simple para el problema de valor inicial \\(y' = f(x,y),\\; y(x_0) = y_0\\):
avanza en línea recta con la pendiente del punto actual. Se usa como introducción y como
bloque básico; en la práctica se prefieren RK de mayor orden.</p>
${section('Fórmula')}
${formula('y_{n+1} = y_n + h\\, f(x_n, y_n)')}
${section('Condiciones')}
<ul>
<li>\\(f\\) Lipschitz en y → existencia/unicidad y convergencia.</li>
<li>Error local \\(O(h^2)\\), global \\(O(h)\\): para una cifra más de precisión, h 10 veces menor.</li>
<li>Problemas rígidos exigen h minúsculo (inestabilidad).</li>
</ul>
${section('Ejemplo resuelto')}
${exampleBox("y' = x + y, y(0) = 1, h = 0.1, 5 pasos. Solución exacta y = 2eˣ − x − 1", `
${step(`<strong>Paso 1:</strong> pendiente \\(f(0, 1) = 0 + 1 = ${f6(i1.slope)}\\)<br>
\\(y_1 = 1 + 0.1(${f6(i1.slope)}) = ${f6(i1.y)}\\), en \\(x_1 = 0.1\\)`)}
<p>Tabla completa:</p>
${table(['n', 'xₙ', 'yₙ (Euler)', 'y exacta', 'error'],
        r.rows.map(row => [row.i, f4(row.x), f8(row.y), f8(ex(row.x)), e2(Math.abs(row.y - ex(row.x)))]))}
${step(`<strong>Resultado:</strong> \\(y(0.5) \\approx ${f8(r.y)}\\) vs exacto \\(${f8(ex(0.5))}\\).
El error crece con x — típico del orden 1.`)}
`)}`;
    })();

    // ---------- 17. RK2 ----------
    (function () {
        const f = NM.makeFn('x + y', ['x', 'y']);
        const ex = NM.makeFn('2*exp(x) - x - 1');
        const r = NM.rk2(f, 0, 1, 0.1, 5);
        const i1 = r.rows[1];
        T.rk2 = `
<h2>📊 Runge-Kutta 2 (Heun)</h2>
${section('¿Qué es y cuándo se usa?')}
<p>Mejora Euler promediando la pendiente al inicio y una <strong>pendiente predicha al final</strong>
del paso (predictor-corrector). Orden 2: buen equilibrio entre costo (2 evaluaciones) y precisión.</p>
${section('Fórmulas')}
${formula('k_1 = f(x_n, y_n) \\qquad k_2 = f(x_n + h,\\; y_n + h\\,k_1)')}
${formula('y_{n+1} = y_n + \\frac{h}{2}(k_1 + k_2)')}
${section('Condiciones')}
<ul>
<li>Error local \\(O(h^3)\\), global \\(O(h^2)\\).</li>
<li>Mismas hipótesis de suavidad que Euler.</li>
</ul>
${section('Ejemplo resuelto')}
${exampleBox("y' = x + y, y(0) = 1, h = 0.1, 5 pasos", `
${step(`<strong>Paso 1:</strong><br>
\\(k_1 = f(0, 1) = ${f6(i1.k1)}\\)<br>
\\(k_2 = f(0.1,\\; 1 + 0.1(${f6(i1.k1)})) = ${f6(i1.k2)}\\)<br>
\\(y_1 = 1 + \\frac{0.1}{2}(${f6(i1.k1)} + ${f6(i1.k2)}) = ${f8(i1.y)}\\)`)}
<p>Tabla completa:</p>
${table(['n', 'xₙ', 'k₁', 'k₂', 'yₙ', 'error'],
        r.rows.map(row => [row.i, f4(row.x),
            row.k1 !== undefined ? f6(row.k1) : '—',
            row.k2 !== undefined ? f6(row.k2) : '—',
            f8(row.y), e2(Math.abs(row.y - ex(row.x)))]))}
${step(`<strong>Resultado:</strong> \\(y(0.5) \\approx ${f8(r.y)}\\) vs exacto \\(${f8(ex(0.5))}\\)
— dos órdenes de magnitud mejor que Euler con el mismo h.`)}
`)}`;
    })();

    // ---------- 18. RK4 ----------
    (function () {
        const f = NM.makeFn('y', ['x', 'y']);
        const r = NM.rk4(f, 0, 1, 0.1, 10);
        const i1 = r.rows[1];
        T.rk4 = `
<h2>🏆 Runge-Kutta 4</h2>
${section('¿Qué es y cuándo se usa?')}
<p>El caballo de batalla para EDOs no rígidas: cuatro evaluaciones de pendiente por paso,
promediadas con pesos 1-2-2-1. Orden 4 global — precisión excelente con h moderado.</p>
${section('Fórmulas')}
${formula('k_1 = f(x_n, y_n) \\qquad k_2 = f\\big(x_n + \\tfrac{h}{2},\\; y_n + \\tfrac{h}{2} k_1\\big)')}
${formula('k_3 = f\\big(x_n + \\tfrac{h}{2},\\; y_n + \\tfrac{h}{2} k_2\\big) \\qquad k_4 = f(x_n + h,\\; y_n + h\\,k_3)')}
${formula('y_{n+1} = y_n + \\frac{h}{6}\\big(k_1 + 2k_2 + 2k_3 + k_4\\big)')}
${section('Condiciones')}
<ul>
<li>Error local \\(O(h^5)\\), global \\(O(h^4)\\): dividir h entre 2 reduce el error ×16.</li>
<li>Para sistemas rígidos usar métodos implícitos.</li>
</ul>
${section('Ejemplo resuelto')}
${exampleBox("y' = y, y(0) = 1, h = 0.1, 10 pasos → y(1) debe dar e ≈ 2.718281828", `
${step(`<strong>Paso 1:</strong><br>
\\(k_1 = f(0,1) = ${f6(i1.k1)}\\)<br>
\\(k_2 = f(0.05,\\; 1 + 0.05(${f6(i1.k1)})) = ${f6(i1.k2)}\\)<br>
\\(k_3 = f(0.05,\\; 1 + 0.05(${f6(i1.k2)})) = ${f6(i1.k3)}\\)<br>
\\(k_4 = f(0.1,\\; 1 + 0.1(${f6(i1.k3)})) = ${f6(i1.k4)}\\)<br>
\\(y_1 = 1 + \\frac{0.1}{6}\\big(${f6(i1.k1)} + 2(${f6(i1.k2)}) + 2(${f6(i1.k3)}) + ${f6(i1.k4)}\\big) = ${f8(i1.y)}\\)`)}
<p>Tabla completa:</p>
${table(['n', 'xₙ', 'yₙ', 'eˣ exacto', 'error'],
        r.rows.map(row => [row.i, f4(row.x), f8(row.y), f8(Math.exp(row.x)), e2(Math.abs(row.y - Math.exp(row.x)))]))}
${step(`<strong>Resultado:</strong> \\(y(1) = ${f8(r.y)}\\) vs \\(e = ${f8(Math.E)}\\)
— error de solo ${e2(Math.abs(r.y - Math.E))} con h = 0.1.`)}
`)}`;
    })();

    // ---------- 19. Sistemas de EDO ----------
    (function () {
        const f0 = NM.makeFn('y1', ['x', 'y0', 'y1']);
        const f1 = NM.makeFn('-y0', ['x', 'y0', 'y1']);
        const r = NM.rk4System([f0, f1], 0, [1, 0], 0.1, 5);
        T.sistemasedo = `
<h2>🔗 Sistemas de EDO (RK4 vectorial)</h2>
${section('¿Qué es y cuándo se usa?')}
<p>Los métodos de un paso se aplican <strong>componente a componente</strong> a
\\(\\mathbf{y}' = \\mathbf{F}(x, \\mathbf{y})\\). Cualquier EDO de orden superior se convierte en
sistema de primer orden (p. ej. \\(y'' = -y\\) → \\(y_0' = y_1,\\; y_1' = -y_0\\)).
Modelan osciladores, circuitos, poblaciones acopladas.</p>
${section('Fórmulas')}
${formula('\\mathbf{k}_1 = \\mathbf{F}(x_n, \\mathbf{y}_n) \\qquad \\mathbf{k}_2 = \\mathbf{F}\\big(x_n + \\tfrac{h}{2},\\; \\mathbf{y}_n + \\tfrac{h}{2}\\mathbf{k}_1\\big) \\;\\cdots')}
${formula('\\mathbf{y}_{n+1} = \\mathbf{y}_n + \\frac{h}{6}\\big(\\mathbf{k}_1 + 2\\mathbf{k}_2 + 2\\mathbf{k}_3 + \\mathbf{k}_4\\big)')}
<p>Todos los \\(k_i\\) son <strong>vectores</strong>: cada etapa evalúa todas las ecuaciones.</p>
${section('Condiciones')}
<ul>
<li>Las mismas de RK4, aplicadas al sistema completo.</li>
<li>El paso h lo dicta la componente más rápida del sistema.</li>
</ul>
${section('Ejemplo resuelto')}
${exampleBox("y₀' = y₁, y₁' = −y₀, y₀(0)=1, y₁(0)=0, h = 0.1 (oscilador: y₀ = cos x, y₁ = −sin x)", `
<p>Tabla de los primeros 5 pasos comparada con la solución exacta:</p>
${table(['n', 'x', 'y₀ (RK4)', 'cos x', 'y₁ (RK4)', '−sin x', 'error máx'],
        r.rows.map(row => [row.i, f4(row.x), f8(row.ys[0]), f8(Math.cos(row.x)),
            f8(row.ys[1]), f8(-Math.sin(row.x)),
            e2(Math.max(Math.abs(row.ys[0] - Math.cos(row.x)), Math.abs(row.ys[1] + Math.sin(row.x))))]))}
${step(`<strong>Resultado:</strong> en \\(x = 0.5\\): \\(y_0 = ${f8(r.ys[0])}\\) vs \\(\\cos 0.5 = ${f8(Math.cos(0.5))}\\).
La trayectoria en el plano \\((y_0, y_1)\\) es una circunferencia — RK4 la conserva casi exactamente.`)}
`)}`;
    })();

    // ---------- export / attach ----------
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { THEORY: T };
    } else {
        root.THEORY = T;
        if (root.topics) {
            root.topics.forEach(topic => { if (T[topic.id]) topic.theory = T[topic.id]; });
        }
    }
})(typeof self !== 'undefined' ? self : this);
