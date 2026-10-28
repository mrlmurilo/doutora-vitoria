/**
 * Portfólio Vitória Tozzi
 * Navegação por seções no desktop e animações de entrada persistentes.
 */
(() => {
  'use strict';

  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.main-nav');
  const header = document.querySelector('.site-header');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 769px) and (pointer: fine)');

  function closeMenu() {
    if (!menuButton || !navigation) return;
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
  }

  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const opened = navigation.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(opened));
      menuButton.setAttribute('aria-label', opened ? 'Fechar menu' : 'Abrir menu');
    });

    navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', e => {
      if (!navigation.contains(e.target) && !menuButton.contains(e.target)) closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 720) closeMenu();
    });
  }
  
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('visible', entry.isIntersecting);
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -15px 0px'
    });

    revealElements.forEach(element => observer.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add('visible'));
  }


  // Seções de navegação: hero, apresentação, interesses, trajetória,
  // pesquisa, contato e rodapé. A barra fixa é descontada do destino.
  const sections = [...document.querySelectorAll('main > section'), document.querySelector('.site-footer')]
    .filter(Boolean);
  let lockedUntil = 0;

  function headerHeight() {
    return header ? header.getBoundingClientRect().height : 0;
  }

  function sectionTop(section) {
    const pageTop = section.getBoundingClientRect().top + window.scrollY;
    return Math.max(0, pageTop - (section.classList.contains('hero') ? headerHeight() : headerHeight()));
  }

  function onWheel(event) {
    // Teclado, celular, trackpad com gesto horizontal e zoom continuam nativos.
    if (!desktop.matches || reducedMotion.matches || event.ctrlKey || event.metaKey ||
      Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;

    if (event.target.closest('[data-native-scroll], textarea, select, [contenteditable="true"]')) return;

    const direction = Math.sign(event.deltaY);
    const top = window.scrollY;
    const availableHeight = window.innerHeight - headerHeight();
    const tolerance = 5;
    const now = performance.now();

    if (now < lockedUntil) {
      event.preventDefault();
      return;
    }

    // Localiza a seção atualmente visível pelo topo útil da janela.
    let currentIndex = 0;
    sections.forEach((section, index) => {
      if (sectionTop(section) <= top + tolerance) currentIndex = index;
    });

    const current = sections[currentIndex];
    const currentTop = sectionTop(current);
    const currentEnd = current.getBoundingClientRect().bottom + top;
    const nextIndex = currentIndex + direction;

    // Em seções maiores que a janela, permita ler todo o conteúdo sem pular partes.
    if (direction > 0 && current.getBoundingClientRect().height > availableHeight + 12 &&
      top + window.innerHeight < currentEnd - tolerance) return;
    if (direction < 0 && current.getBoundingClientRect().height > availableHeight + 12 &&
      top > currentTop + tolerance) return;

    if (nextIndex < 0 || nextIndex >= sections.length) return;

    event.preventDefault();
    lockedUntil = now + 900; // Impede que um único gesto pule várias seções.
    window.scrollTo({ top: sectionTop(sections[nextIndex]), behavior: 'smooth' });
  }

  // passive:false é necessário para interromper o scroll padrão do wheel.
  window.addEventListener('wheel', onWheel, { passive: false });

  // Links de âncora também deixam a navegação por seções fluida.
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => { lockedUntil = performance.now() + 900; });
  });

  const yearElement = document.getElementById('year');
  if (yearElement) yearElement.textContent = String(new Date().getFullYear());
})();
