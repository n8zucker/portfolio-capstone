import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';

import aboutMontage from './assets/about-montage.mp4';
import hearts from './assets/hearts.mp4';
// Letterbox bars (132 top + 132 bottom, symmetric) cropped via ffmpeg.
// Final size 1920×816 (~2.353:1, 21:9 cinemascope).
import pixi from './assets/pixi-cropped.mp4';
import parentAndChildVideo from './assets/parent-and-child.mp4';
import sso from './assets/sso.mp4';
import kiss from './assets/kiss.mp4';
import orion from './assets/orion.mp4';
import model from './assets/model.mp4';
import fogerty from './assets/fogerty.mov';
import eataly from './assets/eataly.mp4';
import googleG from './assets/google-g.png';
import pncSculpture from './assets/parent-and-child-sculpture.webp';
import pncDetail1 from './assets/parent-and-child-detail-1.avif';
import pncDetail2 from './assets/parent-and-child-detail-2.avif';
import pncDetail3 from './assets/parent-and-child-detail-3.avif';
import qrCode from './assets/qr.svg';
import titleHero from './assets/title-hero.avif';
import orionRoute from './assets/orion-route.webp';
import orionMap from './assets/orion-map.webp';
import orionHome from './assets/orion-home.webp';

// Söhne — single-typeface system (display + body), three weights.
import sohneRegularUrl from './assets/fonts/Sohne-Regular.otf';
import sohneKraftigUrl from './assets/fonts/Sohne-Kraftig.otf';
import sohneHalbfettUrl from './assets/fonts/Sohne-Halbfett.otf';

// Register @font-face at module load. Persists across slide navigation
// because we attach to document.head, not React's render tree. Re-replaces
// any prior version of the same style block so HMR picks up font changes.
if (typeof document !== 'undefined') {
  document.getElementById('portfolio-fonts')?.remove();
  const styleEl = document.createElement('style');
  styleEl.id = 'portfolio-fonts';
  styleEl.textContent = `
    @font-face {
      font-family: 'Söhne';
      src: url(${sohneRegularUrl}) format('opentype');
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Söhne';
      src: url(${sohneKraftigUrl}) format('opentype');
      font-weight: 500;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Söhne';
      src: url(${sohneHalbfettUrl}) format('opentype');
      font-weight: 600;
      font-style: normal;
      font-display: swap;
    }
  `;
  document.head.appendChild(styleEl);
}

// Drag/resize tool (slides/portfolio/movable.tsx) is intentionally unused
// here — kept available if you want to enable per-slide editing later.

// ─── Design tokens ───────────────────────────────────────────────────────────
// Single-color discipline: white canvas, warm near-black, two warm grays.
// No accent. Söhne single-typeface system. Zero border-radius.
export const design: DesignSystem = {
  palette: {
    bg: '#ffffff', // pure white canvas
    text: '#0c0a07', // warm near-black
    accent: '#0c0a07', // single-color deck — accent collapses into text
  },
  fonts: {
    // Single-typeface system. Söhne for everything — body 400, display 600.
    // Klim's Söhne is designed as a complete editorial family; using one
    // typeface is the most coherent move (vs. mixing two grotesques).
    display: '"Söhne", "Sohne", "Geist Variable", -apple-system, system-ui, sans-serif',
    body: '"Söhne", "Sohne", "Geist Variable", -apple-system, system-ui, sans-serif',
  },
  typeScale: { hero: 144, body: 22 },
  radius: 0,
};

const muted = '#6e6a64'; // warm mid-gray
const subtle = '#9a978f'; // warm light-gray

const fill = {
  width: '100%',
  height: '100%',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  fontStyle: 'normal' as const,
  letterSpacing: '-0.018em',
  fontWeight: 400 as const,
} as const;

const display = {
  fontFamily: 'var(--osd-font-display)',
  fontStyle: 'normal' as const,
  letterSpacing: '-0.03em',
  fontWeight: 600 as const,
  margin: 0,
  lineHeight: 0.96,
} as const;

