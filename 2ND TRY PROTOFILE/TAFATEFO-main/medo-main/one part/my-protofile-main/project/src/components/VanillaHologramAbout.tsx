import React, { useEffect, useRef } from 'react';

type Panel = { src: string; alt: string };

interface Props {
  panels: Panel[];
  onSelect?: (index: number) => void;
}

/**
 * Vanilla DOM/CSS implementation of a holographic semi-circle gallery adapted for React.
 * Mirrors the shared snippet: cards distributed on an arc, neon cyan edges, parallax orbit,
 * click-to-focus brings the card forward.
 */
export default function VanillaHologramAbout({ panels, onSelect }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const gallery = galleryRef.current!;
    const root = rootRef.current!;
    // Cleanup any previous
    gallery.innerHTML = '';
    // Build cards
    panels.forEach((p, i) => {
      const card = document.createElement('figure');
      card.className = 'vhg-card';
      (card as any).dataset.index = String(i);
      (card as any).dataset.boost = '0';

      const inner = document.createElement('div');
      inner.className = 'vhg-inner';
      inner.style.animationDelay = `${i * 0.08}s`;

      const img = document.createElement('img');
      img.src = p.src;
      img.alt = p.alt || `Image ${i + 1}`;
      img.loading = 'lazy';

      const shadow = document.createElement('div');
      shadow.className = 'vhg-shadow';

      inner.appendChild(img);
      card.appendChild(inner);
      card.appendChild(shadow);
      gallery.appendChild(card);
    });

    // Prepare ring layout: full 360°; transforms computed each frame to allow spinning
    let ringRadius = 560; // توسعة إضافية لتناسب الطول الجديد
    let spreadY = 10;
    const cardAngles: number[] = [];
    const computeLayout = () => {
      const cards = Array.from(gallery.querySelectorAll<HTMLElement>('.vhg-card'));
      const N = cards.length || 1;
      const rect = gallery.getBoundingClientRect();
      const w = rect.width || window.innerWidth;
      const isNarrow = w < 520;
      // احسب نصف القطر ليتساوى طول القوس مع عرض الكارت تقريباً (فجوة ~ صفر)
      const innerEl = gallery.querySelector('.vhg-inner') as HTMLElement | null;
      const cardWidth = innerEl?.offsetWidth ?? (isNarrow ? 120 : 160);
      const theta = (2 * Math.PI) / N; // زاوية كل كارت بالراديان
      const rFromArc = cardWidth / theta; // اجعل طول القوس = عرض الكارت
      ringRadius = Math.max(120, rFromArc + 18); // +18 مسافة أكبر قليلاً بين الوجوه
      spreadY = isNarrow ? 1 : 2;
      cardAngles.length = 0;
      cards.forEach((_, i) => {
        const angle = (i / N) * 360; // full ring
        cardAngles.push(angle);
      });
    };
    computeLayout();

    // Parallax orbit on pointer move
    const state = { rx: 0, ry: 0, trx: 0, try: 0, spin: 0 };
    const damp = 0.06;
    let focusedIdx: number | null = null;
    const onPointerMove = (clientX: number, clientY: number) => {
      const rect = gallery.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
      state.try = (x - 0.5) * 32;
      state.trx = -(y - 0.5) * 10;
    };
    const onPointerMoveEvt = (e: PointerEvent) => onPointerMove(e.clientX, e.clientY);
    const onTouchMoveEvt = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onPointerMove(t.clientX, t.clientY);
    };

    // Click focus toggle (boost forward)
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const card = target?.closest('.vhg-card') as HTMLElement | null;
      if (!card) return;
      const idxStr = (card as any).dataset?.index as string | undefined;
      const idx = idxStr ? parseInt(idxStr, 10) : -1;
      const focused = gallery.querySelector('.vhg-card.is-focus') as HTMLElement | null;
      if (focused && focused !== card) {
        focused.classList.remove('is-focus');
        (focused as any).dataset.boost = '0';
      }
      card.classList.toggle('is-focus');
      (card as any).dataset.boost = card.classList.contains('is-focus') ? '1' : '0';
      focusedIdx = card.classList.contains('is-focus') ? idx : null;
      if (onSelect && idx >= 0) onSelect(idx);
    };

    // Drag to speed up/slow down spin
    let dragging = false;
    let lastX = 0;
    let vel = 0; // deg/frame
    const onDown = (e: PointerEvent | MouseEvent | TouchEvent) => {
      dragging = true;
      if ('clientX' in e) lastX = (e as PointerEvent).clientX;
      else if ('touches' in e && (e as TouchEvent).touches[0]) lastX = (e as TouchEvent).touches[0].clientX;
    };
    const onUp = () => { dragging = false; };
    const onMove = (e: PointerEvent | MouseEvent | TouchEvent) => {
      if (!dragging) return;
      let cx = lastX;
      if ('clientX' in e) cx = (e as PointerEvent).clientX;
      else if ('touches' in e && (e as TouchEvent).touches[0]) cx = (e as TouchEvent).touches[0].clientX;
      const dx = cx - lastX; lastX = cx;
      vel = dx * 0.15; // sensitivity
    };

    const raf = () => {
      state.ry += (state.try - state.ry) * damp;
      state.rx += (state.trx - state.rx) * damp;
      // auto spin عكسي (يمين -> شمال) وباستمرار بدون إعادة ضبط
      const baseAuto = focusedIdx !== null ? -0.04 : -0.35;
      state.spin += baseAuto + vel;
      vel *= 0.94; // decay

      // Update each card transform to include spin so they keep facing camera
      const cards = Array.from(gallery.querySelectorAll<HTMLElement>('.vhg-card'));
      const N = cards.length || 1;
      cards.forEach((card, i) => {
        const baseAngle = cardAngles[i % N] + state.spin;
        const y = Math.sin(((i / N) * Math.PI * 2) + (state.spin * Math.PI / 180)) * spreadY;
        const boost = (card as any).dataset.boost === '1' ? 120 : 0;
        // Cylinder facets: لا نعكس الدوران حتى تلتصق الحواف وتبدو كأسطوانة
        card.style.transform = `rotateY(${baseAngle}deg) translateZ(${ringRadius + boost}px) translateY(${y}px)`;
      });

      // If focused, ease spin so the focused card faces camera (angle ~ 0)
      if (focusedIdx !== null) {
        const target = -cardAngles[focusedIdx];
        let diff = target - state.spin;
        diff = ((diff + 540) % 360) - 180; // shortest path
        state.spin += diff * 0.08;
      }

      // Subtle tilt of the whole gallery for parallax
      gallery.style.transform = `rotateY(${state.ry}deg) rotateX(${state.rx}deg)`;
      requestAnimationFrame(raf);
    };

    // Listeners bound to rootRef to keep scope local
    root.addEventListener('pointermove', onPointerMoveEvt);
    root.addEventListener('touchmove', onTouchMoveEvt, { passive: true });
    root.addEventListener('click', onClick);
    root.addEventListener('pointerdown', onDown as any);
    root.addEventListener('pointerup', onUp as any);
    root.addEventListener('pointercancel', onUp as any);
    root.addEventListener('pointermove', onMove as any);
    window.addEventListener('resize', computeLayout);
    const id = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(id);
      root.removeEventListener('pointermove', onPointerMoveEvt);
      root.removeEventListener('touchmove', onTouchMoveEvt as any);
      root.removeEventListener('click', onClick);
      root.removeEventListener('pointerdown', onDown as any);
      root.removeEventListener('pointerup', onUp as any);
      root.removeEventListener('pointercancel', onUp as any);
      root.removeEventListener('pointermove', onMove as any);
      window.removeEventListener('resize', computeLayout);
    };
  }, [panels]);

  return (
    <div ref={rootRef} className="relative watch-card">
      <div className="vhg-stage">
        <div ref={galleryRef} className="vhg-gallery" aria-label="3D floating image gallery" />
      </div>
    </div>
  );
}

