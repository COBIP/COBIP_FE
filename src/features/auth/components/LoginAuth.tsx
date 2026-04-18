
import Input from "@/features/auth/components/common/Input";
import LButton from "@/features/auth/components/common/Button"

export default function LoginAuth(){
    return (
        <form className="flex flex-col gap-5 mb-10">

            <Input id="email" text="******@email.com" type="email" label="이메일" className=""/>
            

            <div className="relative">
                <Input id="email" text="••••••••" type="password" label="비밀번호" className="w-full"/>
            
                <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    type="button" >
                </button>        
            </div>


            <div className="flex items-center gap-3 mt-1">
                <input 
                    className="size-4 rounded border-slate-300 text-[#D7C9FB] focus:ring-[#D7C9FB]" 
                    id="remember" type="checkbox" 
                />
                <label className="text-sm text-slate-600 font-medium cursor-pointer" htmlFor="remember">
                    아이디 저장
                </label>
            </div>

            <LButton text="로그인"></LButton>
        </form>
    );
}