// Standard eyebrow — sentence case, Söhne Regular (400), muted color.
// Light weight keeps it as supportive metadata so the title at weight 600
// stays clearly dominant.
const eyebrow = {
  fontFamily: 'var(--osd-font-body)', // Söhne, not Inter Tight
  fontSize: 20,
  color: muted,
  letterSpacing: '0.01em',
  fontWeight: 400 as const,
  fontStyle: 'normal' as const,
  marginBottom: 18,
  lineHeight: 1.3,
} as const;

// Caption — inline baseline-aligned metadata (right of a title). Same
// scale and weight as eyebrow.
const caption = {
  fontFamily: 'var(--osd-font-body)',
  fontSize: 20,
  color: muted,
  letterSpacing: '0.01em',
  fontWeight: 400 as const,
  fontStyle: 'normal' as const,
  lineHeight: 1.3,
  margin: 0,
} as const;

// Black panel placeholder for media slots — zero chrome, label bottom-left.
// When a real asset is added, replace with <video src={...} ... />.
const VideoSlot = ({ label, hint }: { label: string; hint: string }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: '#0c0c0c',
      color: '#9a9a9a',
      position: 'relative',
      display: 'flex',
      alignItems: 'flex-end',
      padding: 32,
      boxSizing: 'border-box',
    }}
  >
    <div style={{ maxWidth: 640 }}>
      <div
        style={{
          fontSize: 13,
          color: '#7a7a7a',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: 8,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 15, color: '#5a5a5a', lineHeight: 1.5 }}>{hint}</div>
    </div>
  </div>
);

// ─── Page 1 — Title ──────────────────────────────────────────────────────────
// Text left, square image right, footer bottom. Image anchored to the right
// edge so the eye reads name → tagline → image as a single horizontal block.
const Title: Page = () => (
  <div
    style={{
      ...fill,
      padding: '0 80px',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}
  >
    <h1 style={{ ...display, fontSize: 'var(--osd-size-hero)', maxWidth: 1080 }}>Nate Zucker</h1>
    <p
      style={{
        fontSize: 28,
        color: muted,
        marginTop: 24,
        lineHeight: 1.4,
        maxWidth: 1080,
        fontStyle: 'normal',
      }}
    >Multimedia designer and creative technologist</p>
    <img
      src={titleHero}
      alt="Nate Zucker portrait"
      style={{
        position: 'absolute',
        right: 120,
        top: 350,
        width: 380,
        height: 380,
        objectFit: 'cover',
        display: 'block',
      }}
    />
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: 80,
        right: 80,
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 18,
        color: muted,
      }}
    >
      <span>NYU Tisch · Recorded Music</span>
      <span>Portfolio</span>
      <span>Spring 2026 · New York</span>
    </div>
  </div>
);

