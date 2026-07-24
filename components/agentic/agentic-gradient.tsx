/**
 * Stripe-achtig animerend mesh-gradient-vlak in Domio-groentinten op cream.
 * Meerdere zacht bewegende, geblurde kleurvlekken geven het "levende" gevoel.
 * De onderrand is diagonaal afgesneden (clip-path) — de signature Stripe-schuine
 * rand. Puur CSS, geen JS, geen externe libs.
 */
export function AgenticGradient() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        backgroundColor: '#FBFAF7',
        // Diagonale onderrand (Stripe-schuinte)
        clipPath: 'polygon(0 0, 100% 0, 100% 86%, 0 100%)',
      }}
    >
      {/* Zacht bewegende kleurvlekken */}
      <span className="agx-blob agx-blob-1" />
      <span className="agx-blob agx-blob-2" />
      <span className="agx-blob agx-blob-3" />
      <span className="agx-blob agx-blob-4" />
      <span className="agx-blob agx-blob-5" />

      {/* Fijne korrel/soft-overlay om banding te verzachten en cream door te laten schemeren */}
      <span className="absolute inset-0 bg-[#FBFAF7]/10" />

      <style>{`
        .agx-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(70px);
          will-change: transform;
        }
        .agx-blob-1 {
          width: 46rem; height: 46rem;
          left: -10rem; top: -16rem;
          background: radial-gradient(circle at center, rgba(159,232,112,0.85) 0%, rgba(159,232,112,0) 68%);
          animation: agxFloat1 22s ease-in-out infinite alternate;
        }
        .agx-blob-2 {
          width: 40rem; height: 40rem;
          right: -8rem; top: -12rem;
          background: radial-gradient(circle at center, rgba(201,242,168,0.9) 0%, rgba(201,242,168,0) 66%);
          animation: agxFloat2 26s ease-in-out infinite alternate;
        }
        .agx-blob-3 {
          width: 44rem; height: 44rem;
          left: 34%; top: 2rem;
          background: radial-gradient(circle at center, rgba(21,128,61,0.55) 0%, rgba(21,128,61,0) 64%);
          animation: agxFloat3 30s ease-in-out infinite alternate;
        }
        .agx-blob-4 {
          width: 38rem; height: 38rem;
          right: 6%; bottom: -14rem;
          background: radial-gradient(circle at center, rgba(22,51,0,0.5) 0%, rgba(22,51,0,0) 62%);
          animation: agxFloat4 28s ease-in-out infinite alternate;
        }
        .agx-blob-5 {
          width: 34rem; height: 34rem;
          left: 8%; bottom: -12rem;
          background: radial-gradient(circle at center, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 60%);
          animation: agxFloat5 24s ease-in-out infinite alternate;
        }
        @keyframes agxFloat1 {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(6rem, 4rem) scale(1.12); }
        }
        @keyframes agxFloat2 {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(-5rem, 5rem) scale(1.1); }
        }
        @keyframes agxFloat3 {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(-4rem, -3rem) scale(1.15); }
        }
        @keyframes agxFloat4 {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(-6rem, -4rem) scale(1.12); }
        }
        @keyframes agxFloat5 {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(5rem, -3rem) scale(1.1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .agx-blob { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
