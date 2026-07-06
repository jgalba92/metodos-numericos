// nm-core.js — Pure numerical algorithms (no DOM).
// Used by the browser calculators, the theory examples and the Node test harness.
(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root.NM = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // ---------- Expression parsing ----------
    // Converts user notation (^, sin, ln, pi, e...) into evaluable JS.
    function parseExpr(raw) {
        if (raw === undefined || raw === null || !String(raw).trim()) return null;
        let s = String(raw).trim();
        // Powers: a^b -> a**b (right assoc handled by JS **)
        s = s.replace(/\^/g, '**');
        s = s.replace(/\bln\b/g, 'Math.log');
        s = s.replace(/\blog10\b/g, 'Math.log10');
        s = s.replace(/\blog\b/g, 'Math.log10');
        s = s.replace(/\bexp\b/g, 'Math.exp');
        s = s.replace(/\bsqrt\b/g, 'Math.sqrt');
        s = s.replace(/\bcbrt\b/g, 'Math.cbrt');
        s = s.replace(/\basin\b/g, 'Math.asin');
        s = s.replace(/\bacos\b/g, 'Math.acos');
        s = s.replace(/\batan\b/g, 'Math.atan');
        s = s.replace(/\bsinh\b/g, 'Math.sinh');
        s = s.replace(/\bcosh\b/g, 'Math.cosh');
        s = s.replace(/\btanh\b/g, 'Math.tanh');
        s = s.replace(/\bsin\b/g, 'Math.sin');
        s = s.replace(/\bcos\b/g, 'Math.cos');
        s = s.replace(/\btan\b/g, 'Math.tan');
        s = s.replace(/\babs\b/g, 'Math.abs');
        s = s.replace(/\bpi\b/gi, 'Math.PI');
        // Standalone e as Euler constant (not part of identifier / not exponent like 1e-6)
        s = s.replace(/(^|[^\w.])e(?![\w(])/g, '$1Math.E');
        // Undo accidental replacements inside Math.xxx
        s = s.replace(/Math\.Math\./g, 'Math.');
        return s;
    }

    function makeFn(raw, vars) {
        const parsed = parseExpr(raw);
        if (parsed === null) return null;
        const args = vars || ['x'];
        let fn;
        try {
            fn = new Function(...args, `"use strict"; return (${parsed});`);
        } catch (e) { return null; }
        return function (...a) {
            try {
                const v = fn(...a);
                return (typeof v === 'number' && isFinite(v)) ? v : NaN;
            } catch (e) { return NaN; }
        };
    }

    // Evaluates a constant expression like "PI/2", "sqrt(2)", "exp(1)".
    function evalConst(raw) {
        const f = makeFn(raw, ['__unused']);
        if (!f) return NaN;
        return f(0);
    }

    // ---------- Corte I ----------
    function errors(exact, approx) {
        const ea = Math.abs(exact - approx);
        const er = exact !== 0 ? ea / Math.abs(exact) : NaN;
        return { ea, er, ep: er * 100 };
    }

    // Incremental search / root isolation
    function incrementalSearch(f, a, b, step) {
        const rows = [];
        const intervals = [];
        let x = a, fx = f(x);
        while (x < b - 1e-12) {
            const xNext = Math.min(x + step, b);
            const fNext = f(xNext);
            const change = fx * fNext < 0;
            rows.push({ x1: x, x2: xNext, f1: fx, f2: fNext, change });
            if (change) intervals.push([x, xNext]);
            x = xNext; fx = fNext;
        }
        return { rows, intervals };
    }

    function bisection(f, a, b, tol, maxIter) {
        if (f(a) * f(b) >= 0) return { ok: false, reason: 'no-sign-change', rows: [] };
        const rows = [];
        let c, fc;
        for (let i = 0; i < maxIter; i++) {
            c = (a + b) / 2; fc = f(c);
            const error = (b - a) / 2;
            rows.push({ iter: i + 1, a, b, fa: f(a), fb: f(b), c, fc, error });
            if (Math.abs(fc) < tol || error < tol) break;
            if (f(a) * fc < 0) b = c; else a = c;
        }
        return { ok: true, root: c, froot: fc, rows };
    }

    function falsePosition(f, a, b, tol, maxIter) {
        if (f(a) * f(b) >= 0) return { ok: false, reason: 'no-sign-change', rows: [] };
        const rows = [];
        let c = a, fc;
        for (let i = 0; i < maxIter; i++) {
            const fa = f(a), fb = f(b);
            if (fa === fb) break;
            const cPrev = c;
            c = b - fb * (b - a) / (fb - fa);
            fc = f(c);
            const error = i === 0 ? Math.abs(b - a) : Math.abs(c - cPrev);
            rows.push({ iter: i + 1, a, b, fa, fb, c, fc, error });
            if (Math.abs(fc) < tol || (i > 0 && error < tol)) break;
            if (fa * fc < 0) b = c; else a = c;
        }
        return { ok: true, root: c, froot: fc, rows };
    }

    function fixedPoint(g, x0, tol, maxIter) {
        const rows = [];
        let x = x0, xn;
        for (let i = 0; i < maxIter; i++) {
            xn = g(x);
            if (!isFinite(xn)) return { ok: false, reason: 'diverged', rows };
            const err = Math.abs(xn - x);
            rows.push({ iter: i + 1, x, xn, err });
            if (err < tol) break;
            x = xn;
        }
        return { ok: true, root: xn, rows };
    }

    function newtonRaphson(f, fp, x0, tol, maxIter) {
        const rows = [];
        let x = x0, xn;
        const dfp = fp || (x => (f(x + 1e-7) - f(x - 1e-7)) / 2e-7);
        for (let i = 0; i < maxIter; i++) {
            const fx = f(x), fpx = dfp(x);
            if (Math.abs(fpx) < 1e-15) return { ok: false, reason: 'zero-derivative', rows };
            xn = x - fx / fpx;
            const err = Math.abs(xn - x);
            rows.push({ iter: i + 1, x, fx, fpx, xn, err });
            if (err < tol) break;
            x = xn;
        }
        return { ok: true, root: xn, froot: f(xn), rows };
    }

    // ---------- Corte II ----------
    function jacobi(A, b, x0, tol, maxIter) {
        const n = b.length;
        let x = x0.slice();
        const rows = [];
        for (let k = 0; k < maxIter; k++) {
            const xn = new Array(n).fill(0);
            for (let i = 0; i < n; i++) {
                let sum = 0;
                for (let j = 0; j < n; j++) if (j !== i) sum += A[i][j] * x[j];
                xn[i] = (b[i] - sum) / A[i][i];
            }
            const err = Math.max(...xn.map((v, i) => Math.abs(v - x[i])));
            rows.push({ iter: k + 1, x: xn.slice(), err });
            x = xn;
            if (err < tol) break;
        }
        return { ok: true, x, rows };
    }

    function gaussSeidel(A, b, x0, tol, maxIter) {
        const n = b.length;
        let x = x0.slice();
        const rows = [];
        for (let k = 0; k < maxIter; k++) {
            const xPrev = x.slice();
            for (let i = 0; i < n; i++) {
                let sum = 0;
                for (let j = 0; j < n; j++) if (j !== i) sum += A[i][j] * x[j];
                x[i] = (b[i] - sum) / A[i][i];
            }
            const err = Math.max(...x.map((v, i) => Math.abs(v - xPrev[i])));
            rows.push({ iter: k + 1, x: x.slice(), err });
            if (err < tol) break;
        }
        return { ok: true, x, rows };
    }

    function sor(A, b, x0, omega, tol, maxIter) {
        const n = b.length;
        let x = x0.slice();
        const rows = [];
        for (let k = 0; k < maxIter; k++) {
            const xPrev = x.slice();
            for (let i = 0; i < n; i++) {
                let sum = 0;
                for (let j = 0; j < n; j++) if (j !== i) sum += A[i][j] * x[j];
                const xGS = (b[i] - sum) / A[i][i];
                x[i] = (1 - omega) * xPrev[i] + omega * xGS;
            }
            const err = Math.max(...x.map((v, i) => Math.abs(v - xPrev[i])));
            rows.push({ iter: k + 1, x: x.slice(), err });
            if (err < tol) break;
        }
        return { ok: true, x, rows };
    }

    // Newton for nonlinear systems (n equations, numeric Jacobian + Gaussian elim.)
    function gaussSolve(Ain, bin) {
        const n = bin.length;
        const A = Ain.map(r => r.slice());
        const b = bin.slice();
        for (let col = 0; col < n; col++) {
            let piv = col;
            for (let r = col + 1; r < n; r++) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
            if (Math.abs(A[piv][col]) < 1e-14) return null;
            [A[col], A[piv]] = [A[piv], A[col]];
            [b[col], b[piv]] = [b[piv], b[col]];
            for (let r = col + 1; r < n; r++) {
                const m = A[r][col] / A[col][col];
                for (let c = col; c < n; c++) A[r][c] -= m * A[col][c];
                b[r] -= m * b[col];
            }
        }
        const x = new Array(n).fill(0);
        for (let r = n - 1; r >= 0; r--) {
            let s = b[r];
            for (let c = r + 1; c < n; c++) s -= A[r][c] * x[c];
            x[r] = s / A[r][r];
        }
        return x;
    }

    function newtonSystem(fs, x0, tol, maxIter) {
        const n = fs.length;
        let x = x0.slice();
        const rows = [];
        const h = 1e-7;
        for (let k = 0; k < maxIter; k++) {
            const F = fs.map(f => f(...x));
            const J = [];
            for (let i = 0; i < n; i++) {
                J.push([]);
                for (let j = 0; j < n; j++) {
                    const xp = x.slice(), xm = x.slice();
                    xp[j] += h; xm[j] -= h;
                    J[i].push((fs[i](...xp) - fs[i](...xm)) / (2 * h));
                }
            }
            const d = gaussSolve(J, F.map(v => -v));
            if (!d) return { ok: false, reason: 'singular-jacobian', rows };
            const xn = x.map((v, i) => v + d[i]);
            const err = Math.max(...d.map(Math.abs));
            rows.push({ iter: k + 1, x: x.slice(), F: F.slice(), d: d.slice(), xn: xn.slice(), err });
            x = xn;
            if (err < tol) break;
        }
        return { ok: true, x, rows };
    }

    // Interpolation
    function dividedDifferences(xs, ys) {
        const n = xs.length;
        const table = [ys.slice()];
        for (let k = 1; k < n; k++) {
            const col = [];
            for (let i = 0; i < n - k; i++) {
                col.push((table[k - 1][i + 1] - table[k - 1][i]) / (xs[i + k] - xs[i]));
            }
            table.push(col);
        }
        const coefs = table.map(col => col[0]);
        return { table, coefs };
    }

    function newtonInterpEval(xs, coefs, x) {
        let res = coefs[0], term = 1;
        for (let i = 1; i < coefs.length; i++) {
            term *= (x - xs[i - 1]);
            res += coefs[i] * term;
        }
        return res;
    }

    function lagrangeEval(xs, ys, x) {
        const n = xs.length;
        let P = 0;
        const terms = [];
        for (let i = 0; i < n; i++) {
            let L = 1;
            for (let j = 0; j < n; j++) if (j !== i) L *= (x - xs[j]) / (xs[i] - xs[j]);
            terms.push({ i, L, contrib: ys[i] * L });
            P += ys[i] * L;
        }
        return { P, terms };
    }

    // Integration
    function trapezoid(f, a, b, n) {
        const h = (b - a) / n;
        const xs = Array.from({ length: n + 1 }, (_, i) => a + i * h);
        const fs = xs.map(f);
        const I = h / 2 * (fs[0] + 2 * fs.slice(1, -1).reduce((p, c) => p + c, 0) + fs[n]);
        return { I, h, xs, fs };
    }

    function simpson13(f, a, b, n) {
        if (n % 2 !== 0) return { ok: false, reason: 'n-must-be-even' };
        const h = (b - a) / n;
        const xs = Array.from({ length: n + 1 }, (_, i) => a + i * h);
        const fs = xs.map(f);
        let S = fs[0] + fs[n];
        for (let i = 1; i < n; i++) S += (i % 2 === 0 ? 2 : 4) * fs[i];
        return { ok: true, I: S * h / 3, h, xs, fs };
    }

    function simpson38(f, a, b, n) {
        if (n % 3 !== 0) return { ok: false, reason: 'n-must-be-multiple-of-3' };
        const h = (b - a) / n;
        const xs = Array.from({ length: n + 1 }, (_, i) => a + i * h);
        const fs = xs.map(f);
        let S = fs[0] + fs[n];
        for (let i = 1; i < n; i++) S += (i % 3 === 0 ? 2 : 3) * fs[i];
        return { ok: true, I: S * 3 * h / 8, h, xs, fs };
    }

    function gaussLegendre2(f, a, b) {
        const t = 1 / Math.sqrt(3);
        const x1 = (b - a) / 2 * (-t) + (a + b) / 2;
        const x2 = (b - a) / 2 * t + (a + b) / 2;
        return { I: (b - a) / 2 * (f(x1) + f(x2)), x1, x2 };
    }

    // ---------- Corte III ----------
    function diffForward(f, x0, h) { return (f(x0 + h) - f(x0)) / h; }
    function diffBackward(f, x0, h) { return (f(x0) - f(x0 - h)) / h; }
    function diffCentral(f, x0, h) { return (f(x0 + h) - f(x0 - h)) / (2 * h); }
    function diffSecond(f, x0, h) { return (f(x0 + h) - 2 * f(x0) + f(x0 - h)) / (h * h); }

    function richardson(Dh, Dh2, p) {
        const twoP = Math.pow(2, p);
        return (twoP * Dh2 - Dh) / (twoP - 1);
    }

    function euler(f, x0, y0, h, n) {
        const rows = [{ i: 0, x: x0, y: y0 }];
        let x = x0, y = y0;
        for (let i = 0; i < n; i++) {
            const slope = f(x, y);
            y = y + h * slope;
            x = x + h;
            rows.push({ i: i + 1, x, y, slope });
        }
        return { x, y, rows };
    }

    function rk2(f, x0, y0, h, n) {
        const rows = [{ i: 0, x: x0, y: y0 }];
        let x = x0, y = y0;
        for (let i = 0; i < n; i++) {
            const k1 = f(x, y);
            const k2 = f(x + h, y + h * k1);
            y = y + h / 2 * (k1 + k2);
            x = x + h;
            rows.push({ i: i + 1, x, y, k1, k2 });
        }
        return { x, y, rows };
    }

    function rk4(f, x0, y0, h, n) {
        const rows = [{ i: 0, x: x0, y: y0 }];
        let x = x0, y = y0;
        for (let i = 0; i < n; i++) {
            const k1 = f(x, y);
            const k2 = f(x + h / 2, y + h / 2 * k1);
            const k3 = f(x + h / 2, y + h / 2 * k2);
            const k4 = f(x + h, y + h * k3);
            y = y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4);
            x = x + h;
            rows.push({ i: i + 1, x, y, k1, k2, k3, k4 });
        }
        return { x, y, rows };
    }

    // System of m first-order ODEs solved with RK4. fs: array of f(x, ...ys)
    function rk4System(fs, x0, ys0, h, n) {
        const m = fs.length;
        let x = x0, ys = ys0.slice();
        const rows = [{ i: 0, x, ys: ys.slice() }];
        for (let s = 0; s < n; s++) {
            const k1 = fs.map(f => f(x, ...ys));
            const y2 = ys.map((y, j) => y + h / 2 * k1[j]);
            const k2 = fs.map(f => f(x + h / 2, ...y2));
            const y3 = ys.map((y, j) => y + h / 2 * k2[j]);
            const k3 = fs.map(f => f(x + h / 2, ...y3));
            const y4 = ys.map((y, j) => y + h * k3[j]);
            const k4 = fs.map(f => f(x + h, ...y4));
            ys = ys.map((y, j) => y + h / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
            x = x + h;
            rows.push({ i: s + 1, x, ys: ys.slice(), k1, k2, k3, k4 });
        }
        return { x, ys, rows };
    }

    return {
        parseExpr, makeFn, evalConst,
        errors, incrementalSearch, bisection, falsePosition, fixedPoint, newtonRaphson,
        jacobi, gaussSeidel, sor, gaussSolve, newtonSystem,
        dividedDifferences, newtonInterpEval, lagrangeEval,
        trapezoid, simpson13, simpson38, gaussLegendre2,
        diffForward, diffBackward, diffCentral, diffSecond, richardson,
        euler, rk2, rk4, rk4System
    };
});
