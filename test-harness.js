// test-harness.js — Validación numérica de los 18+ métodos (Node.js, sin dependencias).
// Uso:  node test-harness.js
'use strict';
const NM = require('./nm-core.js');

let passed = 0, failed = 0;
const failures = [];

function check(name, actual, expected, tol) {
    const ok = Math.abs(actual - expected) <= tol;
    if (ok) { passed++; console.log(`  ✓ ${name}: ${actual} ≈ ${expected} (tol ${tol})`); }
    else {
        failed++;
        failures.push(name);
        console.log(`  ✗ ${name}: obtuvo ${actual}, esperaba ${expected} ± ${tol} (dif ${Math.abs(actual - expected)})`);
    }
}
function checkTrue(name, cond, detail = '') {
    if (cond) { passed++; console.log(`  ✓ ${name}`); }
    else { failed++; failures.push(name); console.log(`  ✗ ${name} ${detail}`); }
}
function section(t) { console.log(`\n── ${t} ${'─'.repeat(Math.max(0, 60 - t.length))}`); }

// ================================================================
section('Parser de expresiones');
// ================================================================
{
    const f = NM.makeFn('x^3 - 4*x - 9');
    check('parser: x^3 como potencia (no XOR), f(2)', f(2), -9, 1e-12);
    check('parser: f(3)', f(3), 6, 1e-12);
    check('evalConst PI', NM.evalConst('PI'), Math.PI, 1e-15);
    check('evalConst sqrt(2)', NM.evalConst('sqrt(2)'), Math.SQRT2, 1e-15);
    check('evalConst exp(1)', NM.evalConst('exp(1)'), Math.E, 1e-15);
    check('evalConst PI/2 + 1', NM.evalConst('PI/2 + 1'), Math.PI / 2 + 1, 1e-15);
    const g = NM.makeFn('ln(x) + sin(pi*x) + e');
    check('parser: ln, sin, pi, e — g(1)', g(1), Math.E + Math.sin(Math.PI), 1e-12);
    check('parser: notación científica 1e-6 intacta', NM.evalConst('1e-6'), 1e-6, 1e-20);
}

// ================================================================
section('Corte I — Errores');
// ================================================================
{
    const r = NM.errors(87.245, 87.19);
    check('error absoluto', r.ea, 0.055, 1e-9);
    check('error relativo', r.er, 0.055 / 87.245, 1e-12);
    check('error porcentual', r.ep, 100 * 0.055 / 87.245, 1e-10);
}

// ================================================================
section('Corte I — Aislamiento de raíces');
// ================================================================
{
    const f = NM.makeFn('x^3 - 4*x - 9');
    const r = NM.incrementalSearch(f, 2, 3, 0.25);
    checkTrue('detecta exactamente 1 intervalo en [2,3]', r.intervals.length === 1, `(halló ${r.intervals.length})`);
    check('extremo izquierdo del intervalo', r.intervals[0][0], 2.5, 1e-12);
    check('extremo derecho del intervalo', r.intervals[0][1], 2.75, 1e-12);
    const s = NM.incrementalSearch(NM.makeFn('sin(x)'), 0.5, 7, 0.5);
    checkTrue('sin(x) en [0.5, 7]: 2 raíces aisladas (π y 2π)', s.intervals.length === 2, `(halló ${s.intervals.length})`);
}

// ================================================================
section('Corte I — Bisección  [CASO OBLIGATORIO]');
// ================================================================
{
    const f = NM.makeFn('x^3 - 4*x - 9');
    const r = NM.bisection(f, 2, 3, 1e-6, 200);
    checkTrue('converge', r.ok);
    check('raíz de x³−4x−9 en [2,3]', r.root, 2.7065279545, 1e-6);
    checkTrue('cota de error final < 1e-6', r.rows[r.rows.length - 1].error < 1e-6);
    const bad = NM.bisection(f, 3, 4, 1e-6, 100);
    checkTrue('rechaza intervalo sin cambio de signo', !bad.ok);
}

