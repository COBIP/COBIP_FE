import { Share2, CheckCircle } from "lucide-react";

export function ShareSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
              <Share2 className="w-3.5 h-3.5" />
              템플릿 공유
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              만든 템플릿을 공유하고
              <br />
              <span className="text-purple-600">다른 사람들과 함께</span> 성장하세요
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              내가 만든 템플릿을 공유하면 다른 사람들도 사용할 수 있어요.
              <br />
              공유된 템플릿은 메인 페이지의 템플릿 목록에 추가되어
              <br />
              모두가 함께 배우고 성장하는 생태계를 만들어가요.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600">공개 / 비공개 설정 가능</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600">템플릿 맞춤 수정</span>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold">
                  S
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">서현준</p>
                  <p className="text-xs text-gray-500">JWT 로그인 템플릿 제작자</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Share2 className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">템플릿을 공유했습니다</span>
                </div>
                <p className="text-sm text-gray-500">
                  &ldquo;React + Spring Security를 활용한 JWT 로그인 기능 템플릿입니다.
                  <br />
                  Redis를 같이 곁들여서 refresh token 관리까지 해봤어요!&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
