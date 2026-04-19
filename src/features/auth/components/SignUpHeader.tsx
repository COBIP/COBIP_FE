import Link from "next/link"; // ✨ 1. Link 불러오기

export default function SignUPHeader(){
    return(
        <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
                회원가입
            </h2>
            <p className="text-slate-500">
                이미 계정이 있으신가요?{" "}
                {/* ✨ 2. a 태그를 Link로 변경 */}
                <Link href="/login" className="text-slate-900 font-bold hover:underline">
                    로그인
                </Link>
            </p>
        </div>
    );
}