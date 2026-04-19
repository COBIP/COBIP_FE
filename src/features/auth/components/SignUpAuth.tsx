import Input from '@/features/auth/components/common/Input'
import Button from '@/features/auth/components/common/Button';

export default function SignUpAuth(){
    return(
        <form className="flex flex-col gap-5 mb-10">
            <Input id='nickName' text='닉네임' type='text' label='닉네임' className='mb-4'/>
            <Input id='email' text='*******@email.com' type='email' label='이메일' className='mb-4'/>
            <Input id='password' text='비밀번호' type='password' label='비밀번호' className='mb-4'/>
            <Input id='passwordConfirm' text='비밀번호 확인' type='password' label='비밀번호 확인' className='mb-4'/>
            <Terms id="terms1" content="이용약관"/>
            <Terms id="terms2" content="이용약관"/>
            <Button text='회원가입'/>
        </form >
    );
}

export function Terms({ id, content }: { id: string, content: string }){
    return(
        <div className="flex items-center gap-3 mt-1 ml-6">
            <input 
                className="size-4 rounded border-slate-300 text-primary-purple focus:ring-primary-purple" 
                id={id} type="checkbox" 
            />
            <label htmlFor={id} className="text-sm text-slate-600 font-medium cursor-pointer" >
                {content}
            </label>
        </div>
    );
}