// ─── Page 2 — What I do ──────────────────────────────────────────────────────
// Title top-left. Grid (2 cols × 3 rows) holds the 6 categorical cards on the
// left. Right column holds the hearts.mp4 slideshow as a tall feature panel
// — visual evidence of the categories, anchored top-right edge-to-edge.
const WhatIDo: Page = () => {
  const tiles = [
    {
      title: 'Product & UX Design',
      body: 'App concepts, system architecture, interaction flows',
    },
    {
      title: 'AI Creative Systems',
      body: 'Generative workflows, prompt engineering, real-time systems',
    },
    {
      title: 'Film & Video',
      body: 'Music videos, short films, motion design, sound design',
    },
    {
      title: 'Branding & Identity',
      body: 'Design systems, visual language, environmental graphics',
    },
    {
      title: 'Music Production',
      body: 'Songwriting, sound design, live performance systems',
    },
    {
      title: 'New Media Art',
      body: 'Projection mapping, biosculpture, interactive installations',
    },
  ];
  // Flex layout — explicit left/right zones, can't overlap:
  //   Title row spans top.
  //   Below title: flex row → left = 6-card 3×2 grid, right = 3:2 video.
  //   Grid zone holds fixed width (1028px); video zone fills the rest.
  //   Video stays at native 3:2 aspect via aspectRatio CSS.
  return (
    <div
      style={{
        ...fill,
        padding: '88px 80px 60px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h2 style={{ ...display, fontSize: 96 }}>What I do</h2>

      <div
        style={{
          marginTop: 48,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 48,
          minHeight: 0,
        }}
      >
        {/* Left zone — slideshow at native 3:2. */}
        <div
          style={{
            flex: '1',
            aspectRatio: '3 / 2',
            overflow: 'hidden',
          }}
        >
          <video
            src={hearts}
            autoPlay
            muted
            loop
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: '#0c0c0c', backgroundColor: '#ffffff' }}
          />
        </div>

        {/* Right zone — 3×2 grid. Same aspect ratio as video means same
            height, so the bottom edges align. Cells distribute their content
            evenly over the matched height. */}
        <div
          style={{
            flex: '1',
            aspectRatio: '3 / 2',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            gap: 24,
          }}
        >
          {tiles.map((t) => (
            <div
              key={t.title}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
              }}
            >
              <h3
                style={{
                  fontSize: 32,
                  fontWeight: 600,
                  letterSpacing: '-0.018em',
                  margin: 0,
                  fontFamily: 'var(--osd-font-display)',
                  fontStyle: 'normal',
                }}
              >
                {t.title}
              </h3>
              <p
                style={{
                  fontSize: 20,
                  color: muted,
                  marginTop: 10,
                  lineHeight: 1.45,
                  fontStyle: 'normal',
                }}
              >
                {t.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Page 3 — Pixi (hero) ────────────────────────────────────────────────────
// Cropped source is 1920×816 (~2.353:1, 21:9 cinemascope). Letterbox bars
// removed via ffmpeg (132px symmetric crop top + bottom). Hero panel uses
// near-full canvas width to give the wide aspect room to breathe.
//
// Layout math (1920×1080):
//   Header: top:60, height ~124, ends ~184
//   Video: top:220, height 748 → width @ 2.353 = 1760 (margins 80)
//   Awards strip: bottom 30
const Pixi: Page = () => {
  const colLeft = 80;
  const colWidth = 1760;
  return (
    <div style={{ ...fill, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 60, left: colLeft, width: colWidth }}>
        <div
          style={{
            ...eyebrow,
          }}
        >
          AI short film · MIT AI Filmmaking Hackathon · 2025
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 40,
          }}
        >
          <h2 style={{ ...display, fontSize: 96 }}>For Pixi</h2>
          <p style={{ ...caption, textAlign: 'right', whiteSpace: 'nowrap' }}>Creative direction · Visual design · AI as compositional collaborator</p>
        </div>
      </div>

      {/* Hero video panel — full-width 21:9 cinemascope. */}
      <div
        style={{
          position: 'absolute',
          left: colLeft,
          width: colWidth,
          top: 220,
          height: 748,
          overflow: 'hidden',
          background: '#0c0c0c',
        }}
      >
        <video
          src={pixi}
          autoPlay
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>

      {/* Festival / award strip below the video */}
      <div
        style={{
          ...caption,
          position: 'absolute',
          left: colLeft,
          width: colWidth,
          bottom: 30,
          textAlign: 'center',
        }}
      >
        SXSW screening · MIT Best Character Award · Cinequest premiere · Beijing IFF · CVPR research · OpenArt &amp; JaguarBite sponsor awards
      </div>
    </div>
  );
};

// ─── Project page (asymmetric L-shape composition) ───────────────────────────
// Media: edge-to-edge top-right at native aspect (no whitespace around it).
// Text: full-height left column + bottom-right under the media.
//
// For 16:9 default: 1100w × 619h media at top-right.
// Use <ProjectPage mediaWidth={...} mediaHeight={...} /> to size other aspects.
const ProjectPage = ({
  eyebrow,
  title,
  body,
  caption,
  titleSize = 96,
  mediaWidth = 1100,
  mediaHeight = 619, // 16:9
  media,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  caption?: string;
  titleSize?: number;
  mediaWidth?: number;
  mediaHeight?: number;
  media: React.ReactNode;
}) => {
  const textColumnWidth = 1920 - mediaWidth; // left column fills remaining width
  return (
    <div style={{ ...fill, position: 'relative', overflow: 'hidden' }}>
      {/* Media — top-right, edge-to-edge */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: mediaWidth,
          height: mediaHeight,
          overflow: 'hidden',
        }}
      >
        {media}
      </div>

      {/* Left text column — full canvas height */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: textColumnWidth,
          height: 1080,
          padding: '100px 60px 80px 100px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            ...eyebrow,
          }}
        >
          {eyebrow}
        </div>
        <h2 style={{ ...display, fontSize: titleSize }}>{title}</h2>
        {body && (
          <p
            style={{
              fontSize: 22,
              color: muted,
              marginTop: 22,
              lineHeight: 1.5,
              maxWidth: textColumnWidth - 160,
              fontStyle: 'normal',
            }}
          >
            {body}
          </p>
        )}
      </div>

      {/* Bottom-right caption — under the media */}
      {caption && (
        <div
          style={{
            position: 'absolute',
            top: mediaHeight + 60,
            right: 100,
            width: mediaWidth - 100,
            fontSize: 18,
            color: subtle,
            lineHeight: 1.6,
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
};

// ─── Page 4 — Model ──────────────────────────────────────────────────────────
// Header column shares left edge + width with the video below.
// Title + one-line role description sit on the same baseline.
//
// Layout math (1920×1080, 60 top/bottom pad, 140 header):
//   Available video height: 1080 − 60 − 140 − 24 − 60 = 796
//   Video @ 16:9 → 1408 × 792 (snap)
//   Side margins: (1920 − 1408) / 2 = 256
const Model: Page = () => {
  const colLeft = 256;
  const colWidth = 1408;
  return (
    <div style={{ ...fill, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 60, left: colLeft, width: colWidth }}>
        <div
          style={{
            ...eyebrow,
          }}
        >
          Music video · 2025
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 40,
          }}
        >
          <h2 style={{ ...display, fontSize: 96 }}>Model</h2>
          <p style={{ ...caption, whiteSpace: 'nowrap' }}>
            Director, songwriter, music producer · Real-time motion-tracking projected visuals
          </p>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: colLeft,
          width: colWidth,
          top: 220,
          height: 792,
          overflow: 'hidden',
        }}
      >
        <video
          src={model}
          autoPlay
          loop
          playsInline
          controls
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            background: '#0c0c0c',
          }}
        />
      </div>
    </div>
  );
};

