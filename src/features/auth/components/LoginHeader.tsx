import Link from "next/link"; // ✨ 1. Link 컴포넌트 불러오기

export default function LoginHeader(){
    return (
    <>
        <div className="lg:hidden flex items-center gap-2 mb-12">
            <h2 className="text-slate-900 text-xl font-bold">COBIP</h2>
        </div>

        <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
                환영합니다
            </h2>
            <p className="text-slate-500">
                COBIP가 처음이신가요?{" "}
                {/* ✨ 2. a 태그를 Link 컴포넌트로 변경하고 href에 경로 지정 */}
                <Link href="/signup" className="text-slate-900 font-bold hover:underline">
                    회원가입하기
                </Link>
            </p>
        </div>
    </>
    );
}