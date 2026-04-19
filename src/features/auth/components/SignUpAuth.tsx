'use client';
import { useState } from 'react';
import Input from '@/features/auth/components/common/Input'
import Button from '@/features/auth/components/common/Button';

export default function SignUpAuth(){
    const [isEmailSent, setIsEmailSent] = useState(false);
    const handleSendCode = () => {
        alert('인증 번호가 발송되었습니다.');
        setIsEmailSent(true);
    };

    return(
        <form className="flex flex-col gap-5 mb-10">
            <Input id='nickName' text='닉네임' type='text' label='닉네임' className='mb-4'/>
            <div className="flex items-end gap-2">
                <div className="flex-[4]"> {/* 입력창 비중을 높임 (기존 flex-1보다 강력) */}
                    <Input id='email' text='*******@email.com' type='email' label='이메일' className=''/>
                </div>
                
                <button type="button" onClick={handleSendCode}
                    className="h-[40px] px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shrink-0">
                    확인
                </button>
            </div>
            {isEmailSent && (
                <EmailCodeSent></EmailCodeSent>
            )}
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

export function EmailCodeSent(){
    return(
        <div className="flex flex-col gap-2 animate-in fade-in duration-300">
            <label className="text-sm font-bold text-slate-700" htmlFor="authCode">인증 번호</label>
            <div className="flex gap-2">
                <input 
                    className="flex-1 h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D7C9FB]/50 focus:border-[#D7C9FB] transition-all duration-200"
                    id="authCode" 
                    placeholder="인증번호를 입력하세요" 
                    type="text"/>
                <button 
                    className="h-12 px-6 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shrink-0">
                    인증 확인
                </button>
            </div>
        </div>
    );
}