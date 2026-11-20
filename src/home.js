(() => {
  const main = document.querySelector('.home-main');
  const header = document.querySelector('.site-header');
  const chapters = [...main.querySelectorAll('.home-chapter')];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 1024px) and (min-height: 600px)');
  let starts = [];
  let themes = [];
  let enabled = false;
  let frame = 0;
  const headerTheme = SCHeaderTheme(header);
  let wheelTarget = null;
  let wheelTotal = 0;
  let wheelTime = 0;
  let wheelDirection = 0;
  let gestureTimer = 0;
  const releaseWheel = () => {
    wheelTarget = null;
    wheelTotal = 0;
    wheelTime = 0;
    clearTimeout(gestureTimer);
    delete main.dataset.chapterGesture;
  };
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const render = () => {
    frame = 0;
    const height = innerHeight - 72;
    const tops = enabled ? starts.map((start) => start - scrollY + 72) : chapters.map((chapter) => chapter.getBoundingClientRect().top);
    const headerHeight = header.offsetHeight;
    let active = 0;
    chapters.forEach((chapter, index) => {
      if (tops[index] <= headerHeight + innerHeight * .25) active = index;
      if (!enabled) return;
      const progress = index === chapters.length - 1 ? 0 : clamp((scrollY - starts[index]) / height);
      const entrance = index === 0 ? 0 : clamp((starts[index] - scrollY) / height);
      chapter.style.setProperty('--chapter-scale', String(1 - progress * .045));
      chapter.style.setProperty('--chapter-shade', String(progress * .16));
      chapter.style.setProperty('--chapter-radius', `${entrance * 28}px`);
    });
    headerTheme.apply(themes, active);
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
  const configure = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    releaseWheel();
    document.documentElement.classList.remove('chapter-mode');
    main.classList.remove('chapter-stack');
    chapters.forEach((chapter) => {
      chapter.style.removeProperty('--chapter-scale');
      chapter.style.removeProperty('--chapter-shade');
      chapter.style.removeProperty('--chapter-radius');
    });
    starts = chapters.map((chapter) => chapter.previousElementSibling.offsetTop - 72);
    themes = headerTheme.read(chapters);
    headerTheme.reset();
    enabled = desktop.matches && !motion.matches && chapters.every((chapter) => chapter.offsetHeight <= innerHeight - 70);
    main.classList.toggle('chapter-stack', enabled);
    document.documentElement.classList.toggle('chapter-mode', enabled);
    render();
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('scrollend', () => {
    if (wheelTarget !== null && Math.abs(scrollY - wheelTarget) > 2) releaseWheel();
  });
  document.addEventListener('keydown', (event) => {
    if (['PageDown', 'PageUp', 'Home', 'End', 'ArrowDown', 'ArrowUp', ' '].includes(event.key)) releaseWheel();
  });
  document.addEventListener('pointerdown', releaseWheel);
  document.addEventListener('wheel', (event) => {
    if (!enabled || event.defaultPrevented || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (!delta) return;
    const now = performance.now();
    const idle = now - wheelTime > 180;
    const direction = Math.sign(delta);
    wheelTime = now;
    main.dataset.chapterGesture = 'true';
    clearTimeout(gestureTimer);
    gestureTimer = setTimeout(() => { delete main.dataset.chapterGesture; }, 180);
    if (wheelTarget !== null) {
      if (Math.abs(scrollY - wheelTarget) > 2 || (!idle && direction === wheelDirection)) {
        event.preventDefault();
        return;
      }
      wheelTarget = null;
    }
    const targets = [...starts, document.documentElement.scrollHeight - innerHeight];
    const nearest = targets.reduce((best, target, index) => Math.abs(target - scrollY) < Math.abs(targets[best] - scrollY) ? index : best, 0);
    const next = nearest + direction;
    if (next < 0 || next >= targets.length) return;
    event.preventDefault();
    if (idle || direction !== wheelDirection) wheelTotal = 0;
    wheelDirection = direction;
    wheelTotal += delta;
    if (Math.abs(wheelTotal) < 40) return;
    wheelTotal = 0;
    wheelTarget = targets[next];
    window.scrollTo({ top: wheelTarget, behavior: 'smooth' });
  }, { passive: false });
  window.addEventListener('resize', configure);
  motion.addEventListener('change', configure);
  desktop.addEventListener('change', configure);
  document.addEventListener('focusin', (event) => {
    if (!enabled) return;
    const index = chapters.findIndex((chapter) => chapter.contains(event.target));
    if (index >= 0 && Math.abs(scrollY - starts[index]) > (innerHeight - 72) / 2) {
      releaseWheel();
      window.scrollTo({ top: starts[index], behavior: 'instant' });
    }
  });
  configure();
  const followHash = () => {
    if (enabled && location.hash === '#origins') window.scrollTo({ top: starts[3], behavior: 'instant' });
  };
  window.addEventListener('hashchange', followHash);
  window.addEventListener('pageshow', followHash);
  document.fonts.ready.then(() => { configure(); followHash(); });
})();

(() => {
  const carousel = document.querySelector('.home-carousel');
  const stage = carousel.querySelector('.home-carousel-viewport');
  const slides = [...carousel.querySelectorAll('.home-work')];
  if (slides.length < 3) return;
  const controls = carousel.querySelector('.home-carousel-controls');
  const position = carousel.querySelector('.carousel-position');
  const play = carousel.querySelector('.carousel-play');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const followingChapter = document.querySelector('.home-process');
  let selected = 0;
  let playing = !motion.matches;
  let timer = 0;
  let hovered = false;
  let touchStart = null;
  let wheelTotal = 0;
  let wheelTime = 0;
  let wheelLockedUntil = 0;
  let wheelEligible = false;

  const isVisible = () => {
    const bounds = stage.getBoundingClientRect();
    return bounds.top >= 60 && bounds.bottom <= innerHeight + 20 && followingChapter.getBoundingClientRect().top >= innerHeight - 40;
  };
  const schedule = () => {
    clearTimeout(timer);
    const running = playing && !motion.matches && !document.hidden && !hovered && !carousel.contains(document.activeElement) && isVisible();
    carousel.dataset.autoplay = running ? 'running' : 'paused';
    position.setAttribute('aria-live', running ? 'off' : 'polite');
    if (running) timer = setTimeout(() => move(1), 4500);
  };
  const update = () => {
    slides.forEach((slide, index) => {
      let offset = (index - selected + slides.length) % slides.length;
      if (offset > slides.length / 2) offset -= slides.length;
      const distance = Math.abs(offset);
      const shift = Math.max(-3, Math.min(3, offset));
      slide.dataset.position = String(offset);
      slide.inert = offset !== 0;
      slide.setAttribute('aria-hidden', String(offset !== 0));
      slide.style.visibility = distance > 2 ? 'hidden' : '';
      slide.style.setProperty('--card-shift', `${shift * 55}%`);
      slide.style.setProperty('--card-scale', String(distance === 0 ? 1 : distance === 1 ? .76 : .54));
      slide.style.setProperty('--card-turn', `${shift * -10}deg`);
      slide.style.setProperty('--card-depth', String(5 - distance));
      slide.style.setProperty('--card-opacity', distance > 2 ? '0' : distance === 2 ? '.3' : '1');
      slide.style.setProperty('--card-light', distance === 0 ? '1' : '.7');
      if (distance <= 1) slide.querySelector('img').loading = 'eager';
    });
    position.textContent = `${String(selected + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    play.classList.toggle('is-playing', playing);
    play.setAttribute('aria-label', playing ? play.dataset.pauseLabel : play.dataset.playLabel);
    play.disabled = motion.matches;
    schedule();
  };
  const move = (direction) => {
    selected = (selected + direction + slides.length) % slides.length;
    update();
  };
  slides.forEach((slide) => { slide.hidden = false; });
  carousel.classList.add('carousel-ready');
  controls.hidden = false;
  update();
  controls.addEventListener('click', (event) => {
    const button = event.target.closest('[data-carousel-direction]');
    if (button) move(Number(button.dataset.carouselDirection));
  });
  play.addEventListener('click', () => { playing = !playing; update(); });
  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { carousel.blur(); return; }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    carousel.focus({ preventScroll: true });
    move(event.key === 'ArrowLeft' ? -1 : 1);
  });
  stage.addEventListener('wheel', (event) => {
    if (event.ctrlKey) return;
    const now = performance.now();
    if (now - wheelTime > 180) {
      wheelTotal = 0;
      wheelEligible = isVisible() && !document.querySelector('.home-main').dataset.chapterGesture;
    }
    wheelTime = now;
    if (!wheelEligible || !isVisible()) return;
    event.preventDefault();
    if (now < wheelLockedUntil) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    wheelTotal += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (Math.abs(wheelTotal) < 35) return;
    move(wheelTotal > 0 ? 1 : -1);
    wheelTotal = 0;
    wheelLockedUntil = now + 700;
  }, { passive: false });
  carousel.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    touchStart = { horizontal: touch.clientX, vertical: touch.clientY };
  }, { passive: true });
  carousel.addEventListener('touchend', (event) => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const horizontal = touch.clientX - touchStart.horizontal;
    const vertical = touch.clientY - touchStart.vertical;
    touchStart = null;
    if (Math.abs(horizontal) > 50 && Math.abs(horizontal) > Math.abs(vertical) * 1.5) move(horizontal < 0 ? 1 : -1);
  }, { passive: true });
  carousel.addEventListener('touchcancel', () => { touchStart = null; });
  carousel.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  carousel.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  carousel.addEventListener('focusin', schedule);
  carousel.addEventListener('focusout', () => setTimeout(schedule, 0));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => { if (motion.matches) playing = false; update(); });
})();

(() => {
  const chapter = document.querySelector('.home-closing');
  const orbit = chapter.querySelector('.closing-orbit');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia('(pointer: fine)');
  let angle = -12;
  const rotate = (target) => {
    angle += ((target - angle + 180) % 360 + 360) % 360 - 180;
    orbit.style.setProperty('--orbit-angle', `${angle}deg`);
  };
  const reset = () => {
    orbit.style.removeProperty('--orbit-x');
    orbit.style.removeProperty('--orbit-y');
    if (motion.matches || !pointer.matches) {
      angle = -12;
      orbit.style.removeProperty('--orbit-angle');
    } else rotate(-12);
  };
  chapter.addEventListener('pointermove', (event) => {
    if (motion.matches || !pointer.matches) return;
    const bounds = orbit.getBoundingClientRect();
    const horizontal = event.clientX - (bounds.left + bounds.width / 2);
    const vertical = event.clientY - (bounds.top + bounds.height / 2);
    orbit.style.setProperty('--orbit-x', `${Math.max(-12, Math.min(12, horizontal / 30))}px`);
    orbit.style.setProperty('--orbit-y', `${Math.max(-12, Math.min(12, vertical / 30))}px`);
    if (Math.hypot(horizontal, vertical) > 8) rotate(Math.atan2(vertical, horizontal) * 180 / Math.PI + 45);
  });
  chapter.addEventListener('pointerleave', reset);
  motion.addEventListener('change', reset);
  pointer.addEventListener('change', reset);
})();
