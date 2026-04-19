#!/bin/bash
set -euo pipefail

# BATCH 6: CSS STYLES
# Creates: styles/*.css

mkdir -p frontend/src/styles

cat > frontend/src/styles/tokens.css << 'EOF'
:root {
  --color-bg-primary: #020b18;
  --color-bg-secondary: #0a1628;
  --color-bg-card: #0d1f35;
  --color-bg-card-hover: #112240;
  --color-accent-gold: #f59e0b;
  --color-accent-gold-dim: rgba(245, 158, 11, 0.15);
  --color-accent-gold-border: rgba(245, 158, 11, 0.3);
  --color-accent-cyan: #0ea5e9;
  --color-accent-cyan-dim: rgba(14, 165, 233, 0.08);
  --color-accent-purple: #8b5cf6;
  --color-text-primary: #f8fafc;
  --color-text-secondary: #94a3b8;
  --color-text-muted: rgba(148, 163, 184, 0.6);
  --color-border: rgba(248, 250, 252, 0.07);
  --color-border-accent: rgba(245, 158, 11, 0.3);
}

*,
*::before,
*::after { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--color-bg-primary);
  min-height: 100vh;
  color: var(--color-text-primary);
  font-family: "SF Pro Display", system-ui, -apple-system, sans-serif;
}

button, input, textarea { font-family: inherit; }
EOF