// ─── Page 5 — Parent and Child ───────────────────────────────────────────────
// Bento layout: big sculpture image left, legos still top-right, video
// bottom-right. Header strip above shares left/right edges with the bento.
const ParentAndChild: Page = () => {
  // Tighter horizontal margin since the sculpture image now has a white
  // background of its own — bento extends closer to canvas edges so the
  // built-in image whitespace doesn't compound with extra side margin.
  const colLeft = 100;
  const colWidth = 1720;
  const bentoTop = 220;
  const bentoHeight = 792;
  const gap = 16;
  const leftW = 1020;
  const rightW = colWidth - leftW - gap;
  const cellH = (bentoHeight - gap) / 2;

  return (
    <div style={{ ...fill, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 60, left: colLeft, width: colWidth }}>
        <div
          style={{
            ...eyebrow,
          }}
        >
          New media art · 2024
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 40,
          }}
        >
          <h2 style={{ ...display, fontSize: 96 }}>Parent and Child</h2>
          <p style={{ ...caption, whiteSpace: 'nowrap' }}>Mycelium building system & biosculpture · Projection-mapped wall text</p>
        </div>
      </div>

      {/* Big sculpture image — left, full bento height. Container bg matches
          slide bg so the white-background image blends with the canvas. */}
      <div
        style={{
          position: 'absolute',
          left: colLeft,
          top: bentoTop,
          width: leftW,
          height: bentoHeight,
          overflow: 'hidden',
        }}
      >
        <img
          src={pncSculpture}
          alt="Parent and Child sculpture"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'left center',
            display: 'block',
            backgroundColor: '#ffffff',
          }}
        />
      </div>

      {/* Detail 3 — fills the gap right of the contained sculpture. */}
      <div
        style={{
          position: 'absolute',
          left: colLeft + 690,
          top: bentoTop,
          width: leftW - 690,
          height: bentoHeight,
          overflow: 'hidden',
          background: '#0c0c0c',
        }}
      >
        <img
          src={pncDetail3}
          alt="Parent and Child detail"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* Top-right zone — two side-by-side detail tiles. */}
      <div
        style={{
          position: 'absolute',
          left: colLeft + leftW + gap,
          top: bentoTop,
          width: rightW,
          height: cellH,
          display: 'flex',
          gap: gap,
        }}
      >
        <div
          style={{ flex: 1, overflow: 'hidden', background: '#0c0c0c' }}
        >
          <img
            src={pncDetail1}
            alt="Parent and Child detail"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
        <div
          style={{ flex: 1, overflow: 'hidden', background: '#0c0c0c' }}
        >
          <img
            src={pncDetail2}
            alt="Parent and Child detail"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      </div>

      {/* Bottom-right tile — projection video */}
      <div
        style={{
          position: 'absolute',
          left: colLeft + leftW + gap,
          top: bentoTop + cellH + gap,
          width: rightW,
          height: cellH,
          overflow: 'hidden',
          background: '#0c0c0c',
        }}
      >
        <video
          src={parentAndChildVideo}
          autoPlay
          muted
          loop
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    </div>
  );
};

