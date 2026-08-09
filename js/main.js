document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    // Toggle para abrir y cerrar el menú principal
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('show');
        });
    }

    // Comportamiento acordeón para los submenús (Productos / Cursos)
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const parent = toggle.closest('.dropdown');

            // Cierra los otros submenús abiertos
            document.querySelectorAll('.dropdown').forEach(item => {
                if (item !== parent) {
                    item.classList.remove('open');
                }
            });

            // Abre o cierra el actual
            parent.classList.toggle('open');
        });
    });

    // Cerrar menú si el usuario hace clic fuera de él
    document.addEventListener('click', (e) => {
        if (navMenu && navMenu.classList.contains('show')) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('show');
                document.querySelectorAll('.dropdown').forEach(item => {
                    item.classList.remove('open');
                });
            }
        }
    });
});