// ================================================================
section('Corte I — Regla falsa');
// ================================================================
{
    const f = NM.makeFn('x^3 - 4*x - 9');
    const r = NM.falsePosition(f, 2, 3, 1e-8, 200);
    check('raíz de x³−4x−9', r.root, 2.7065279545, 1e-6);
}

// ================================================================
section('Corte I — Punto fijo');
// ================================================================
{
    const g = NM.makeFn('exp(-x)');
    const r = NM.fixedPoint(g, 0.5, 1e-8, 200);
    check('punto fijo de e^(−x) (constante omega)', r.root, 0.5671432904, 1e-6);
    const div = NM.fixedPoint(NM.makeFn('x^2 + 1'), 2, 1e-6, 50);
    checkTrue('reporta divergencia con g(x)=x²+1', !div.ok || div.rows[div.rows.length - 1].err > 1);
}

// ================================================================
section('Corte I — Newton-Raphson');
// ================================================================
{
    const f = NM.makeFn('x^3 - x - 2');
    const fp = NM.makeFn('3*x^2 - 1');
    const r = NM.newtonRaphson(f, fp, 1.5, 1e-10, 100);
    check('raíz de x³−x−2 (derivada analítica)', r.root, 1.5213797068, 1e-8);
    const r2 = NM.newtonRaphson(f, null, 1.5, 1e-10, 100);
    check('raíz con derivada numérica', r2.root, 1.5213797068, 1e-7);
    checkTrue('convergencia rápida (≤ 8 iteraciones)', r.rows.length <= 8, `(usó ${r.rows.length})`);
}

// ================================================================
section('Corte II — Sistemas lineales  [CASO OBLIGATORIO]');
// ================================================================
{
    const A = [[10, -1, 2], [1, 8, -1], [2, -1, 9]];
    const b = [7, 8, 6];
    // Solución exacta por eliminación gaussiana como referencia
    const exact = NM.gaussSolve(A, b);
    check('referencia (Gauss) x1', exact[0], 0.6739, 5e-5);
    check('referencia (Gauss) x2', exact[1], 0.9942, 5e-5);
    check('referencia (Gauss) x3', exact[2], 0.6274, 5e-5);

    const j = NM.jacobi(A, b, [0, 0, 0], 1e-8, 300);
    check('Jacobi x1', j.x[0], exact[0], 1e-6);
    check('Jacobi x2', j.x[1], exact[1], 1e-6);
    check('Jacobi x3', j.x[2], exact[2], 1e-6);

    const gs = NM.gaussSeidel(A, b, [0, 0, 0], 1e-8, 300);
    check('Gauss-Seidel x1', gs.x[0], exact[0], 1e-6);
    check('Gauss-Seidel x2', gs.x[1], exact[1], 1e-6);
    check('Gauss-Seidel x3', gs.x[2], exact[2], 1e-6);
    checkTrue('Gauss-Seidel más rápido que Jacobi', gs.rows.length < j.rows.length,
        `(GS ${gs.rows.length} vs J ${j.rows.length})`);
}

// ================================================================
section('Corte II — SOR');
// ================================================================
{
    const A = [[4, -1], [-1, 5]], b = [7, 8];
    const exact = [43 / 19, 39 / 19];
    const r = NM.sor(A, b, [0, 0], 1.1, 1e-10, 300);
    check('SOR x1 (43/19)', r.x[0], exact[0], 1e-8);
    check('SOR x2 (39/19)', r.x[1], exact[1], 1e-8);
    const r1 = NM.sor(A, b, [0, 0], 1.0, 1e-10, 300);
    const gs = NM.gaussSeidel(A, b, [0, 0], 1e-10, 300);
    checkTrue('SOR con ω=1 replica Gauss-Seidel', Math.abs(r1.x[0] - gs.x[0]) < 1e-12 && r1.rows.length === gs.rows.length);
}