// ─── Page 6 — Orion ──────────────────────────────────────────────────────────
// Asset is 1080×1620 (2:3 portrait). Right column 720 wide × 1080 tall = 2:3.
const Orion: Page = () => (
  <div style={{ ...fill, position: 'relative', overflow: 'hidden' }}>
    <div
      style={{
        position: 'absolute',
        top: 83,
        right: 200,
        width: 609,
        height: 914,
        overflow: 'hidden',
      }}
    >
      <video
        src={orion}
        autoPlay
        muted
        loop
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1200,
        height: 1080,
        padding: '60px 60px 80px 100px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          ...eyebrow,
        }}
      >
        Product &amp; UX design · 2026
      </div>
      <h2 style={{ ...display, fontSize: 96 }}>Orion</h2>
      <p
        style={{
          fontSize: 22,
          color: muted,
          marginTop: 22,
          lineHeight: 1.5,
          maxWidth: 880,
        }}
      >
        A routing app where personalization emerges from your exploration patterns. Quests, not
        points. Off-track suggestions. Social identity through where you go.
      </p>
      {/* Three additional phone mockups beneath the text. Sized so their
          bottoms align with the hero phone's bottom (y=997) for grid unity. */}
      <div
        style={{
          marginTop: 'auto',
          marginBottom: 3,
          display: 'flex',
          gap: 24,
          alignItems: 'flex-end',
        }}
      >
        {[orionRoute, orionMap, orionHome].map((src, i) => (
          <img
            key={i}
            src={src}
            alt="Orion app screen"
            style={{
              width: 260,
              height: 540,
              objectFit: 'contain',
              objectPosition: 'bottom',
              display: 'block',
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ─── Page 7 — Selected Work (video wall, ~40s) ───────────────────────────────
// Bento composition: Eataly (9:16 portrait) anchored right at full row height,
// four landscape/squarer tiles in a 2×2 to its left.
const SelectedWork: Page = () => {
  const tile = {
    background: '#0c0c0c',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  };
  // Tile label uses the eyebrow treatment (sentence case, Söhne 400, light
  // tracking) — matches the rest of the deck's metadata language. White over
  // dark video with a soft text-shadow for legibility on any frame.
  const tileLabel = {
    ...eyebrow,
    position: 'absolute' as const,
    left: 20,
    bottom: 16,
    color: '#ffffff',
    marginBottom: 0,
    textShadow: '0 1px 4px rgba(0,0,0,0.55)',
  };
  const cover = {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    display: 'block',
  };
  // Wall grid math (1720 wide × 820 tall, gap 24):
  //   Eataly portrait right column  → 9:16 of 820 height = 462 wide
  //   Left 2×2                      → (1720 − 462 − 24) / 2 = 617 wide
  //                                  (820 − 24) / 2 = 398 tall per tile
  return (
    <div style={{ ...fill, position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: 88,
          left: 100,
          right: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <h2 style={{ ...display, fontSize: 96 }}>Selected Work</h2>
        <span style={{ ...caption, alignSelf: 'flex-end', paddingBottom: 12 }}>
          Films · Music videos · Sound design · Commercial
        </span>
      </div>

      {/* Wall: 2×2 left + portrait right */}
      <div
        style={{
          position: 'absolute',
          left: 100,
          right: 100,
          top: 200,
          height: 820,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 462px',
          gridTemplateRows: '1fr 1fr',
          gap: 24,
        }}
      >
        <div style={tile}>
          <video src={aboutMontage} autoPlay muted loop playsInline style={cover} />
          <div style={tileLabel}>Hearts · Music Video</div>
        </div>
        <div style={tile}>
          <video src={fogerty} autoPlay muted loop playsInline style={cover} />
          <div style={tileLabel}>John Fogerty Tour Open · Radio City</div>
        </div>
        <div style={{ ...tile, gridRow: 'span 2' }}>
          <video src={eataly} autoPlay muted loop playsInline style={cover} />
          <div style={tileLabel}>Eataly & Lurisia · Social Content</div>
        </div>
        <div style={tile}>
          <video src={kiss} autoPlay muted loop playsInline style={cover} />
          <div style={tileLabel}>Kiss · Gabby Start</div>
        </div>
        <div style={tile}>
          <video src={sso} autoPlay muted loop playsInline style={cover} />
          <div style={tileLabel}>Super Special Outing Promo · Ella Woolsey</div>
        </div>
      </div>
    </div>
  );
};

// ─── Page 8 — Close ──────────────────────────────────────────────────────────
// Left column: find-me / URL / one-liner ask.
// Right column: Google G mark + "Joining Google Creative Lab · Summer 2026".
const Close: Page = () => (
  <div
    style={{
      ...fill,
      padding: '0 100px',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    {/* Left — QR + URL inline, body description below */}
    <div style={{ flex: 1, paddingRight: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <img
          src={qrCode}
          alt="QR code to natezucker.com"
          style={{ width: 140, height: 140, display: 'block', marginLeft: -16 }}
        />
        <h2 style={{ ...display, fontSize: 112 }}>natezucker.com</h2>
      </div>
      <p
        style={{
          fontSize: 22,
          color: muted,
          marginTop: 32,
          maxWidth: 980,
          lineHeight: 1.5,
          fontStyle: 'normal',
        }}
      >{'I\'m looking to talk with people working at the edges of creative technology, multimedia art, and tools for music and film. Open to a variety of opportunities. '}</p>
    </div>

    {/* Right — Google news */}
    <div
      style={{
        flex: '0 0 460px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <img
        src={googleG}
        alt="Google"
        style={{ width: 180, height: 180, objectFit: 'contain', display: 'block' }}
      />
      <div
        style={{
          marginTop: 36,
          fontSize: 22,
          color: muted,
          lineHeight: 1.4,
          letterSpacing: '-0.01em',
        }}
      >
        <div style={{ color: '#0a0a0a', fontWeight: 500, fontSize: 26 }}>Google Creative Lab</div>
        <div style={{ marginTop: 6 }}>Creative</div>
      </div>
    </div>

    <div
      style={{
        position: 'absolute',
        bottom: 80,
        left: 100,
        right: 100,
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 18,
        color: muted,
      }}
    >
      <span>Nate Zucker</span>
      <span>NYU Tisch · Recorded Music</span>
      <span>Spring 2026</span>
    </div>
  </div>
);

export const meta: SlideMeta = { title: 'Nate Zucker · Portfolio' };

export default [
  Title,
  WhatIDo,
  Pixi,
  Model,
  ParentAndChild,
  Orion,
  SelectedWork,
  Close,
] satisfies Page[];
