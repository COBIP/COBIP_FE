import { STATS } from '@/features/functional-template-hub/Constants';

export function InfoSection() {
  return (
    <section className="mt-8 border-t border-[#E2E8F0] pt-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="mb-2 text-[28px] font-bold text-[#7C3AED]">
              {stat.number}
            </div>
            <p className="text-sm text-[#64748B]">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
