export default function BackgroundGradient() {
  return (
    <>
      {/* Ambient glow */}
      <div id="ambient-glow" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(60% 50% at 50% 28%, var(--glow) 0%, transparent 65%)',
        transition: 'background 1.5s ease',
      }} />
      {/* Film grain */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.025,
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
      }} />
    </>
  );
}
