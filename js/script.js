/**
 * Arandu Solutions - Apresentação Comercial
 * Navegação por slides, progresso, animações e parallax
 */

(function () {
  'use strict';

  // --- Elementos do DOM ---
  const slides = document.querySelectorAll('.slide');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const progressBar = document.getElementById('progressBar');
  const slideCounter = document.getElementById('slideCounter');
  const navDotsContainer = document.getElementById('navDots');
  const parallaxLayers = document.querySelectorAll('.parallax-layer');

  const TOTAL_SLIDES = slides.length;
  let currentSlide = 0;
  let isTransitioning = false;

  /**
   * Inicializa os indicadores de navegação (dots)
   */
  function initNavDots() {
    for (let i = 0; i < TOTAL_SLIDES; i++) {
      const dot = document.createElement('button');
      dot.classList.add('nav-dot');
      dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      navDotsContainer.appendChild(dot);
    }
  }

  /**
   * Atualiza a barra de progresso e o contador
   */
  function updateProgress() {
    const progress = ((currentSlide + 1) / TOTAL_SLIDES) * 100;
    progressBar.style.width = `${progress}%`;
    slideCounter.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(TOTAL_SLIDES).padStart(2, '0')}`;
  }

  /**
   * Atualiza os dots de navegação
   */
  function updateDots() {
    const dots = navDotsContainer.querySelectorAll('.nav-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });
  }

  /**
   * Atualiza estado dos botões Anterior/Próximo
   */
  function updateButtons() {
    btnPrev.disabled = currentSlide === 0;
    btnNext.disabled = currentSlide === TOTAL_SLIDES - 1;
  }

  /**
   * Reinicia animações de entrada do slide ativo
   */
  function triggerSlideAnimations(slide) {
    const animated = slide.querySelector('.animate-in');
    if (!animated) return;

    // Força reflow para reiniciar animações CSS
    animated.querySelectorAll('*').forEach((el) => {
      el.style.animation = 'none';
      el.offsetHeight; // eslint-disable-line no-unused-expressions
      el.style.animation = '';
    });
  }

  /**
   * Navega para um slide específico
   * @param {number} index - Índice do slide (0-based)
   */
  function goToSlide(index) {
    if (isTransitioning || index === currentSlide || index < 0 || index >= TOTAL_SLIDES) {
      return;
    }

    isTransitioning = true;
    const direction = index > currentSlide ? 'next' : 'prev';

    // Remove classe active do slide atual
    slides[currentSlide].classList.remove('active');
    if (direction === 'prev') {
      slides[currentSlide].classList.add('prev');
    }

    currentSlide = index;

    // Ativa o novo slide
    slides.forEach((slide, i) => {
      slide.classList.remove('prev');
      if (i === currentSlide) {
        slide.classList.add('active');
        triggerSlideAnimations(slide);
      }
    });

    updateProgress();
    updateDots();
    updateButtons();

    // Scroll suave para o topo do slide em mobile
    const activeSlide = slides[currentSlide];
    if (activeSlide) {
      activeSlide.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setTimeout(() => {
      isTransitioning = false;
    }, 400);
  }

  /**
   * Avança para o próximo slide
   */
  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  /**
   * Volta para o slide anterior
   */
  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  /**
   * Efeito parallax suave no background
   */
  function initParallax() {
    let ticking = false;

    document.addEventListener('mousemove', (e) => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;

        parallaxLayers.forEach((layer, index) => {
          const speed = (index + 1) * 15;
          layer.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });

        ticking = false;
      });
    });

    // Parallax leve em dispositivos touch via orientação do scroll do slide
    slides.forEach((slide) => {
      slide.addEventListener('scroll', () => {
        if (!slide.classList.contains('active')) return;
        const scrollRatio = slide.scrollTop / (slide.scrollHeight - slide.clientHeight || 1);
        parallaxLayers[2].style.transform = `translate(-50%, calc(-50% + ${scrollRatio * 30}px))`;
      });
    });
  }

  /**
   * Suporte a navegação por teclado
   */
  function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prevSlide();
      }
    });
  }

  /**
   * Suporte a swipe em dispositivos móveis
   */
  function initTouchNav() {
    let touchStartX = 0;
    let touchEndX = 0;
    const SWIPE_THRESHOLD = 50;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) < SWIPE_THRESHOLD) return;

      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }, { passive: true });
  }

  /**
   * Botões com data-action="next" avançam o slide
   */
  function initCTAButtons() {
    document.querySelectorAll('[data-action="next"]').forEach((btn) => {
      btn.addEventListener('click', nextSlide);
    });
  }

  /**
   * Inicialização
   */
  function init() {
    initNavDots();
    updateProgress();
    updateButtons();
    initParallax();
    initKeyboardNav();
    initTouchNav();
    initCTAButtons();

    btnPrev.addEventListener('click', prevSlide);
    btnNext.addEventListener('click', nextSlide);
  }

  // Aguarda DOM pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
