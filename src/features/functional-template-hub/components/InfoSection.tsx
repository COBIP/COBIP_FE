import { STATS } from '@/features/functional-template-hub/Constants';

export function InfoSection() {
  return (
    <section className="mt-16 pt-8 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stat.number}
            </div>
            <p className="text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}