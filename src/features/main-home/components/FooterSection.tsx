export function FooterSection() {
  return (
    <footer className="bg-white border-t py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#D7C9FB] rounded flex items-center justify-center text-slate-900">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect fill="currentColor" height="16" rx="3" width="16" x="4" y="4"></rect>
                <circle cx="12" cy="12" fill="#f6f6f8" r="3"></circle>
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">COBIP</span>
          </div>
          <p className="text-xs text-gray-400">
            © 2026 COBIP. 함께 성장하는 개발자 학습 플랫폼
          </p>
        </div>
      </div>
    </footer>
  );
}
