// data.js
const topics = [{
    id: 'errores',
    icon: '📊',
    title: 'Errores Numéricos',
    description: 'Absoluto, relativo, redondeo y truncamiento.',
    theory: `
        <h2>Errores Numéricos</h2>
        <div class="explanation">
            El error numérico es la diferencia entre el valor exacto y el aproximado.
            Es fundamental en métodos numéricos para evaluar la calidad de una aproximación.
        </div>
        <div class="formula">$$E_a = |x - \\tilde{x}|$$</div>
        <div class="formula">$$E_r = \\frac{E_a}{|x|}, \\quad x \\neq 0$$</div>
        <div class="formula">$$E_r\\% = 100 \\cdot E_r$$</div>
        <div class="example-box">
            <h4>Ejemplo</h4>
            <p>Si $x = 12.78436$ y $\\tilde{x} = 12.7844$ (redondeo a 4 decimales), entonces $E_a = 0.00004$ y $E_r \\approx 3.13 \\times 10^{-6}$.</p>
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
            <div class="step"><strong>Paso 1:</strong> $E_a = |${xe} - ${xa}| = ${ea.toFixed(dec)}$</div>
            <div class="step"><strong>Paso 2:</strong> $E_r = \\frac{${ea.toFixed(dec)}}{|${xe}|} = ${er.toFixed(dec)}$</div>
            <div class="step"><strong>Paso 3:</strong> $E_r\\% = 100 \\cdot ${er.toFixed(dec)} = ${ep.toFixed(dec)}\\%$</div>
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
            El método de bisección se basa en el teorema del valor intermedio. Dado un intervalo $[a,b]$ donde $f(a)f(b) < 0$, se divide el intervalo por la mitad y se selecciona el subintervalo que contiene la raíz.
        </div>
        <div class="formula">$$c = \\frac{a+b}{2}$$</div>
        <div class="example-box">
            <h4>Ejemplo</h4>
            <p>Para $f(x)=x^3-4x-9$ en $[2,3]$:</p>
            <p>$c_0 = 2.5$, $f(2.5) = -3.375$ → nuevo intervalo $[2.5,3]$.</p>
            <p>Tras 4 iteraciones: $x \\approx 2.78125$.</p>
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
                <div class="step"><strong>Paso a paso:</strong> Se calcula el punto medio y se evalúa f. Se descarta la mitad que no contiene la raíz.</div>
            `;
            return html;
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
            Newton-Raphson aproxima la raíz de $f(x)=0$ usando la recta tangente. La iteración es:
        </div>
        <div class="formula">$$x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$$</div>
        <div class="example-box">
            <h4>Ejemplo</h4>
            <p>Para $f(x)=x^3-x-2$ con $x_0=1.5$:</p>
            <p>$x_1 = 1.5 - \\frac{-0.125}{5.75} \\approx 1.521739$, $x_2 \\approx 1.521380$.</p>
        </div>
    `,
    calcFields: [
        { id: 'nr-f', label: 'f(x)', type: 'text', default: 'x*x*x - x - 2' },
        { id: 'nr-fp', label: "f'(x) (opcional)", type: 'text', default: '3*x*x - 1' },
        { id: 'nr-x0', label: 'x₀', type: 'number', default: 1.5 },
        { id: 'nr-tol', label: 'Tolerancia', type: 'number', default: 1e-6 },
        { id: 'nr-max', label: 'Max iter.', type: 'number', default: 50 }
    ],
    calcHelp: 'Ingrese f(x) y su derivada (opcional). Se usa Newton-Raphson.',
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
                <div class="step"><strong>Paso a paso:</strong> Se evalúa f y f' en cada iteración y se actualiza la aproximación.</div>
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
            Jacobi resuelve sistemas lineales $Ax=b$ despejando cada variable usando los valores de la iteración anterior.
        </div>
        <div class="formula">$$x_i^{(k+1)} = \\frac{1}{a_{ii}} \\left( b_i - \\sum_{j \\neq i} a_{ij} x_j^{(k)} \\right)$$</div>
        <div class="example-box">
            <h4>Ejemplo</h4>
            <p>Para el sistema $10x - y + 2z = 7$, $x + 8y - z = 8$, $2x - y + 9z = 6$:</p>
            <p>Iteración 1: $(0.7, 1, 0.6667)$.</p>
        </div>
    `,
    calcFields: [
        { id: 'jac-A', label: 'Matriz A (filas \n)', type: 'textarea', default: '10 -1 2\n1 8 -1\n2 -1 9' },
        { id: 'jac-b', label: 'Vector b (\n)', type: 'textarea', default: '7\n8\n6' },
        { id: 'jac-x0', label: 'x₀ (comas)', type: 'text', default: '0,0,0' },
        { id: 'jac-tol', label: 'Tolerancia', type: 'number', default: 1e-6 },
        { id: 'jac-max', label: 'Max iter.', type: 'number', default: 50 }
    ],
    calcHelp: 'Ingrese la matriz A y el vector b. Jacobi itera hasta converger.',
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
                <div class="step"><strong>Paso a paso:</strong> Cada variable se actualiza usando los valores de la iteración anterior.</div>
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
            Se aproxima la integral definida mediante sumas ponderadas de evaluaciones de la función.
        </div>
        <div class="formula">$$\\text{Trapecio: } T = \\frac{h}{2} [f(a) + 2\\sum_{i=1}^{n-1} f(x_i) + f(b)]$$</div>
        <div class="formula">$$\\text{Simpson 1/3: } S = \\frac{h}{3} [f(a) + 4\\sum_{i=1,3,5}^{n-1} f(x_i) + 2\\sum_{i=2,4}^{n-2} f(x_i) + f(b)]$$</div>
        <div class="example-box">
            <h4>Ejemplo</h4>
            <p>Para $f(x)=x^2+1$ en $[0,2]$: trapecio simple da 6, Simpson 1/3 da 14/3 (exacto).</p>
        </div>
    `,
    calcFields: [
        { id: 'int-fx', label: 'f(x)', type: 'text', default: 'x*x + 1' },
        { id: 'int-a', label: 'a', type: 'number', default: 0 },
        { id: 'int-b', label: 'b', type: 'number', default: 2 },
        { id: 'int-n', label: 'n (subintervalos)', type: 'number', default: 4 }
    ],
    calcHelp: 'Ingrese f(x), límites y número de subintervalos. Se aplican trapecio y Simpson.',
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
            return `
                <div class="metric-row">
                    <div class="metric"><span class="label">Trapecio (n=${n})</span><span class="value">${T.toFixed(8)}</span></div>
                    <div class="metric"><span class="label">Simpson (n=${n2})</span><span class="value">${S.toFixed(8)}</span></div>
                </div>
                <div class="step"><strong>Paso a paso:</strong> Se calculan los nodos, se evalúa f y se aplican las fórmulas de cuadratura.</div>
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
            Se aproxima la derivada usando diferencias finitas.
        </div>
        <div class="formula">$$f'(x) \\approx \\frac{f(x+h)-f(x)}{h} \\quad \\text{(progresiva)}$$</div>
        <div class="formula">$$f'(x) \\approx \\frac{f(x)-f(x-h)}{h} \\quad \\text{(regresiva)}$$</div>
        <div class="formula">$$f'(x) \\approx \\frac{f(x+h)-f(x-h)}{2h} \\quad \\text{(centrada)}$$</div>
        <div class="example-box">
            <h4>Ejemplo</h4>
            <p>Para $f(x)=x^2$, $x=1$, $h=0.1$: progresiva da 2.1, centrada da 2.0 (exacto).</p>
        </div>
    `,
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
                <div class="step"><strong>Paso 4:</strong> Aplicar fórmulas.</div>
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
}];