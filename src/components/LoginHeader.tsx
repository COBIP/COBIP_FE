export default function LoginHeader(){
    return (
      <>
        <div className="lg:hidden flex items-center gap-2 mb-12">
            <h2 className="text-slate-900 text-xl font-bold">COBIZ</h2>
        </div>

        <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Welcome Back
            </h2>
            <p className="text-slate-500">
                New to COBIZ?{" "}
                <a className="text-slate-900 font-bold hover:underline" href="#">
                    Create an account
                </a>
            </p>
        </div>
      </>
    );
}