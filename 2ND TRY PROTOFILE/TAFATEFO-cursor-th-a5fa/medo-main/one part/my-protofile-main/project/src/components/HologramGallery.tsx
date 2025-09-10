import React, { useMemo } from 'react';

type GalleryItem = {
  src: string;
  alt: string;
};

const images: GalleryItem[] = [
  { src: '/1.jpg', alt: 'Gallery 1' },
  { src: '/2.jpg', alt: 'Gallery 2' },
  { src: '/3.jpg', alt: 'Gallery 3' },
  { src: '/4.jpg', alt: 'Gallery 4' },
  { src: '/5.jpg', alt: 'Gallery 5' },
  { src: '/6.jpg', alt: 'Gallery 6' },
  { src: '/photo_2025-08-19_02-14-04.jpg', alt: 'Gallery 7' },
];

export default function HologramGallery() {
  const arranged = useMemo(() => {
    const radius = 420; // px, visual arc radius
    const centerZ = -200; // px, push slightly into screen
    const baseTilt = -8; // deg around X to add perspective
    const items = images.length;
    return images.map((it, idx) => {
      const t = items <= 1 ? 0 : idx / (items - 1); // 0..1
      const angle = (t - 0.5) * 1.2; // -0.6..0.6 rad (~-34..34deg)
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius + centerZ;
      const y = Math.sin(t * Math.PI) * 24 - 10; // slight vertical variance
      const rotY = (angle * 180) / Math.PI * 0.75; // face inward subtly
      const delay = (t * 0.8).toFixed(2) + 's';
      return { ...it, x, y, z, rotY, baseTilt, delay };
    });
  }, []);

  return (
    <div className="relative">
      <div className="holo-bg-blur" aria-hidden="true" />
      <div className="holo-stage">
        {arranged.map((it, idx) => (
          <div
            key={idx}
            className="holo-panel"
            style={{
              transform:
                `translate3d(${it.x}px, ${it.y}px, ${it.z}px) rotateX(${it.baseTilt}deg) rotateY(${it.rotY}deg)`,
              animationDelay: it.delay,
            }}
          >
            <div className="holo-panel-glow" />
            <img src={it.src} alt={it.alt} className="holo-img" loading="lazy" />
            <div className="holo-reflection" aria-hidden="true" />
            <div className="holo-border" aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  );
}