// ================================================================
section('Corte II — Newton para sistemas no lineales');
// ================================================================
{
    const f1 = NM.makeFn('x^2 + y^2 - 4', ['x', 'y']);
    const f2 = NM.makeFn('x - y - 1', ['x', 'y']);
    const r = NM.newtonSystem([f1, f2], [1.5, 0.5], 1e-10, 50);
    const xExact = (1 + Math.sqrt(7)) / 2;
    check('x = (1+√7)/2', r.x[0], xExact, 1e-8);
    check('y = x − 1', r.x[1], xExact - 1, 1e-8);
    // 3 ecuaciones: esquina de esfera/planos → (1,1,1)
    const g1 = NM.makeFn('x^2 + y^2 + z^2 - 3', ['x', 'y', 'z']);
    const g2 = NM.makeFn('x - y', ['x', 'y', 'z']);
    const g3 = NM.makeFn('y - z', ['x', 'y', 'z']);
    const r3 = NM.newtonSystem([g1, g2, g3], [0.5, 0.5, 0.5], 1e-10, 50);
    check('sistema 3×3: x=y=z=1', r3.x[0], 1, 1e-8);
}

// ================================================================
section('Corte II — Interpolación');
// ================================================================
{
    const xs = [1, 2, 4], ys = [2, 3, 7];
    const dd = NM.dividedDifferences(xs, ys);
    check('f[x0,x1]', dd.table[1][0], 1, 1e-12);
    check('f[x1,x2]', dd.table[1][1], 2, 1e-12);
    check('f[x0,x1,x2]', dd.table[2][0], 1 / 3, 1e-12);
    const N = NM.newtonInterpEval(xs, dd.coefs, 3);
    const L = NM.lagrangeEval(xs, ys, 3);
    check('Newton P(3) = 14/3', N, 14 / 3, 1e-12);
    check('Lagrange P(3) = 14/3', L.P, 14 / 3, 1e-12);
    check('Newton ≡ Lagrange', N, L.P, 1e-12);
    // El polinomio pasa por los datos
    xs.forEach((x, i) => check(`P(${x}) = ${ys[i]}`, NM.newtonInterpEval(xs, dd.coefs, x), ys[i], 1e-12));
}

// ================================================================
section('Corte II — Integración numérica');
// ================================================================
{
    const f = NM.makeFn('x^2 + 1');
    const exact = 14 / 3; // ∫₀² (x²+1) dx
    check('trapecio n=4', NM.trapezoid(f, 0, 2, 4).I, 4.75, 1e-12);
    check('Simpson 1/3 n=4 (exacto en cúbicas)', NM.simpson13(f, 0, 2, 4).I, exact, 1e-12);
    check('Simpson 3/8 n=3 (exacto en cúbicas)', NM.simpson38(f, 0, 2, 3).I, exact, 1e-12);
    check('Gauss-Legendre 2 pts (exacto en cúbicas)', NM.gaussLegendre2(f, 0, 2).I, exact, 1e-12);
    checkTrue('Simpson 1/3 rechaza n impar', NM.simpson13(f, 0, 2, 5).ok === false);
    checkTrue('Simpson 3/8 rechaza n no múltiplo de 3', NM.simpson38(f, 0, 2, 4).ok === false);
    // Caso no polinómico con límites de expresión: ∫₀^π sin = 2
    const s = NM.makeFn('sin(x)');
    const PI = NM.evalConst('PI');
    check('∫₀^π sin(x) dx con Simpson 1/3 n=24', NM.simpson13(s, 0, PI, 24).I, 2, 1e-5);
}

// ================================================================
section('Corte III — Diferenciación');
// ================================================================
{
    const f = NM.makeFn('x^2');
    check('progresiva f=x², x₀=1, h=0.1', NM.diffForward(f, 1, 0.1), 2.1, 1e-10);
    check('regresiva', NM.diffBackward(f, 1, 0.1), 1.9, 1e-10);
    check('centrada (exacta en cuadráticas)', NM.diffCentral(f, 1, 0.1), 2.0, 1e-10);
    const g = NM.makeFn('x^3');
    check('segunda derivada f=x³, x₀=1 (exacta en cúbicas)', NM.diffSecond(g, 1, 0.1), 6, 1e-9);
}

