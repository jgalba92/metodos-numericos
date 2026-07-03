// data.js - Teoría y calculadoras con explicaciones didácticas

const topics = [{
    id: 'errores',
    icon: '📊',
    title: 'Errores Numéricos',
    description: 'Absoluto, relativo, redondeo y truncamiento.',
    theory: `
        <h2>Errores Numéricos</h2>
        <div class="explanation">
            <p>Cuando trabajamos con números reales en una computadora, casi siempre debemos aproximarlos porque no podemos almacenar infinitos decimales. <strong>El error numérico</strong> es la diferencia entre el valor exacto (matemático) y el valor que realmente usamos (aproximado).</p>
            <p>Hay dos tipos principales:</p>
            <ul>
                <li><strong>Error absoluto:</strong> cuánto nos equivocamos en unidades. Se calcula como $E_a = |x - \\tilde{x}|$.</li>
                <li><strong>Error relativo:</strong> qué tan grande es ese error comparado con el valor real. Es adimensional y se calcula como $E_r = \\frac{E_a}{|x|}$ (si $x \\neq 0$). Multiplicando por 100 obtenemos el error porcentual.</li>
            </ul>
            <p>El error relativo es más útil para comparar la precisión de mediciones de diferente magnitud.</p>
        </div>
        <div class="formula">$$E_a = |x - \\tilde{x}|$$</div>
        <div class="formula">$$E_r = \\frac{E_a}{|x|}, \\quad x \\neq 0$$</div>
        <div class="formula">$$E_r\\% = 100 \\cdot E_r$$</div>
        <div class="example-box">
            <h4>📘 Ejemplo 2.1 (Guía 1 Corte I)</h4>
            <p>Sea $x = 12.78436$. Aproximar a 4 cifras decimales:</p>
            <p><strong>Truncamiento:</strong> eliminamos los decimales que sobran: $\\tilde{x}_t = 12.7843$. El error absoluto es $E_a = |12.78436 - 12.7843| = 0.00006$.</p>
            <p><strong>Redondeo:</strong> miramos el quinto decimal (6) y subimos el cuarto: $\\tilde{x}_r = 12.7844$. El error absoluto es $E_a = |12.78436 - 12.7844| = 0.00004$.</p>
            <p>En este caso, el redondeo da una mejor aproximación.</p>
        </div>
        <div class="example-box">
            <h4>📘 Ejemplo 2.2 (Guía 1 Corte I)</h4>
            <p>Una pieza mide exactamente $3.141592$ cm, pero la registramos como $3.142$ cm.</p>
            <p>Error absoluto: $E_a = |3.141592 - 3.142| = 0.000408$ cm.</p>
            <p>Error relativo: $E_r = \\frac{0.000408}{3.141592} \\approx 1.2987 \\times 10^{-4}$.</p>
            <p>Error porcentual: $E_r\\% = 0.012987\\%$.</p>
            <p>Esto significa que nuestro error es del $0.013\\%$ del valor real.</p>
        </div>
    `,
    calcFields: [
        { id: 'err-exact', label: 'Valor exacto (x)', type: 'number', default: 87.245 },
        { id: 'err-aprox', label: 'Valor aprox. (x̃)', type: 'number', default: 87.19 },
        { id: 'err-dec', label: 'Decimales', type: 'number', default: 6, min: 1, max: 15 }
    ],
    calcHelp: 'Ingrese el valor exacto y el aproximado para calcular el error absoluto, relativo y porcentual.',
    calculate: function(values) {
        const xe = parseFloat(values['err-exact']);
        const xa = parseFloat(values['err-aprox']);
        const dec = parseInt(values['err-dec']);
        if (isNaN(xe) || isNaN(xa)) return 'Ingrese valores válidos.';
        if (xe === 0) return 'El valor exacto no puede ser cero.';
        const ea = Math.abs(xe - xa);
        const er = ea / Math.abs(xe);
        const ep = er * 100;
        return `
            <div class="metric-row">
                <div class="metric"><span class="label">Error absoluto</span><span class="value">${ea.toFixed(dec)}</span></div>
                <div class="metric"><span class="label">Error relativo</span><span class="value">${er.toFixed(dec)}</span></div>
                <div class="metric"><span class="label">Error relativo %</span><span class="value">${ep.toFixed(dec)}%</span></div>
            </div>
            <div class="step"><strong>Paso 1:</strong> Calculamos el error absoluto: $E_a = |${xe} - ${xa}| = ${ea.toFixed(dec)}$</div>
            <div class="step"><strong>Paso 2:</strong> Dividimos por el valor exacto: $E_r = \\frac{${ea.toFixed(dec)}}{|${xe}|} = ${er.toFixed(dec)}$</div>
            <div class="step"><strong>Paso 3:</strong> Multiplicamos por 100: $E_r\\% = 100 \\cdot ${er.toFixed(dec)} = ${ep.toFixed(dec)}\\%$</div>
            <p><strong>Interpretación:</strong> La aproximación difiere en <strong>${ea.toFixed(dec)}</strong> unidades, lo que representa el <strong>${ep.toFixed(dec)}%</strong> del valor real.</p>
        `;
    }
}, {
    id: 'biseccion',
    icon: '✂️',
    title: 'Bisección',
    description: 'Método cerrado para hallar raíces.',
    theory: `
        <h2>Método de Bisección</h2>
        <div class="explanation">
            <p>El método de bisección es el más sencillo para encontrar raíces de ecuaciones no lineales. Se basa en el <strong>teorema del valor intermedio</strong>: si una función continua $f$ cambia de signo en un intervalo $[a,b]$ (es decir, $f(a) \\cdot f(b) < 0$), entonces existe al menos una raíz en ese intervalo.</p>
            <p>El algoritmo consiste en:</p>
            <ol>
                <li>Calcular el punto medio $c = \\frac{a+b}{2}$.</li>
                <li>Evaluar $f(c)$.</li>
                <li>Si $f(a) \\cdot f(c) < 0$, la raíz está en $[a,c]$; si no, está en $[c,b]$.</li>
                <li>Repetir hasta que el intervalo sea suficientemente pequeño.</li>
            </ol>
            <p>La ventaja principal es que <strong>siempre converge</strong> (si se cumplen las hipótesis). La desventaja es que es lento: cada iteración reduce el error a la mitad.</p>
        </div>
        <div class="formula">$$c = \\frac{a+b}{2}$$</div>
        <div class="example-box">
            <h4>📘 Ejemplo 4.1 (Guía 1 Corte I, pág. 6)</h4>
            <p>Encontrar una raíz de $f(x) = x^3 - 4x - 9$ en el intervalo $[2,3]$.</p>
            <p>Verificamos el cambio de signo: $f(2) = -9$, $f(3) = 6$, así que hay una raíz.</p>
            <table>
                <thead><tr><th>Iter</th><th>a</th><th>b</th><th>c</th><th>f(c)</th></tr></thead>
                <tbody>
                    <tr><td>0</td><td>2.0000</td><td>3.0000</td><td>2.5000</td><td>-3.3750</td></tr>
                    <tr><td>1</td><td>2.5000</td><td>3.0000</td><td>2.7500</td><td>-0.2031</td></tr>
                    <tr><td>2</td><td>2.7500</td><td>3.0000</td><td>2.8750</td><td>2.2637</td></tr>
                    <tr><td>3</td><td>2.7500</td><td>2.8750</td><td>2.8125</td><td>0.9856</td></tr>
                </tbody>
            </table>
            <p>Después de 4 iteraciones, la raíz aproximada es $x \\approx 2.78125$. El error máximo posible es $(3-2)/2^4 = 0.0625$.</p>
        </div>
    `,
    calcFields: [
        { id: 'bis-f', label: 'f(x)', type: 'text', default: 'x*x*x - 4*x - 9' },
        { id: 'bis-a', label: 'a', type: 'number', default: 2 },
        { id: 'bis-b', label: 'b', type: 'number', default: 3 },
        { id: 'bis-tol', label: 'Tolerancia', type: 'number', default: 1e-6 },
        { id: 'bis-max', label: 'Max iter.', type: 'number', default: 50 }
    ],
    calcHelp: 'Ingrese f(x) y el intervalo [a,b] con cambio de signo. Se aplicará bisección.',
    calculate: function(values) {
        try {
            const f = new Function('x', `return (${values['bis-f']})`);
            let a = parseFloat(values['bis-a']), b = parseFloat(values['bis-b']);
            const tol = parseFloat(values['bis-tol']), maxIter = parseInt(values['bis-max']);
            if (f(a) * f(b) >= 0) return 'No hay cambio de signo en el intervalo.';
            let tabla = [];
            for (let i = 0; i < maxIter; i++) {
                let c = (a + b) / 2, fc = f(c);
                tabla.push({ iter: i + 1, a, b, c, fc, error: (b - a) / 2 });
                if (Math.abs(fc) < tol || (b - a) / 2 < tol) break;
                if (f(a) * fc < 0) b = c;
                else a = c;
            }
            const last = tabla[tabla.length - 1];
            let html = `
                <div class="metric-row">
                    <div class="metric"><span class="label">Aprox.</span><span class="value">${last.c.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">f(c)</span><span class="value">${last.fc.toExponential(2)}</span></div>
                    <div class="metric"><span class="label">Error</span><span class="value">${last.error.toExponential(2)}</span></div>
                </div>
                <table>
                    <thead><tr><th>Iter</th><th>a</th><th>b</th><th>c</th><th>f(c)</th><th>Error</th></tr></thead>
                    <tbody>
                        ${tabla.map(r => `<tr><td>${r.iter}</td><td>${r.a.toFixed(6)}</td><td>${r.b.toFixed(6)}</td><td>${r.c.toFixed(8)}</td><td>${r.fc.toExponential(2)}</td><td>${r.error.toExponential(2)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> En cada iteración se calcula el punto medio y se evalúa la función. Luego se descarta la mitad del intervalo que no contiene la raíz (usando el signo de $f$).</div>
            `;
            return html;
        } catch (e) { return `Error: ${e.message}`; }
    }
}, {
    id: 'reglafalsa',
    icon: '📏',
    title: 'Regla Falsa',
    description: 'Regula falsi, secante en lugar de punto medio.',
    theory: `
        <h2>Regla Falsa (Regula Falsi)</h2>
        <div class="explanation">
            <p>La regla falsa es similar a la bisección, pero en lugar de usar el punto medio, usa la <strong>intersección de la recta secante</strong> que une los puntos $(a, f(a))$ y $(b, f(b))$ con el eje $x$. Esto da una aproximación más rápida cuando la función es casi lineal.</p>
            <p>La fórmula es:</p>
            <p>$$c = b - \\frac{f(b)(b-a)}{f(b)-f(a)}$$</p>
            <p>Luego se reemplaza el extremo que mantiene el signo, igual que en bisección.</p>
            <p>La ventaja es que suele converger más rápido que bisección. La desventaja es que puede estancarse si un extremo permanece fijo por muchas iteraciones.</p>
        </div>
        <div class="example-box">
            <h4>📘 Ejemplo 5.1 (Guía 1 Corte I, pág. 8)</h4>
            <p>Para $f(x) = x^3 - 4x - 9$ en $[2,3]$: $f(2) = -9$, $f(3) = 6$.</p>
            <p>$c_0 = 3 - \\frac{6(3-2)}{6 - (-9)} = 3 - \\frac{6}{15} = 2.6$.</p>
            <p>$f(2.6) = -1.824$, como $f(2)f(2.6) > 0$, el nuevo intervalo es $[2.6, 3]$.</p>
            <p>$c_1 = 3 - \\frac{6(0.4)}{6 - (-1.824)} \\approx 2.6933$.</p>
            <p>En dos iteraciones ya tenemos una mejor aproximación que con bisección.</p>
        </div>
    `,
    calcFields: [
        { id: 'rf-f', label: 'f(x)', type: 'text', default: 'x*x*x - 4*x - 9' },
        { id: 'rf-a', label: 'a', type: 'number', default: 2 },
        { id: 'rf-b', label: 'b', type: 'number', default: 3 },
        { id: 'rf-tol', label: 'Tolerancia', type: 'number', default: 1e-6 },
        { id: 'rf-max', label: 'Max iter.', type: 'number', default: 50 }
    ],
    calcHelp: 'Ingrese f(x) y el intervalo [a,b] con cambio de signo. Se aplicará regla falsa.',
    calculate: function(values) {
        try {
            const f = new Function('x', `return (${values['rf-f']})`);
            let a = parseFloat(values['rf-a']), b = parseFloat(values['rf-b']);
            const tol = parseFloat(values['rf-tol']), maxIter = parseInt(values['rf-max']);
            if (f(a) * f(b) >= 0) return 'No hay cambio de signo.';
            let tabla = [];
            for (let i = 0; i < maxIter; i++) {
                let fa = f(a), fb = f(b);
                let c = b - fb * (b - a) / (fb - fa);
                let fc = f(c);
                tabla.push({ iter: i + 1, a, b, c, fc });
                if (Math.abs(fc) < tol) break;
                if (f(a) * fc < 0) b = c;
                else a = c;
            }
            const last = tabla[tabla.length - 1];
            return `
                <div class="metric-row">
                    <div class="metric"><span class="label">Aprox.</span><span class="value">${last.c.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">f(c)</span><span class="value">${last.fc.toExponential(2)}</span></div>
                </div>
                <table>
                    <thead><tr><th>Iter</th><th>a</th><th>b</th><th>c</th><th>f(c)</th></tr></thead>
                    <tbody>
                        ${tabla.map(r => `<tr><td>${r.iter}</td><td>${r.a.toFixed(6)}</td><td>${r.b.toFixed(6)}</td><td>${r.c.toFixed(8)}</td><td>${r.fc.toExponential(2)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Se calcula la intersección de la recta secante con el eje $x$. Luego se actualiza el intervalo según el signo de $f$.</div>
            `;
        } catch (e) { return `Error: ${e.message}`; }
    }
}, {
    id: 'puntofijo',
    icon: '🎯',
    title: 'Punto Fijo',
    description: 'Iteración x = g(x).',
    theory: `
        <h2>Método de Punto Fijo</h2>
        <div class="explanation">
            <p>El método de punto fijo transforma la ecuación $f(x)=0$ en una equivalente de la forma $x = g(x)$. Luego se itera: $x_{n+1} = g(x_n)$.</p>
            <p>La idea es que si la sucesión converge a un valor $r$, entonces $r = g(r)$, es decir, $r$ es un punto fijo de $g$ y raíz de $f$.</p>
            <p><strong>Condición de convergencia:</strong> Si $g$ es continua y $|g'(x)| < 1$ en un entorno de la raíz, la iteración converge. Si $|g'(x)| > 1$, diverge.</p>
            <p>La elección de $g$ es clave: no todas las reescrituras sirven.</p>
        </div>
        <div class="example-box">
            <h4>📘 Ejemplo 2.1 (Guía 2 Corte I, pág. 2)</h4>
            <p>Resolver $x^3 + x - 1 = 0$. Una forma posible es $g(x) = \\sqrt[3]{1-x}$.</p>
            <p>Con $x_0 = 0.5$:</p>
            <p>$x_1 = \\sqrt[3]{0.5} \\approx 0.7937$</p>
            <p>$x_2 = \\sqrt[3]{0.2063} \\approx 0.5907$</p>
            <p>$x_3 = \\sqrt[3]{0.4093} \\approx 0.7425$</p>
            <p>La sucesión oscila pero se acerca a la raíz (que está alrededor de 0.6823). Si elegimos otra $g$, como $g(x) = 1 - x^3$, también funciona.</p>
        </div>
    `,
    calcFields: [
        { id: 'pf-g', label: 'g(x)', type: 'text', default: 'Math.cbrt(1-x)' },
        { id: 'pf-x0', label: 'x₀', type: 'number', default: 0.5 },
        { id: 'pf-tol', label: 'Tolerancia', type: 'number', default: 1e-6 },
        { id: 'pf-max', label: 'Max iter.', type: 'number', default: 50 }
    ],
    calculate: function(values) {
        try {
            const g = new Function('x', `return (${values['pf-g']})`);
            let x = parseFloat(values['pf-x0']);
            const tol = parseFloat(values['pf-tol']), maxIter = parseInt(values['pf-max']);
            let tabla = [];
            for (let i = 0; i < maxIter; i++) {
                let xn = g(x);
                tabla.push({ iter: i + 1, x_ant: x, x_nuevo: xn, error: Math.abs(xn - x) });
                if (Math.abs(xn - x) < tol) break;
                x = xn;
            }
            const last = tabla[tabla.length - 1];
            return `
                <div class="metric-row">
                    <div class="metric"><span class="label">Aprox.</span><span class="value">${last.x_nuevo.toFixed(8)}</span></div>
                </div>
                <table>
                    <thead><tr><th>Iter</th><th>xₙ</th><th>xₙ₊₁</th><th>Error</th></tr></thead>
                    <tbody>
                        ${tabla.map(r => `<tr><td>${r.iter}</td><td>${r.x_ant.toFixed(8)}</td><td>${r.x_nuevo.toFixed(8)}</td><td>${r.error.toExponential(2)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> En cada iteración se evalúa $g$ en el valor actual y se actualiza $x$.</div>
            `;
        } catch (e) { return `Error: ${e.message}`; }
    }
}, {
    id: 'newton',
    icon: '🚀',
    title: 'Newton-Raphson',
    description: 'Método abierto de convergencia cuadrática.',
    theory: `
        <h2>Newton-Raphson</h2>
        <div class="explanation">
            <p>Newton-Raphson es uno de los métodos más poderosos para encontrar raíces. Se basa en la <strong>recta tangente</strong> a la curva $f(x)$ en un punto $x_n$.</p>
            <p>La idea es: donde la tangente corta al eje $x$, ahí estará la nueva aproximación. La fórmula se obtiene igualando la ecuación de la tangente a cero:</p>
            <p>$$f'(x_n)(x_{n+1} - x_n) + f(x_n) = 0 \\Rightarrow x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$$</p>
            <p><strong>Ventaja:</strong> convergencia cuadrática (el número de cifras correctas se duplica en cada iteración).</p>
            <p><strong>Desventaja:</strong> requiere calcular la derivada y necesita una buena semilla inicial; si la semilla está lejos, puede divergir.</p>
        </div>
        <div class="example-box">
            <h4>📘 Ejemplo 3.1 (Guía 2 Corte I, pág. 4)</h4>
            <p>Para $f(x) = x^3 - x - 2$, con $x_0 = 1.5$.</p>
            <p>Derivada: $f'(x) = 3x^2 - 1$.</p>
            <p>$x_1 = 1.5 - \\frac{1.5^3 - 1.5 - 2}{3(1.5)^2 - 1} = 1.5 - \\frac{-0.125}{5.75} \\approx 1.521739$.</p>
            <p>$x_2 \\approx 1.521380$ (ya estable a 6 decimales).</p>
            <p>En solo dos pasos tenemos una excelente aproximación.</p>
        </div>
    `,
    calcFields: [
        { id: 'nr-f', label: 'f(x)', type: 'text', default: 'x*x*x - x - 2' },
        { id: 'nr-fp', label: "f'(x) (opcional)", type: 'text', default: '3*x*x - 1' },
        { id: 'nr-x0', label: 'x₀', type: 'number', default: 1.5 },
        { id: 'nr-tol', label: 'Tolerancia', type: 'number', default: 1e-6 },
        { id: 'nr-max', label: 'Max iter.', type: 'number', default: 50 }
    ],
    calculate: function(values) {
        try {
            const f = new Function('x', `return (${values['nr-f']})`);
            let fp = null;
            try { fp = new Function('x', `return (${values['nr-fp'] || '0'})`); } catch (e) {}
            let x = parseFloat(values['nr-x0']);
            const tol = parseFloat(values['nr-tol']), maxIter = parseInt(values['nr-max']);
            let tabla = [];
            for (let i = 0; i < maxIter; i++) {
                let fx = f(x), fpx = fp ? fp(x) : (f(x + 1e-7) - f(x - 1e-7)) / (2e-7);
                if (Math.abs(fpx) < 1e-15) return 'Derivada cercana a cero.';
                let xn = x - fx / fpx;
                tabla.push({ iter: i + 1, x, fx, xn, error: Math.abs(xn - x) });
                if (Math.abs(xn - x) < tol) break;
                x = xn;
            }
            const last = tabla[tabla.length - 1];
            return `
                <div class="metric-row">
                    <div class="metric"><span class="label">Aprox.</span><span class="value">${last.xn.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">f(x)</span><span class="value">${f(last.xn).toExponential(2)}</span></div>
                </div>
                <table>
                    <thead><tr><th>Iter</th><th>x</th><th>f(x)</th><th>xₙ₊₁</th><th>Error</th></tr></thead>
                    <tbody>
                        ${tabla.map(r => `<tr><td>${r.iter}</td><td>${r.x.toFixed(8)}</td><td>${r.fx.toExponential(2)}</td><td>${r.xn.toFixed(8)}</td><td>${r.error.toExponential(2)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Se evalúa la función y su derivada, se calcula la corrección y se actualiza la aproximación.</div>
            `;
        } catch (e) { return `Error: ${e.message}`; }
    }
}, {
    id: 'jacobi',
    icon: '🔢',
    title: 'Jacobi',
    description: 'Método iterativo para sistemas lineales.',
    theory: `
        <h2>Método de Jacobi</h2>
        <div class="explanation">
            <p>Jacobi es un método iterativo para resolver sistemas lineales $Ax = b$. La idea es despejar cada variable $x_i$ de la ecuación $i$ y actualizarla usando los valores de la iteración <strong>anterior</strong>.</p>
            <p>La fórmula general es:</p>
            <p>$$x_i^{(k+1)} = \\frac{1}{a_{ii}} \\left( b_i - \\sum_{j \\neq i} a_{ij} x_j^{(k)} \\right)$$</p>
            <p>Esto significa que <strong>todas las componentes se actualizan simultáneamente</strong> a partir de los valores de la iteración anterior. Esto permite paralelizar el cálculo.</p>
            <p><strong>Convergencia:</strong> Si la matriz es estrictamente diagonal dominante ($|a_{ii}| > \\sum_{j \\neq i} |a_{ij}|$), entonces Jacobi converge.</p>
        </div>
        <div class="example-box">
            <h4>📘 Ejemplo 3.1 (Guía 1 Corte II, pág. 3)</h4>
            <p>Sistema: $10x - y + 2z = 7$, $x + 8y - z = 8$, $2x - y + 9z = 6$.</p>
            <p>Despejando:</p>
            <p>$x^{(k+1)} = \\frac{7 + y^{(k)} - 2z^{(k)}}{10}$</p>
            <p>$y^{(k+1)} = \\frac{8 - x^{(k)} + z^{(k)}}{8}$</p>
            <p>$z^{(k+1)} = \\frac{6 - 2x^{(k)} + y^{(k)}}{9}$</p>
            <p>Con semilla $(0,0,0)$:</p>
            <p>Iteración 1: $(0.7, 1, 0.6667)$</p>
            <p>Iteración 2: $(0.6667, 0.9958, 0.6222)$</p>
        </div>
    `,
    calcFields: [
        { id: 'jac-A', label: 'Matriz A (filas \n)', type: 'textarea', default: '10 -1 2\n1 8 -1\n2 -1 9' },
        { id: 'jac-b', label: 'Vector b (\n)', type: 'textarea', default: '7\n8\n6' },
        { id: 'jac-x0', label: 'x₀ (comas)', type: 'text', default: '0,0,0' },
        { id: 'jac-tol', label: 'Tolerancia', type: 'number', default: 1e-6 },
        { id: 'jac-max', label: 'Max iter.', type: 'number', default: 50 }
    ],
    calculate: function(values) {
        try {
            const A = parseMatrix(values['jac-A']);
            const b = parseVector(values['jac-b']);
            const x0 = values['jac-x0'].split(',').map(Number);
            const tol = parseFloat(values['jac-tol']), maxIter = parseInt(values['jac-max']);
            if (A.length !== b.length || x0.length !== b.length) return 'Dimensiones incompatibles.';
            const n = b.length;
            let x = x0.slice(), tabla = [];
            for (let k = 0; k < maxIter; k++) {
                let xn = new Array(n).fill(0);
                for (let i = 0; i < n; i++) {
                    let sum = 0;
                    for (let j = 0; j < n; j++) if (j !== i) sum += A[i][j] * x[j];
                    xn[i] = (b[i] - sum) / A[i][i];
                }
                let err = Math.max(...xn.map((v, i) => Math.abs(v - x[i])));
                tabla.push({ iter: k + 1, x: xn.slice(), err });
                x = xn.slice();
                if (err < tol) break;
            }
            const last = tabla[tabla.length - 1];
            return `
                <div class="metric-row">
                    <div class="metric"><span class="label">Iter.</span><span class="value">${tabla.length}</span></div>
                    ${last.x.map((v,i) => `<div class="metric"><span class="label">x${i}</span><span class="value">${v.toFixed(6)}</span></div>`).join('')}
                </div>
                <span class="${tabla.length < maxIter ? 'badge-green' : 'badge-red'}">${tabla.length < maxIter ? '✓ Convergió' : '⚠ Max iter'}</span>
                <table>
                    <thead><tr><th>Iter</th>${Array.from({length:n},(_,i)=>`<th>x${i}</th>`).join('')}<th>Error</th></tr></thead>
                    <tbody>
                        ${tabla.map(r => `<tr><td>${r.iter}</td>${r.x.map(v=>`<td>${v.toFixed(8)}</td>`).join('')}<td>${r.err.toExponential(2)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Cada variable se actualiza usando los valores de la iteración anterior. Todas se calculan simultáneamente.</div>
            `;
        } catch (e) { return `Error: ${e.message}`; }
    }
}, {
    id: 'gaussseidel',
    icon: '🔁',
    title: 'Gauss-Seidel',
    description: 'Variante de Jacobi con actualización inmediata.',
    theory: `
        <h2>Gauss-Seidel</h2>
        <div class="explanation">
            <p>Gauss-Seidel es una mejora de Jacobi. La diferencia es que <strong>cuando calculamos $x_i^{(k+1)}$, ya usamos los valores más recientes</strong> de las componentes anteriores ($x_1^{(k+1)}, x_2^{(k+1)}, ..., x_{i-1}^{(k+1)}$) en lugar de los de la iteración anterior.</p>
            <p>La fórmula es:</p>
            <p>$$x_i^{(k+1)} = \\frac{1}{a_{ii}} \\left( b_i - \\sum_{j=1}^{i-1} a_{ij} x_j^{(k+1)} - \\sum_{j=i+1}^{n} a_{ij} x_j^{(k)} \\right)$$</p>
            <p>Esto suele acelerar la convergencia, pero hace que el método sea secuencial (no paralelizable).</p>
        </div>
        <div class="example-box">
            <h4>📘 Ejemplo 4.1 (Guía 1 Corte II, pág. 4)</h4>
            <p>Mismo sistema: $10x - y + 2z = 7$, $x + 8y - z = 8$, $2x - y + 9z = 6$.</p>
            <p>Con semilla $(0,0,0)$:</p>
            <p>$x^{(1)} = 0.7$ (usamos este valor para calcular $y$)</p>
            <p>$y^{(1)} = \\frac{8 - 0.7}{8} = 0.9125$</p>
            <p>$z^{(1)} = \\frac{6 - 2(0.7) + 0.9125}{9} = 0.6125$</p>
            <p>Iteración 2: $(0.66875, 0.99297, 0.62839)$.</p>
            <p>Se observa convergencia más rápida que Jacobi.</p>
        </div>
    `,
    calcFields: [
        { id: 'gs-A', label: 'Matriz A (filas \n)', type: 'textarea', default: '10 -1 2\n1 8 -1\n2 -1 9' },
        { id: 'gs-b', label: 'Vector b (\n)', type: 'textarea', default: '7\n8\n6' },
        { id: 'gs-x0', label: 'x₀ (comas)', type: 'text', default: '0,0,0' },
        { id: 'gs-tol', label: 'Tolerancia', type: 'number', default: 1e-6 },
        { id: 'gs-max', label: 'Max iter.', type: 'number', default: 50 }
    ],
    calculate: function(values) {
        try {
            const A = parseMatrix(values['gs-A']);
            const b = parseVector(values['gs-b']);
            const x0 = values['gs-x0'].split(',').map(Number);
            const tol = parseFloat(values['gs-tol']), maxIter = parseInt(values['gs-max']);
            if (A.length !== b.length || x0.length !== b.length) return 'Dimensiones incompatibles.';
            const n = b.length;
            let x = x0.slice(), tabla = [];
            for (let k = 0; k < maxIter; k++) {
                let xn = x.slice();
                for (let i = 0; i < n; i++) {
                    let sum = 0;
                    for (let j = 0; j < i; j++) sum += A[i][j] * xn[j];
                    for (let j = i + 1; j < n; j++) sum += A[i][j] * x[j];
                    xn[i] = (b[i] - sum) / A[i][i];
                }
                let err = Math.max(...xn.map((v, i) => Math.abs(v - x[i])));
                tabla.push({ iter: k + 1, x: xn.slice(), err });
                x = xn.slice();
                if (err < tol) break;
            }
            const last = tabla[tabla.length - 1];
            return `
                <div class="metric-row">
                    <div class="metric"><span class="label">Iter.</span><span class="value">${tabla.length}</span></div>
                    ${last.x.map((v,i) => `<div class="metric"><span class="label">x${i}</span><span class="value">${v.toFixed(6)}</span></div>`).join('')}
                </div>
                <span class="${tabla.length < maxIter ? 'badge-green' : 'badge-red'}">${tabla.length < maxIter ? '✓ Convergió' : '⚠ Max iter'}</span>
                <table>
                    <thead><tr><th>Iter</th>${Array.from({length:n},(_,i)=>`<th>x${i}</th>`).join('')}<th>Error</th></tr></thead>
                    <tbody>
                        ${tabla.map(r => `<tr><td>${r.iter}</td>${r.x.map(v=>`<td>${v.toFixed(8)}</td>`).join('')}<td>${r.err.toExponential(2)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Cada variable se actualiza inmediatamente usando los valores más recientes.</div>
            `;
        } catch (e) { return `Error: ${e.message}`; }
    }
}, {
    id: 'sor',
    icon: '⚡',
    title: 'SOR (Relajación)',
    description: 'Relajación sucesiva con parámetro ω.',
    theory: `
        <h2>Método SOR (Successive Over-Relaxation)</h2>
        <div class="explanation">
            <p>SOR es una extensión de Gauss-Seidel que introduce un <strong>parámetro de relajación</strong> $\\omega$. La idea es tomar una combinación lineal entre el valor anterior y el valor de Gauss-Seidel:</p>
            <p>$$x_i^{(k+1)} = (1 - \\omega) x_i^{(k)} + \\omega \\, x_{GS,i}^{(k+1)}$$</p>
            <p>Donde $x_{GS,i}^{(k+1)}$ es el valor que daría Gauss-Seidel.</p>
            <ul>
                <li>Si $\\omega = 1$: es Gauss-Seidel.</li>
                <li>Si $0 < \\omega < 1$: es <strong>subrelajación</strong> (más estable, útil para problemas mal condicionados).</li>
                <li>Si $1 < \\omega < 2$: es <strong>sobrerrelajación</strong> (acelera la convergencia si $\\omega$ está cerca del óptimo).</li>
            </ul>
            <p>El $\\omega$ óptimo depende de la matriz y se puede encontrar experimentalmente.</p>
        </div>
        <div class="example-box">
            <h4>📘 Ejemplo 5.2 (Guía 1 Corte II, pág. 5)</h4>
            <p>Sistema $2 \\times 2$: $4x - y = 7$, $-x + 5y = 8$.</p>
            <p>Gauss-Seidel puro (desde $(0,0)$): $x_{GS}^{(1)} = 1.75$, $y_{GS}^{(1)} = 1.95$.</p>
            <p>Con $\\omega = 1.1$:</p>
            <p>$x^{(1)} = (1-1.1)\\cdot 0 + 1.1 \\cdot 1.75 = 1.925$</p>
            <p>$y^{(1)} = (1-1.1)\\cdot 0 + 1.1 \\cdot 1.95 = 2.145$</p>
        </div>
    `,
    calcFields: [
        { id: 'sor-A', label: 'Matriz A (filas \n)', type: 'textarea', default: '4 -1\n-1 5' },
        { id: 'sor-b', label: 'Vector b (\n)', type: 'textarea', default: '7\n8' },
        { id: 'sor-x0', label: 'x₀ (comas)', type: 'text', default: '0,0' },
        { id: 'sor-omega', label: 'ω', type: 'number', default: 1.1, step: 0.05, min: 0.1, max: 1.95 },
        { id: 'sor-tol', label: 'Tolerancia', type: 'number', default: 1e-6 },
        { id: 'sor-max', label: 'Max iter.', type: 'number', default: 50 }
    ],
    calculate: function(values) {
        try {
            const A = parseMatrix(values['sor-A']);
            const b = parseVector(values['sor-b']);
            const x0 = values['sor-x0'].split(',').map(Number);
            const omega = parseFloat(values['sor-omega']);
            const tol = parseFloat(values['sor-tol']), maxIter = parseInt(values['sor-max']);
            if (A.length !== b.length || x0.length !== b.length) return 'Dimensiones incompatibles.';
            const n = b.length;
            let x = x0.slice(), tabla = [];
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
                tabla.push({ iter: k + 1, x: xn.slice(), err });
                x = xn.slice();
                if (err < tol) break;
            }
            const last = tabla[tabla.length - 1];
            return `
                <div class="metric-row">
                    <div class="metric"><span class="label">Iter.</span><span class="value">${tabla.length}</span></div>
                    <div class="metric"><span class="label">ω</span><span class="value">${omega.toFixed(2)}</span></div>
                    ${last.x.map((v,i) => `<div class="metric"><span class="label">x${i}</span><span class="value">${v.toFixed(6)}</span></div>`).join('')}
                </div>
                <span class="${tabla.length < maxIter ? 'badge-green' : 'badge-red'}">${tabla.length < maxIter ? '✓ Convergió' : '⚠ Max iter'}</span>
                <table>
                    <thead><tr><th>Iter</th>${Array.from({length:n},(_,i)=>`<th>x${i}</th>`).join('')}<th>Error</th></tr></thead>
                    <tbody>
                        ${tabla.map(r => `<tr><td>${r.iter}</td>${r.x.map(v=>`<td>${v.toFixed(8)}</td>`).join('')}<td>${r.err.toExponential(2)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Se calcula el valor de Gauss-Seidel y luego se combina con el valor anterior usando $\\omega$.</div>
            `;
        } catch (e) { return `Error: ${e.message}`; }
    }
}, {
    id: 'newtonsistemas',
    icon: '🧮',
    title: 'Newton (sistemas 2x2)',
    description: 'Newton para sistemas no lineales.',
    theory: `
        <h2>Newton para sistemas no lineales (2×2)</h2>
        <div class="explanation">
            <p>El método de Newton se extiende a sistemas de ecuaciones no lineales. Dado un sistema $F(x,y) = 0$, donde $F = (f_1, f_2)$, la idea es linealizar el sistema usando la <strong>matriz Jacobiana</strong> $J$.</p>
            <p>$$J(x,y) = \\begin{bmatrix} \\frac{\\partial f_1}{\\partial x} & \\frac{\\partial f_1}{\\partial y} \\\\ \\frac{\\partial f_2}{\\partial x} & \\frac{\\partial f_2}{\\partial y} \\end{bmatrix}$$</p>
            <p>En cada iteración se resuelve:</p>
            <p>$$J(x^{(k)}, y^{(k)}) \\begin{pmatrix} \\Delta x \\\\ \\Delta y \\end{pmatrix} = -F(x^{(k)}, y^{(k)})$$</p>
            <p>Luego se actualiza: $x^{(k+1)} = x^{(k)} + \\Delta x$, $y^{(k+1)} = y^{(k)} + \\Delta y$.</p>
            <p>La convergencia es cuadrática si la semilla está cerca de la solución.</p>
        </div>
        <div class="example-box">
            <h4>📘 Ejemplo 6.1 (Guía 1 Corte II, pág. 6)</h4>
            <p>Sistema: $f_1(x,y) = x^2 + y^2 - 4 = 0$, $f_2(x,y) = x - y - 1 = 0$.</p>
            <p>Jacobiana: $J = \\begin{bmatrix} 2x & 2y \\\\ 1 & -1 \\end{bmatrix}$</p>
            <p>Con semilla $(1.5, 0.5)$: $F = (-1.5, 0)$, $J = \\begin{bmatrix} 3 & 1 \\\\ 1 & -1 \\end{bmatrix}$.</p>
            <p>Resolviendo: $\\Delta x = 0.375$, $\\Delta y = 0.375$ → $(1.875, 0.875)$.</p>
        </div>
    `,
    calcFields: [
        { id: 'ns-f1', label: 'f1(x,y)', type: 'text', default: 'x*x + y*y - 4' },
        { id: 'ns-f2', label: 'f2(x,y)', type: 'text', default: 'x - y - 1' },
        { id: 'ns-x0', label: 'x₀', type: 'number', default: 1.5 },
        { id: 'ns-y0', label: 'y₀', type: 'number', default: 0.5 },
        { id: 'ns-tol', label: 'Tolerancia', type: 'number', default: 1e-6 },
        { id: 'ns-max', label: 'Max iter.', type: 'number', default: 20 }
    ],
    calculate: function(values) {
        try {
            const f1 = new Function('x', 'y', `return (${values['ns-f1']})`);
            const f2 = new Function('x', 'y', `return (${values['ns-f2']})`);
            let x = parseFloat(values['ns-x0']), y = parseFloat(values['ns-y0']);
            const tol = parseFloat(values['ns-tol']), maxIter = parseInt(values['ns-max']);
            let tabla = [];
            for (let k = 0; k < maxIter; k++) {
                let fx = f1(x, y), fy = f2(x, y);
                let h = 1e-7;
                let J11 = (f1(x + h, y) - f1(x - h, y)) / (2 * h);
                let J12 = (f1(x, y + h) - f1(x, y - h)) / (2 * h);
                let J21 = (f2(x + h, y) - f2(x - h, y)) / (2 * h);
                let J22 = (f2(x, y + h) - f2(x, y - h)) / (2 * h);
                let det = J11 * J22 - J12 * J21;
                if (Math.abs(det) < 1e-15) return 'Jacobiano singular.';
                let dx = (-fx * J22 + fy * J12) / det;
                let dy = (-J11 * fy + J21 * fx) / det;
                let xn = x + dx, yn = y + dy;
                tabla.push({ iter: k + 1, x, y, fx, fy, dx, dy, xn, yn, error: Math.max(Math.abs(dx), Math.abs(dy)) });
                if (Math.max(Math.abs(dx), Math.abs(dy)) < tol) break;
                x = xn; y = yn;
            }
            const last = tabla[tabla.length - 1];
            return `
                <div class="metric-row">
                    <div class="metric"><span class="label">x</span><span class="value">${last.xn.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">y</span><span class="value">${last.yn.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">f1</span><span class="value">${f1(last.xn,last.yn).toExponential(2)}</span></div>
                    <div class="metric"><span class="label">f2</span><span class="value">${f2(last.xn,last.yn).toExponential(2)}</span></div>
                </div>
                <table>
                    <thead><tr><th>Iter</th><th>x</th><th>y</th><th>f1</th><th>f2</th><th>Δx</th><th>Δy</th></tr></thead>
                    <tbody>
                        ${tabla.map(r => `<tr><td>${r.iter}</td><td>${r.x.toFixed(8)}</td><td>${r.y.toFixed(8)}</td><td>${r.fx.toExponential(2)}</td><td>${r.fy.toExponential(2)}</td><td>${r.dx.toExponential(2)}</td><td>${r.dy.toExponential(2)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Se calcula la Jacobiana y se resuelve el sistema lineal para obtener la corrección.</div>
            `;
        } catch (e) { return `Error: ${e.message}`; }
    }
}, {
    id: 'interpolacion',
    icon: '📐',
    title: 'Interpolación',
    description: 'Newton y Lagrange.',
    theory: `
        <h2>Interpolación Polinómica</h2>
        <div class="explanation">
            <p>La interpolación consiste en encontrar un polinomio que pase exactamente por un conjunto de puntos dados. Hay dos formas clásicas:</p>
            <ul>
                <li><strong>Newton:</strong> usa diferencias divididas. Es eficiente para añadir puntos nuevos.</li>
                <li><strong>Lagrange:</strong> construye polinomios base $L_i(x)$ que valen 1 en $x_i$ y 0 en los demás nodos.</li>
            </ul>
            <p>Ambos métodos producen el <strong>mismo polinomio único</strong> de grado $n$ (si hay $n+1$ puntos).</p>
            <p>Fórmula de Lagrange:</p>
            <p>$$P(x) = \\sum_{i=0}^{n} y_i L_i(x), \\qquad L_i(x) = \\prod_{j \\neq i} \\frac{x - x_j}{x_i - x_j}$$</p>
        </div>
        <div class="example-box">
            <h4>📘 Ejemplo 2.1 (Guía 2 Corte II, pág. 2) - Newton</h4>
            <p>Datos: $(1,2), (2,3), (4,7)$.</p>
            <p>Diferencias divididas: $f[1]=2$, $f[1,2]=1$, $f[1,2,4]=\\frac{1}{3}$.</p>
            <p>Polinomio: $P_2(x) = 2 + 1(x-1) + \\frac{1}{3}(x-1)(x-2) = \\frac{1}{3}x^2 + \\frac{1}{3}x + \\frac{4}{3}$.</p>
            <p>Evaluando en $x=3$: $P_2(3) = \\frac{14}{3} \\approx 4.6667$.</p>
        </div>
        <div class="example-box">
            <h4>📘 Ejemplo 3.1 (Guía 2 Corte II, pág. 3) - Lagrange</h4>
            <p>Datos: $(1,1), (2,4), (3,9)$ → $P(x) = x^2$.</p>
        </div>
    `,
    calcFields: [
        { id: 'int-pts', label: 'Puntos (x,y) uno por línea', type: 'textarea', default: '1,2\n2,3\n4,7' },
        { id: 'int-xv', label: 'Evaluar en x =', type: 'number', default: 3 }
    ],
    calculate: function(values) {
        try {
            const lines = values['int-pts'].trim().split('\n').filter(l => l.trim());
            const pts = lines.map(l => l.split(',').map(Number));
            const xv = parseFloat(values['int-xv']);
            if (pts.some(p => p.length !== 2 || isNaN(p[0]) || isNaN(p[1]))) return 'Formato inválido.';
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
            return `
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
                <div class="step"><strong>Paso a paso:</strong> Se construyen los polinomios base (Lagrange) o las diferencias divididas (Newton), y se evalúa en el punto dado.</div>
            `;
        } catch (e) { return `Error: ${e.message}`; }
    }
}, {
    id: 'integracion',
    icon: '∫',
    title: 'Integración Numérica',
    description: 'Trapecio, Simpson, Gauss.',
    theory: `
        <h2>Integración Numérica</h2>
        <div class="explanation">
            <p>La integración numérica aproxima el valor de una integral definida usando sumas finitas. Los métodos más comunes son:</p>
            <ul>
                <li><strong>Regla del Trapecio:</strong> aproxima el área bajo la curva con trapecios. Fórmula compuesta:</li>
                <p>$$T = \\frac{h}{2} \\left[ f(a) + 2\\sum_{i=1}^{n-1} f(x_i) + f(b) \\right]$$</p>
                <li><strong>Regla de Simpson 1/3:</strong> usa parábolas en lugar de rectas, más preciso.</li>
                <p>$$S = \\frac{h}{3} \\left[ f(a) + 4\\sum_{i=1,3,5}^{n-1} f(x_i) + 2\\sum_{i=2,4}^{n-2} f(x_i) + f(b) \\right]$$</p>
                <li><strong>Cuadratura de Gauss-Legendre (2 puntos):</strong> usa puntos específicos para integrar polinomios de grado hasta 3.</li>
            </ul>
            <p>La elección del método depende de la precisión deseada y la suavidad de la función.</p>
        </div>
        <div class="example-box">
            <h4>📘 Ejemplos 5.1, 6.1, 7.1 (Guía 2 Corte II)</h4>
            <p>Para $\\int_0^2 (x^2+1) dx = \\frac{14}{3} \\approx 4.6667$:</p>
            <ul>
                <li><strong>Trapecio simple:</strong> $6$ (sobrestima).</li>
                <li><strong>Trapecio compuesto (n=4):</strong> $4.75$.</li>
                <li><strong>Simpson 1/3:</strong> $\\frac{14}{3}$ (exacto para polinomios grado ≤ 2).</li>
                <li><strong>Gauss 2 puntos:</strong> también da $\\frac{14}{3}$.</li>
            </ul>
        </div>
    `,
    calcFields: [
        { id: 'int-fx', label: 'f(x)', type: 'text', default: 'x*x + 1' },
        { id: 'int-a', label: 'a', type: 'number', default: 0 },
        { id: 'int-b', label: 'b', type: 'number', default: 2 },
        { id: 'int-n', label: 'n (subintervalos)', type: 'number', default: 4 }
    ],
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
            return `
                <div class="metric-row">
                    <div class="metric"><span class="label">Trapecio (n=${n})</span><span class="value">${T.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">Simpson (n=${n2})</span><span class="value">${S.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">Gauss-Legendre</span><span class="value">${G.toFixed(8)}</span></div>
                </div>
                <div class="step"><strong>Paso a paso:</strong> Se discretiza el intervalo, se evalúa la función en los nodos y se aplica la fórmula de cuadratura correspondiente.</div>
            `;
        } catch (e) { return `Error: ${e.message}`; }
    }
}, {
    id: 'diferenciacion',
    icon: '∂',
    title: 'Diferenciación',
    description: 'Progresiva, regresiva, centrada.',
    theory: `
        <h2>Diferenciación Numérica</h2>
        <div class="explanation">
            <p>La diferenciación numérica aproxima la derivada de una función usando diferencias finitas. Las tres fórmulas básicas son:</p>
            <ul>
                <li><strong>Progresiva:</strong> usa el punto $x$ y el siguiente $x+h$.</li>
                <p>$$f'(x) \\approx \\frac{f(x+h)-f(x)}{h}$$</p>
                <li><strong>Regresiva:</strong> usa $x$ y el anterior $x-h$.</li>
                <p>$$f'(x) \\approx \\frac{f(x)-f(x-h)}{h}$$</p>
                <li><strong>Centrada:</strong> usa ambos lados, es más precisa (error $O(h^2)$).</li>
                <p>$$f'(x) \\approx \\frac{f(x+h)-f(x-h)}{2h}$$</p>
            </ul>
            <p>La centrada es preferible cuando es posible usarla, porque da el doble de orden de precisión que las otras.</p>
        </div>
        <div class="example-box">
            <h4>📘 Ejemplo 2.1 (Guía 1 Corte III, pág. 2)</h4>
            <p>Para $f(x)=x^2$, $x_0=1$, $h=0.1$:</p>
            <p>Progresiva: $(1.21-1)/0.1 = 2.1$</p>
            <p>Centrada: $(1.21-0.81)/0.2 = 2.0$ (exacto).</p>
        </div>
    `,
    calcFields: [
        { id: 'diff-fx', label: 'f(x)', type: 'text', default: 'x*x' },
        { id: 'diff-x0', label: 'x₀', type: 'number', default: 1 },
        { id: 'diff-h', label: 'h', type: 'number', default: 0.1 },
        { id: 'diff-exact', label: 'Exacta (opcional)', type: 'text', default: '2' }
    ],
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
            return html;
        } catch (e) { return `Error: ${e.message}`; }
    }
}, {
    id: 'segundaderivada',
    icon: '∂²',
    title: 'Segunda Derivada',
    description: 'Fórmula centrada para f″.',
    theory: `
        <h2>Segunda Derivada Numérica</h2>
        <div class="explanation">
            <p>La segunda derivada mide la curvatura de la función. Se puede aproximar con la fórmula centrada:</p>
            <p>$$f''(x) \\approx \\frac{f(x+h) - 2f(x) + f(x-h)}{h^2}$$</p>
            <p>Esta fórmula tiene error $O(h^2)$. Es la más usada porque es simple y precisa.</p>
            <p>Es importante notar que la división por $h^2$ puede amplificar errores de redondeo si $h$ es demasiado pequeño.</p>
        </div>
        <div class="example-box">
            <h4>📘 Ejemplo 3.1 (Guía 1 Corte III, pág. 3)</h4>
            <p>Para $f(x)=x^3$, $x_0=1$, $h=0.1$:</p>
            <p>$f(1.1)=1.331$, $f(1)=1$, $f(0.9)=0.729$.</p>
            <p>$f''(1) \\approx \\frac{1.331 - 2\\cdot 1 + 0.729}{0.01} = \\frac{0.06}{0.01} = 6.0$. Exacto, porque $f''(x)=6x$.</p>
        </div>
    `,
    calcFields: [
        { id: 'd2-fx', label: 'f(x)', type: 'text', default: 'x*x*x' },
        { id: 'd2-x0', label: 'x₀', type: 'number', default: 1 },
        { id: 'd2-h', label: 'h', type: 'number', default: 0.1 },
        { id: 'd2-exact', label: 'Exacta', type: 'number', default: 6 }
    ],
    calculate: function(values) {
        try {
            const f = new Function('x', `return (${values['d2-fx']})`);
            const x0 = parseFloat(values['d2-x0']), h = parseFloat(values['d2-h']);
            const exact = parseFloat(values['d2-exact']);
            const d2 = (f(x0 + h) - 2 * f(x0) + f(x0 - h)) / (h * h);
            return `
                <div class="metric-row">
                    <div class="metric"><span class="label">f''(x₀)</span><span class="value">${d2.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">Exacta</span><span class="value">${exact.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">Error</span><span class="value">${Math.abs(d2-exact).toExponential(2)}</span></div>
                </div>
                <div class="step"><strong>Paso 1:</strong> Evaluar $f(x_0+h)$, $f(x_0)$, $f(x_0-h)$.</div>
                <div class="step"><strong>Paso 2:</strong> Calcular el numerador: $f(x_0+h) - 2f(x_0) + f(x_0-h)$.</div>
                <div class="step"><strong>Paso 3:</strong> Dividir por $h^2$.</div>
            `;
        } catch (e) { return `Error: ${e.message}`; }
    }
}, {
    id: 'richardson',
    icon: 'R',
    title: 'Richardson',
    description: 'Extrapolación para mejorar precisión.',
    theory: `
        <h2>Extrapolación de Richardson</h2>
        <div class="explanation">
            <p>Richardson es una técnica para <strong>mejorar la precisión</strong> de una aproximación numérica combinando dos estimaciones con diferentes tamaños de paso.</p>
            <p>Si tenemos una aproximación $D(h)$ que depende de $h$, y sabemos que su error es de la forma $C h^p$ (es decir, $D(h) = D_{exacto} + C h^p + O(h^{p+1})$), entonces podemos eliminar el término principal combinando $D(h)$ y $D(h/2)$:</p>
            <p>$$D_R = \\frac{2^p D(h/2) - D(h)}{2^p - 1}$$</p>
            <p>El resultado $D_R$ tiene error $O(h^{p+1})$, es decir, un orden más de precisión.</p>
            <p>Esta técnica es muy útil cuando no podemos reducir $h$ fácilmente.</p>
        </div>
        <div class="example-box">
            <h4>📘 Ejemplo 5.1 (Guía 1 Corte III, pág. 5)</h4>
            <p>Para una fórmula centrada ($p=2$): $D(0.2)=0.995$, $D(0.1)=0.99875$.</p>
            <p>$D_R = \\frac{4\\cdot 0.99875 - 0.995}{4-1} = \\frac{3.995 - 0.995}{3} = 1.0$.</p>
            <p>La extrapolación da el valor exacto.</p>
        </div>
    `,
    calcFields: [
        { id: 'rich-Dh', label: 'D(h)', type: 'number', default: 0.995 },
        { id: 'rich-Dh2', label: 'D(h/2)', type: 'number', default: 0.99875 },
        { id: 'rich-p', label: 'p (orden)', type: 'number', default: 2, min: 1, max: 6 },
        { id: 'rich-exact', label: 'Exacta (opcional)', type: 'number', default: 1 }
    ],
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
                <div class="step"><strong>Paso 1:</strong> Identificar el orden $p$ del error.</div>
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
            return html;
        } catch (e) { return `Error: ${e.message}`; }
    }
}, {
    id: 'euler',
    icon: 'E',
    title: 'Euler',
    description: 'Método de Euler para EDOs.',
    theory: `
        <h2>Método de Euler</h2>
        <div class="explanation">
            <p>Euler es el método más simple para resolver problemas de valor inicial (PVI) de la forma $y' = f(x,y)$, $y(x_0)=y_0$.</p>
            <p>La idea es aproximar la solución usando la <strong>recta tangente</strong> en cada punto:</p>
            <p>$$y_{n+1} = y_n + h \\cdot f(x_n, y_n)$$</p>
            <p>Donde $h$ es el tamaño de paso. Es decir, avanzamos en la dirección de la pendiente actual.</p>
            <p><strong>Ventaja:</strong> muy simple y rápido. <strong>Desventaja:</strong> error global $O(h)$, es poco preciso para problemas con curvatura alta.</p>
        </div>
        <div class="example-box">
            <h4>📘 Ejemplo 3.1 (Guía 2 Corte III, pág. 2)</h4>
            <p>Resolver $y' = x + y$, $y(0)=1$, con $h=0.1$ hasta $x=0.2$.</p>
            <p>$y_1 = 1 + 0.1(0+1) = 1.1$</p>
            <p>$y_2 = 1.1 + 0.1(0.1+1.1) = 1.22$</p>
        </div>
    `,
    calcFields: [
        { id: 'eul-f', label: 'f(x,y)', type: 'text', default: 'x + y' },
        { id: 'eul-x0', label: 'x₀', type: 'number', default: 0 },
        { id: 'eul-y0', label: 'y₀', type: 'number', default: 1 },
        { id: 'eul-h', label: 'h', type: 'number', default: 0.1 },
        { id: 'eul-n', label: 'n pasos', type: 'number', default: 2 }
    ],
    calculate: function(values) {
        try {
            const f = new Function('x', 'y', `return (${values['eul-f']})`);
            const x0 = parseFloat(values['eul-x0']), y0 = parseFloat(values['eul-y0']);
            const h = parseFloat(values['eul-h']), n = parseInt(values['eul-n']);
            let xs = [x0], ys = [y0];
            let x = x0, y = y0;
            for (let i = 0; i < n; i++) {
                y = y + h * f(x, y);
                x += h;
                xs.push(x);
                ys.push(y);
            }
            return `
                <div class="metric-row">
                    <div class="metric"><span class="label">y(${xs[xs.length-1].toFixed(4)})</span><span class="value">${ys[ys.length-1].toFixed(8)}</span></div>
                </div>
                <table>
                    <thead><tr><th>n</th><th>x</th><th>y</th></tr></thead>
                    <tbody>
                        ${xs.map((xi,i) => `<tr><td>${i}</td><td>${xi.toFixed(4)}</td><td>${ys[i].toFixed(8)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> En cada paso se calcula la pendiente $f(x_n, y_n)$ y se avanza en esa dirección.</div>
            `;
        } catch (e) { return `Error: ${e.message}`; }
    }
}, {
    id: 'rk2',
    icon: 'K₂',
    title: 'Runge-Kutta 2 (Heun)',
    description: 'Método de segundo orden.',
    theory: `
        <h2>Runge-Kutta 2 (Heun)</h2>
        <div class="explanation">
            <p>El método de Heun (RK2) mejora a Euler usando dos evaluaciones de la pendiente por paso:</p>
            <ol>
                <li>$k_1 = f(x_n, y_n)$ (pendiente al inicio).</li>
                <li>$k_2 = f(x_n + h, y_n + h k_1)$ (pendiente al final, usando $k_1$ para predecir).</li>
                <li>Se toma el promedio de ambas: $y_{n+1} = y_n + \\frac{h}{2}(k_1 + k_2)$.</li>
            </ol>
            <p>Esto da error global $O(h^2)$, mucho mejor que Euler.</p>
        </div>
        <div class="example-box">
            <h4>📘 Ejemplo 4.1 (Guía 2 Corte III, pág. 3)</h4>
            <p>Para $y' = x + y$, $y(0)=1$, $h=0.1$:</p>
            <p>$k_1 = 1$</p>
            <p>$k_2 = f(0.1, 1 + 0.1\\cdot 1) = f(0.1, 1.1) = 1.2$</p>
            <p>$y_1 = 1 + \\frac{0.1}{2}(1+1.2) = 1.11$</p>
        </div>
    `,
    calcFields: [
        { id: 'rk2-f', label: 'f(x,y)', type: 'text', default: 'x + y' },
        { id: 'rk2-x0', label: 'x₀', type: 'number', default: 0 },
        { id: 'rk2-y0', label: 'y₀', type: 'number', default: 1 },
        { id: 'rk2-h', label: 'h', type: 'number', default: 0.1 },
        { id: 'rk2-n', label: 'n pasos', type: 'number', default: 1 }
    ],
    calculate: function(values) {
        try {
            const f = new Function('x', 'y', `return (${values['rk2-f']})`);
            const x0 = parseFloat(values['rk2-x0']), y0 = parseFloat(values['rk2-y0']);
            const h = parseFloat(values['rk2-h']), n = parseInt(values['rk2-n']);
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
            return `
                <div class="metric-row">
                    <div class="metric"><span class="label">y(${xs[xs.length-1].toFixed(4)})</span><span class="value">${ys[ys.length-1].toFixed(8)}</span></div>
                </div>
                <table>
                    <thead><tr><th>n</th><th>x</th><th>y</th></tr></thead>
                    <tbody>
                        ${xs.map((xi,i) => `<tr><td>${i}</td><td>${xi.toFixed(4)}</td><td>${ys[i].toFixed(8)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Se calculan $k_1$ y $k_2$, se promedian y se actualiza $y$.</div>
            `;
        } catch (e) { return `Error: ${e.message}`; }
    }
}, {
    id: 'rk4',
    icon: 'K₄',
    title: 'Runge-Kutta 4',
    description: 'Método de cuarto orden.',
    theory: `
        <h2>Runge-Kutta 4 (RK4)</h2>
        <div class="explanation">
            <p>RK4 es el estándar de oro para resolver EDOs no rígidas. Usa cuatro evaluaciones de la pendiente por paso, combinándolas con pesos:</p>
            <p>$$k_1 = f(x_n, y_n)$$</p>
            <p>$$k_2 = f(x_n + \\frac{h}{2}, y_n + \\frac{h}{2} k_1)$$</p>
            <p>$$k_3 = f(x_n + \\frac{h}{2}, y_n + \\frac{h}{2} k_2)$$</p>
            <p>$$k_4 = f(x_n + h, y_n + h k_3)$$</p>
            <p>$$y_{n+1} = y_n + \\frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)$$</p>
            <p>El error global es $O(h^4)$, lo que lo hace muy preciso.</p>
        </div>
        <div class="example-box">
            <h4>📘 Ejemplo 5.1 (Guía 2 Corte III, pág. 4)</h4>
            <p>Para $y' = x + y$, $y(0)=1$, $h=0.1$:</p>
            <p>$k_1=1$, $k_2=1.1$, $k_3=1.105$, $k_4=1.2105$.</p>
            <p>$y_1 = 1 + \\frac{0.1}{6}(1 + 2\\cdot 1.1 + 2\\cdot 1.105 + 1.2105) \\approx 1.11034$.</p>
        </div>
    `,
    calcFields: [
        { id: 'rk4-f', label: 'f(x,y)', type: 'text', default: 'x + y' },
        { id: 'rk4-x0', label: 'x₀', type: 'number', default: 0 },
        { id: 'rk4-y0', label: 'y₀', type: 'number', default: 1 },
        { id: 'rk4-h', label: 'h', type: 'number', default: 0.1 },
        { id: 'rk4-n', label: 'n pasos', type: 'number', default: 1 }
    ],
    calculate: function(values) {
        try {
            const f = new Function('x', 'y', `return (${values['rk4-f']})`);
            const x0 = parseFloat(values['rk4-x0']), y0 = parseFloat(values['rk4-y0']);
            const h = parseFloat(values['rk4-h']), n = parseInt(values['rk4-n']);
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
            return `
                <div class="metric-row">
                    <div class="metric"><span class="label">y(${xs[xs.length-1].toFixed(4)})</span><span class="value">${ys[ys.length-1].toFixed(8)}</span></div>
                </div>
                <table>
                    <thead><tr><th>n</th><th>x</th><th>y</th></tr></thead>
                    <tbody>
                        ${xs.map((xi,i) => `<tr><td>${i}</td><td>${xi.toFixed(4)}</td><td>${ys[i].toFixed(8)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Se calculan los cuatro coeficientes y se actualiza con la combinación ponderada.</div>
            `;
        } catch (e) { return `Error: ${e.message}`; }
    }
}, {
    id: 'sistemasedo',
    icon: 'S',
    title: 'Sistemas EDO 2×2',
    description: 'RK4 para sistemas.',
    theory: `
        <h2>Sistemas de EDO 2×2 (RK4)</h2>
        <div class="explanation">
            <p>Los sistemas de EDO aparecen cuando hay varias variables que evolucionan acopladas. La forma general es:</p>
            <p>$$y_0' = f_0(x, y_0, y_1), \\qquad y_1' = f_1(x, y_0, y_1)$$</p>
            <p>Para resolverlos, se aplica RK4 a <strong>cada componente simultáneamente</strong>. Es decir, calculamos $k_1, k_2, k_3, k_4$ para $y_0$ y para $y_1$ usando los mismos valores intermedios.</p>
            <p>Esto permite resolver sistemas como el oscilador armónico o modelos depredador-presa.</p>
        </div>
        <div class="example-box">
            <h4>📘 Ejemplo 6.1 (Guía 2 Corte III, pág. 5)</h4>
            <p>Oscilador armónico: $x' = y$, $y' = -x$, con $(x_0, y_0) = (1,0)$, $h=0.1$.</p>
            <p>Euler (simple):</p>
            <p>$x_1 = 1 + 0.1\\cdot 0 = 1$, $y_1 = 0 - 0.1\\cdot 1 = -0.1$</p>
            <p>$x_2 = 1 + 0.1\\cdot (-0.1) = 0.99$, $y_2 = -0.1 - 0.1\\cdot 1 = -0.2$</p>
            <p>Con RK4 la energía se conserva mucho mejor ($x^2 + y^2 \\approx 1$).</p>
        </div>
    `,
    calcFields: [
        { id: 'sis-f0', label: 'f₀(x,y₀,y₁)', type: 'text', default: 'y1' },
        { id: 'sis-f1', label: 'f₁(x,y₀,y₁)', type: 'text', default: '-y0' },
        { id: 'sis-x0', label: 'x₀', type: 'number', default: 0 },
        { id: 'sis-y00', label: 'y₀(0)', type: 'number', default: 1 },
        { id: 'sis-y10', label: 'y₁(0)', type: 'number', default: 0 },
        { id: 'sis-h', label: 'h', type: 'number', default: 0.1 },
        { id: 'sis-n', label: 'n pasos', type: 'number', default: 2 }
    ],
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
            return `
                <div class="metric-row">
                    <div class="metric"><span class="label">y₀ final</span><span class="value">${y0s[y0s.length-1].toFixed(6)}</span></div>
                    <div class="metric"><span class="label">y₁ final</span><span class="value">${y1s[y1s.length-1].toFixed(6)}</span></div>
                </div>
                <table>
                    <thead><tr><th>x</th><th>y₀</th><th>y₁</th></tr></thead>
                    <tbody>
                        ${xs.map((xi,i) => `<tr><td>${xi.toFixed(4)}</td><td>${y0s[i].toFixed(6)}</td><td>${y1s[i].toFixed(6)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="step"><strong>Paso a paso:</strong> Se aplica RK4 a ambas componentes simultáneamente, usando los mismos pasos intermedios.</div>
            `;
        } catch (e) { return `Error: ${e.message}`; }
    }
}];
