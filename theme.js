// theme.js
(function() {
    const toggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    toggle.textContent = currentTheme === 'dark' ? '☀️ Modo claro' : '🌙 Modo oscuro';

    toggle.addEventListener('click', function() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        this.textContent = next === 'dark' ? '☀️ Modo claro' : '🌙 Modo oscuro';
    });
})();