cat > frontend/src/styles/animations.css << 'EOF'
@keyframes pulse-bar { 0%,100%{opacity:1} 50%{opacity:0.4} }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes glow-pulse { 0%,100%{box-shadow:0 0 20px #00d4ff33,inset 0 0 20px #00d4ff08} 50%{box-shadow:0 0 50px #00d4ff55,inset 0 0 40px #00d4ff14} }
@keyframes border-flow { 0%{border-color:#00d4ff55} 50%{border-color:#7c3aed88} 100%{border-color:#00d4ff55} }
@keyframes rec-pulse { 0%,100%{box-shadow:0 0 0 0 #ff4d4d66} 50%{box-shadow:0 0 0 10px #ff4d4d00} }
@keyframes count-pop { 0%{transform:scale(1.3);opacity:0} 100%{transform:scale(1);opacity:1} }
@keyframes floatParticle { 0%,100%{transform:translateY(0px);opacity:0.05} 50%{transform:translateY(-15px);opacity:0.3} }
@keyframes floatDrift { 0%{transform:translate(0,0) scale(1);opacity:0.3} 33%{transform:translate(8px,-15px) scale(1.1);opacity:0.7} 66%{transform:translate(-5px,-28px) scale(0.9);opacity:0.5} 100%{transform:translate(2px,-40px) scale(1);opacity:0} }
@keyframes hero-glow-pulse { 0%,100%{box-shadow:0 0 20px #00d4ff33,inset 0 0 20px #00d4ff08} 50%{box-shadow:0 0 50px #00d4ff55,inset 0 0 40px #00d4ff14} }
@keyframes hero-border-flow { 0%{border-color:#00d4ff55} 50%{border-color:#7c3aed88} 100%{border-color:#00d4ff55} }
@keyframes gridDrift { 0%{background-position:0 0} 100%{background-position:60px 60px} }
@keyframes onlinePulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
@keyframes headlineShimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
@keyframes pulseRing { 0%{box-shadow:0 4px 24px rgba(245,158,11,0.35),0 0 0 0 rgba(245,158,11,0.4)} 70%{box-shadow:0 4px 24px rgba(245,158,11,0.35),0 0 0 16px rgba(245,158,11,0)} 100%{box-shadow:0 4px 24px rgba(245,158,11,0.35),0 0 0 0 rgba(245,158,11,0)} }
@keyframes ambientPulse { 0%,100%{opacity:0.6;transform:translate(-50%,-50%) scale(1)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.08)} }
@keyframes cardActivePulse { 0%,100%{box-shadow:0 0 16px rgba(14,165,233,0.1),0 0 0 1px rgba(14,165,233,0.2)} 50%{box-shadow:0 0 28px rgba(14,165,233,0.22),0 0 0 1px rgba(14,165,233,0.45)} }
@keyframes headingShimmerOnce { from{background-position:-100% center} to{background-position:100% center} }
@keyframes dataFlow { 0%{left:-100%} 100%{left:100%} }
@keyframes spin { to{transform:rotate(360deg)} }

.app-panel { animation: glow-pulse 3s ease-in-out infinite, border-flow 4s ease-in-out infinite; }
.rec-dot { animation: rec-pulse 1.2s ease-out infinite; }
.blink { animation: blink 1s step-end infinite; }
.count-num { animation: count-pop 0.3s ease-out; }
.hero-particle { will-change: transform, opacity; backface-visibility: hidden; transform: translateZ(0); }
.pipeline-section, .report-preview, .workshop-card { content-visibility: auto; contain-intrinsic-size: auto 500px; }
EOF

cat > frontend/src/styles/responsive.css << 'EOF'
@media (max-width: 768px) {
  .hero-terminal { margin: 16px; }
  .hero-content { padding: 32px 20px 48px; }
  .headline-line-one { font-size: clamp(1.5rem, 3.5vw, 2rem); }
  .headline-line-two { font-size: clamp(1.8rem, 4vw, 2.4rem); }
  .hero-subheadline { font-size: 14px; }
  .hero-buttons { flex-direction: column; align-items: center; }
  .btn-primary, .btn-secondary { width: 100%; max-width: 280px; text-align: center; }
  .hero-credits { gap: 12px; flex-direction: column; align-items: center; }
  .hero-location { font-size: 11px; text-align: center; }
  .terminal-title { font-size: 9px; }
  .hero-corner { width: 12px; height: 12px; }
  .hero-label::before, .hero-label::after { max-width: 30px; }
  .hero-label { gap: 8px; font-size: 9px; letter-spacing: 3px; }
  .hero-brand-name { font-size: 10px; letter-spacing: 4px; }
  .hero-grid-drift { animation: none; opacity: 0.3; }
  .hero-particle { animation: none !important; opacity: 0.1; }
  .headline-line-two { animation: none !important; background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 45%, #ffffff 100%); -webkit-background-clip: text; background-clip: text; }
}
EOF

cat > frontend/src/styles/reduced-motion.css << 'EOF'
@media (prefers-reduced-motion: reduce) {
  .hero-terminal, .hero-grid-drift, .hero-particle, .headline-line-two, .status-dot, .btn-primary, .btn-secondary, .btn-secondary .arrow, .whatsapp-btn, .pipeline-card, .pipeline-card.primary-node, .pipeline-ambient-glow, .pipeline-connector::after, .tech-pill, .workshop-card, .workshop-card-btn { animation: none; transition: none; }
  .pulse-ring { box-shadow: 0 4px 24px rgba(245, 158, 11, 0.35); animation: none !important; }
  .hero-particle { opacity: 0.08; }
  .pipeline-card { opacity: 1; transform: none; }
  .tech-pill { opacity: 1; transform: none; }
}
EOF

cat > frontend/src/styles/globals.css << 'EOF'
@import './tokens.css';
@import './animations.css';
@import './responsive.css';
@import './reduced-motion.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

.hero-terminal {
  position: relative;
  background: #020408;
  border: 1.5px solid #00d4ff;
  border-radius: 20px;
  margin: 24px;
  overflow: hidden;
  animation: hero-glow-pulse 3s ease-in-out infinite, hero-border-flow 4s ease-in-out infinite;
}

.hero-grid-drift {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: gridDrift 20s linear infinite;
  z-index: 0;
  pointer-events: none;
}

.hero-scan-line {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.012) 2px, rgba(0,212,255,0.012) 4px);
}

.hero-corner { position: absolute; width: 18px; height: 18px; z-index: 2; }
.hero-corner.top-left { top: 0; left: 0; border-top: 2px solid #00d4ff; border-left: 2px solid #00d4ff; }
.hero-corner.top-right { top: 0; right: 0; border-top: 2px solid #00d4ff; border-right: 2px solid #00d4ff; }
.hero-corner.bottom-left { bottom: 0; left: 0; border-bottom: 2px solid #00d4ff; border-left: 2px solid #00d4ff; }
.hero-corner.bottom-right { bottom: 0; right: 0; border-bottom: 2px solid #00d4ff; border-right: 2px solid #00d4ff; }

.hero-terminal-header {
  position: relative;
  z-index: 1;
  border-bottom: 1px solid rgba(245,158,11,0.2);
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(90deg, rgba(0,212,255,0.07), transparent);
}

.terminal-window-dots { display: flex; gap: 6px; }
.terminal-window-dots .dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.red { background: #ff5f57; box-shadow: 0 0 6px rgba(255,95,87,0.6); }
.dot.yellow { background: #febc2e; box-shadow: 0 0 6px rgba(254,188,46,0.6); }
.dot.green { background: #28c840; box-shadow: 0 0 6px rgba(40,200,64,0.6); }

.terminal-title { font-size: 11px; color: #6b7fa3; letter-spacing: 2px; font-family: monospace; }
.terminal-status { display: flex; align-items: center; gap: 6px; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: #00e676; box-shadow: 0 0 6px #00e676; animation: onlinePulse 2s ease-in-out infinite; }
.terminal-status span:last-child { font-size: 10px; color: #00e676; letter-spacing: 1px; font-family: monospace; }

.terminal-inner-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(245,158,11,0.3), transparent);
  z-index: 2;
  pointer-events: none;
}

.hero-content { position: relative; z-index: 1; padding: 48px 32px 64px; text-align: center; max-width: 800px; margin: 0 auto; }
.hero-brand-name { color: rgba(14,165,233,0.7); font-size: 13px; letter-spacing: 6px; text-transform: uppercase; text-shadow: 0 0 20px rgba(14,165,233,0.35); margin-bottom: 20px; }
.hero-label { display: flex; align-items: center; justify-content: center; gap: 16px; font-size: 11px; letter-spacing: 5px; color: rgba(245,158,11,0.85); margin-bottom: 18px; }
.hero-label::before, .hero-label::after { content: ''; flex: 1; max-width: 60px; height: 1px; background: linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent); }
.hero-headline { margin-bottom: 20px; }
.headline-line-one { font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; color: #f8fafc; line-height: 1.2; }
.headline-line-two { font-size: clamp(2.6rem, 4.8vw, 3.8rem); font-weight: 900; line-height: 1.2; background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 45%, #ffffff 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: headlineShimmer 5s linear infinite; }
.hero-subheadline { font-size: 16px; color: rgba(248,250,252,0.8); max-width: 620px; margin: 0 auto 28px; line-height: 1.5; }
.subheading-arrow { color: #f59e0b; margin: 0 4px; }
.hero-location { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 40px; border: 1px solid rgba(245,158,11,0.2); background: rgba(245,158,11,0.05); font-size: 13px; color: #94a3b8; margin-bottom: 24px; }
.whatsapp-btn { display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; border-radius: 999px; border: 1px solid rgba(37,211,102,0.4); background: rgba(37,211,102,0.07); color: rgba(37,211,102,0.85); font-size: 13px; cursor: pointer; transition: all 0.2s ease; margin-bottom: 36px; }
.whatsapp-btn:hover { border-color: rgba(37,211,102,0.75); background: rgba(37,211,102,0.12); }
.hero-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px; }
.btn-primary { background: #f59e0b; color: #0a0e1a; font-weight: 700; font-size: 15px; padding: 12px 28px; border: none; border-radius: 8px; cursor: pointer; transition: all 0.22s ease; animation: pulseRing 2.8s ease-out infinite; }
.btn-primary:hover { transform: translateY(-3px); filter: brightness(1.1); box-shadow: 0 8px 36px rgba(245,158,11,0.55); }
.btn-secondary { background: transparent; border: 1.5px solid rgba(245,158,11,0.55); color: #f59e0b; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 8px; cursor: pointer; transition: all 0.22s ease; display: inline-flex; align-items: center; gap: 8px; }
.btn-secondary:hover { border-color: rgba(245,158,11,1); background: rgba(245,158,11,0.08); transform: translateY(-3px); box-shadow: 0 6px 24px rgba(245,158,11,0.2); }
.btn-secondary .arrow { transition: transform 0.2s ease; }
.btn-secondary:hover .arrow { transform: translateX(4px); }
.hero-credits { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; font-size: 12px; color: #6b7fa3; margin-top: 0; }
.trust-check { color: #f59e0b; font-size: 13px; margin-right: 6px; }

.hero-particle { position: absolute; border-radius: 50%; pointer-events: none; z-index: 0; }
.hero-particle.small { width: 1.5px; height: 1.5px; opacity: 0.3; }
.hero-particle.medium { width: 3px; height: 3px; }
.hero-particle.large { width: 6px; height: 6px; box-shadow: 0 0 8px currentColor; opacity: 0.5; }

.pipeline-section { background: linear-gradient(180deg, #020b18 0%, #071428 50%, #020b18 100%); position: relative; overflow: hidden; padding: 48px 24px; }
.pipeline-ambient-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 900px; height: 500px; background: radial-gradient(ellipse at center, rgba(14,165,233,0.06) 0%, rgba(245,158,11,0.04) 40%, transparent 70%); animation: ambientPulse 8s ease-in-out infinite; pointer-events: none; z-index: 0; }
.pipeline-card { position: relative; background: var(--color-bg-card); border: 1px solid var(--color-border-accent); border-radius: 12px; padding: 20px; transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; z-index: 1; box-shadow: 0 0 16px rgba(245,158,11,0.06), 0 2px 8px rgba(0,0,0,0.4); opacity: 0; transform: translateY(24px); }
.pipeline-card.revealed { opacity: 1; transform: translateY(0); }
.pipeline-card:hover { transform: translateY(-4px) scale(1.02); border-color: rgba(245,158,11,0.65); box-shadow: 0 0 32px rgba(245,158,11,0.18), 0 0 8px rgba(245,158,11,0.1), 0 8px 24px rgba(0,0,0,0.5); }
.pipeline-card.primary-node { animation: cardActivePulse 3s ease-in-out infinite; }
.pipeline-section-label { color: var(--color-accent-gold); text-shadow: 0 0 20px rgba(245,158,11,0.5); letter-spacing: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
.pipeline-heading { background: linear-gradient(90deg, #f8fafc 0%, #f59e0b 50%, #f8fafc 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation-play-state: paused; }
.pipeline-heading.in-view { animation: headingShimmerOnce 2s ease forwards; animation-play-state: running; }
.tech-pill { background: var(--color-accent-gold-dim); border: 1px solid var(--color-accent-gold-border); border-radius: 999px; padding: 4px 14px; font-size: 12px; color: var(--color-text-secondary); transition: all 0.2s ease; opacity: 0; transform: translateY(10px) scale(0.95); }
.tech-pill.revealed { opacity: 1; transform: translateY(0) scale(1); }
.tech-pill:hover { border-color: rgba(245,158,11,0.6); background: rgba(245,158,11,0.12); transform: translateY(-2px); box-shadow: 0 4px 16px rgba(245,158,11,0.15); }
.pipeline-connector { width: 40px; height: 2px; background: linear-gradient(90deg, rgba(245,158,11,0.3), rgba(245,158,11,0.8), rgba(245,158,11,0.3)); position: relative; overflow: hidden; }
.pipeline-connector::after { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(245,158,11,0.9), transparent); animation: dataFlow 2s linear infinite; }

.report-preview { position: relative; border: 1px solid var(--color-border); border-radius: 16px; background: var(--color-bg-card); padding: 24px; margin: 32px 0; }
.report-preview-fade { position: absolute; bottom: 0; left: 0; right: 0; height: 100px; background: linear-gradient(to bottom, transparent, var(--color-bg-primary)); pointer-events: none; }

.workshop-card { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: 14px; padding: 32px; transition: border-color 0.3s ease, box-shadow 0.3s ease; }
.workshop-card:hover { border-color: var(--color-border-accent); box-shadow: 0 0 32px rgba(245,158,11,0.08); }
.workshop-card-icon { color: var(--color-accent-gold); margin-bottom: 20px; }
.workshop-card-icon svg { width: 36px; height: 36px; }
.workshop-card-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 12px; }
.workshop-card-desc { font-size: 13px; color: var(--color-text-secondary); margin-bottom: 20px; line-height: 1.5; }
.workshop-card-btn { border: 1px solid var(--color-accent-gold); color: var(--color-accent-gold); background: transparent; border-radius: 8px; padding: 10px 24px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
.workshop-card-btn:hover { background: var(--color-accent-gold); color: #020b18; }
EOF

echo "✅ Batch 6 complete (5 files: CSS styles)"