// ================================================================
section('Corte III — Richardson');
// ================================================================
{
    check('D_R con D(h)=0.995, D(h/2)=0.99875, p=2', NM.richardson(0.995, 0.99875, 2), 1.0, 1e-12);
    // Richardson sobre derivada centrada real: f=sin, x0=1
    const f = Math.sin;
    const Dh = NM.diffCentral(f, 1, 0.2), Dh2 = NM.diffCentral(f, 1, 0.1);
    const DR = NM.richardson(Dh, Dh2, 2);
    checkTrue('Richardson mejora la centrada (sin, x₀=1)',
        Math.abs(DR - Math.cos(1)) < Math.abs(Dh2 - Math.cos(1)) / 10,
        `(err DR ${Math.abs(DR - Math.cos(1))}, err D(h/2) ${Math.abs(Dh2 - Math.cos(1))})`);
}

// ================================================================
section('Corte III — EDOs');
// ================================================================
{
    const f = NM.makeFn('x + y', ['x', 'y']);
    const exact05 = 2 * Math.exp(0.5) - 0.5 - 1;
    const e = NM.euler(f, 0, 1, 0.1, 5);
    check('Euler y(0.5), y′=x+y', e.y, 1.72102, 1e-5);
    const h2 = NM.rk2(f, 0, 1, 0.1, 5);
    check('RK2 (Heun) y(0.5)', h2.y, 1.79489353, 1e-6);
    checkTrue('RK2 más preciso que Euler', Math.abs(h2.y - exact05) < Math.abs(e.y - exact05));

    // [CASO OBLIGATORIO] RK4: y′ = y, y(0)=1, h=0.1 → y(1) = 2.71827974
    const g = NM.makeFn('y', ['x', 'y']);
    const r4 = NM.rk4(g, 0, 1, 0.1, 10);
    check('RK4 y(1) para y′=y  [OBLIGATORIO]', r4.y, 2.71827974, 5e-9);
    // Error global teórico de RK4 con h=0.1 en [0,1]: O(h⁴) ≈ 2e-6
    check('RK4 vs e (error de truncamiento ≤ 1e-5)', r4.y, Math.E, 1e-5);

    // Sistema: oscilador armónico → cos, −sin
    const f0 = NM.makeFn('y1', ['x', 'y0', 'y1']);
    const f1 = NM.makeFn('-y0', ['x', 'y0', 'y1']);
    const rs = NM.rk4System([f0, f1], 0, [1, 0], 0.1, 10);
    check('sistema EDO: y0(1) = cos(1)', rs.ys[0], Math.cos(1), 1e-6);
    check('sistema EDO: y1(1) = −sin(1)', rs.ys[1], -Math.sin(1), 1e-6);
}

// ================================================================
section('Smoke test — las 19 calculadoras de data.js (ambos modos)');
// ================================================================
{
    global.NM = NM;
    global.window = undefined;
    const { topics } = require('./data.js');
    checkTrue('data.js expone 19 temas', topics.length === 19, `(hay ${topics.length})`);
    for (const t of topics) {
        const vals = {};
        t.calcFields.forEach(fd => vals[fd.id] = String(fd.default !== undefined ? fd.default : ''));
        let ok = true, msg = '';
        for (const detailed of [false, true]) {
            try {
                const r = t.calculate(vals, detailed);
                if (!r || typeof r.html !== 'string') { ok = false; msg = 'sin html'; break; }
                if (/NaN|undefined/.test(r.html)) { ok = false; msg = 'NaN/undefined en salida'; break; }
            } catch (err) { ok = false; msg = err.message; break; }
        }
        checkTrue(`calculadora "${t.id}"`, ok, `(${msg})`);
    }
    const { THEORY } = require('./theory.js');
    checkTrue('theory.js cubre los 19 temas', topics.every(t => THEORY[t.id] && THEORY[t.id].length > 500));
    checkTrue('teoría sin NaN/undefined', topics.every(t => !/NaN|undefined/.test(THEORY[t.id])));
}

// ================================================================
//  RESUMEN
// ================================================================
console.log('\n' + '='.repeat(64));
console.log(`RESULTADO: ${passed} pasaron, ${failed} fallaron, ${passed + failed} en total`);
if (failed) {
    console.log('Fallos:\n  - ' + failures.join('\n  - '));
    process.exit(1);
} else {
    console.log('✅ Todos los métodos validados.');
}
