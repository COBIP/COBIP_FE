'use client';
import { useSignUp } from '@/hooks/useSignUp'; // Hook 가져오기
import Input from '@/features/auth/components/common/Input';
import Button from '@/features/auth/components/common/Button';

export default function SignUpAuth() {


    const { 
        formData, handleChange, handleSignUp,
        authCode, setAuthCode, isEmailSent, isVerified, handleSendCode, handleVerifyCode
    } = useSignUp()
    

    return (
        // 폼 제출 이벤트 연결
        <form onSubmit={handleSignUp} className="flex flex-col gap-5 mb-10">
        <Input
            id="nickname" text="닉네임" type="text" label="닉네임" className="mb-4"
            value={formData.nickname} onChange={handleChange}
        />

        <div className="flex items-end gap-2">
            <div className="flex-[4]">
            <Input
                id="email" text="*******@email.com" type="email" label="이메일"
                value={formData.email} onChange={handleChange}
            />
            </div>

            <button
            type="button" onClick={handleSendCode}
            className="h-[40px] px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shrink-0"
            >
            확인
            </button>
        </div>

        {/* ✨ 메일이 발송되었고, 아직 인증 전일 때만 인증번호 입력창 표시 */}
        {isEmailSent && !isVerified && (
            <EmailCodeSent 
                authCode={authCode}
                setAuthCode={setAuthCode}
                onVerify={handleVerifyCode}
            />
        )}

        <Input
            id="password" text="비밀번호" type="password" label="비밀번호" className="mb-4"
            value={formData.password} onChange={handleChange}
        />
        <Input
            id="passwordConfirm" text="비밀번호 확인" type="password" label="비밀번호 확인" className="mb-4"
            value={formData.passwordConfirm} onChange={handleChange}
        />

        <Terms id="terms1" content="이용약관" />
        <Terms id="terms2" content="이용약관" />

        {/* Button 타입 지정 필수 (type="submit") */}
        <Button text="회원가입" type="submit" />
        </form>
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

// ✨ 상태와 함수를 Props로 받도록 수정
export function EmailCodeSent({ authCode, setAuthCode, onVerify }: { 
    authCode: string, 
    setAuthCode: (val: string) => void, 
    onVerify: () => void 
}){
    return(
        <div className="flex flex-col gap-2 animate-in fade-in duration-300">
            <label className="text-sm font-bold text-slate-700" htmlFor="authCode">인증 번호</label>
            <div className="flex gap-2">
                <input 
                    className="flex-1 h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl"
                    id="authCode" 
                    placeholder="인증번호 6자리를 입력하세요" 
                    type="text"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)} // 입력값 상태 업데이트
                />
                <button 
                    type="button" // form 제출을 막기 위해 type="button" 명시
                    onClick={onVerify}
                    className="h-12 px-6 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shrink-0">
                    인증 확인
                </button>
            </div>
        </div>
    );
}