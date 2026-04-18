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
                <a className="text-slate-900 font-bold hover:underline" href="#">
                    회원가입하기
                </a>
            </p>
        </div>
      </>
    );
}