type BreadcrumbBannerProps = {
  title: string;
  subtitle?: string;
};

export default function BreadcrumbBanner({
  title,
  subtitle,
}: BreadcrumbBannerProps) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#050505]">
      <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_10%,rgba(247,194,90,0.18),transparent_60%),linear-gradient(to_bottom,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#f7c25a]">
          OG Tires & Rims
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}