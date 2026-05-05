export default function StatsGrid(){
    const stats = [
        { label: "수강평 작성수", value: "-", icon: "rate_review" },
        { label: "평균평점", value: "-", icon: "star" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat) => (
            <div key={stat.label} className="group flex items-center justify-between p-6 bg-white border border-[#cbc3d7] rounded-[16px] shadow-[0px_4px_20px_rgba(18,18,18,0.04)] hover:border-[#6938d6]/50 transition-colors">
            <div className="space-y-1">
                <p className="text-[12px] font-semibold tracking-wider text-[#494454]">{stat.label}</p>
                <p className="text-[40px] font-bold tracking-tight text-[#1c1b1b]">{stat.value}</p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-[#f0edec] text-[#6938d6] rounded-2xl group-hover:bg-[#e9ddff] transition-colors">
                <span className="material-symbols-outlined text-[30px]">{stat.icon}</span>
            </div>
            </div>
        ))}
        </div>
    );
};