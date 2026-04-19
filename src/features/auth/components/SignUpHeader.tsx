export default function SignUPHeader(){
    return(
        <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
                회원가입
            </h2>
            <p className="text-slate-500">
                이미 계정이 있으신가요?
                <a className="text-slate-900 font-bold hover:underline" href="/login">
                    로그인
                </a>
            </p>
        </div>
    );
}