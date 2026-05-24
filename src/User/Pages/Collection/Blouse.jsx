const Blouse = () => {
  return (
    <section className="max-w-[1440px] mx-auto px-8 md:px-20 py-20">
      <div className="text-center max-w-3xl mx-auto">
        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#854c6f] mb-4">
          Category
        </p>
        <h2
          className="text-[42px] md:text-[52px] text-[#1f1a1d] leading-tight mb-4"
          style={{ fontFamily: "'Noto Serif', serif", fontWeight: 400 }}
        >
          Blouse
        </h2>
        <p className="text-[16px] text-[#504349] leading-relaxed mx-auto max-w-2xl">
          A polished edit is coming soon. We’re preparing a refined collection of blouses with elegant silhouettes, soft textures, and unique details that are made to feel effortless.
        </p>
        <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-[#d4c2c9] bg-[#fff8f8] px-6 py-4">
          <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#854c6f]">
            Coming Soon
          </span>
          <span className="text-[10px] text-[#82737a]">Stay tuned for the next drop.</span>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-[28px] overflow-hidden border border-[#e8dee1] bg-gradient-to-br from-[#fff7f7] via-[#fdf4f4] to-[#f4ecef] shadow-sm"
          >
            <div className="aspect-[3/4] bg-[#f9eef1] flex items-center justify-center">
              <div className="text-center px-6">
                <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-[#92727d] mb-3">
                  Preview
                </p>
                <div className="h-24 w-24 rounded-full bg-[#f4e3e8] shadow-inner" />
              </div>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#854c6f]">
                Refined Statement
              </p>
              <p className="text-[16px] text-[#1f1a1d] font-semibold">
                Signature silhouettes are on the way.
              </p>
              <p className="text-[13px] text-[#82737a] leading-relaxed">
                Gentle textures, softly tailored details, and an effortless color palette.
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Blouse;
