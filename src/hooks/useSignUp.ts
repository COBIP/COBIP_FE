import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUpApi, sendEmailCodeApi, verifyEmailCodeApi } from '@/api/services/AuthService';
import { type SignUpFormData } from '@/types/AuthTypes';

export const useSignUp = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<SignUpFormData>({
        nickname: '',
        email: '',
        password: '',
        passwordConfirm: '',
    });

    const [authCode, setAuthCode] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    // 입력값 변경
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    // 1. 이메일 발송
    const handleSendCode = async () => {
        try {
            await sendEmailCodeApi({ email: formData.email });
            alert('인증 번호가 발송되었습니다.');
            setIsEmailSent(true);
        } catch {
            alert('발송 실패');
        }
    };

    // 2. 이메일 인증 확인
    const handleVerifyCode = async () => {
        try {
            await verifyEmailCodeApi({ email: formData.email, code: authCode });
            alert('인증 완료!');
            setIsVerified(true);
        } catch {
            alert('인증 실패');
        }
    };

    // 3. 회원가입 실행
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isVerified) return alert('이메일 인증을 해주세요.');
        if (formData.password !== formData.passwordConfirm) return alert('비밀번호가 다릅니다.');

        try {
            await signUpApi({
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.passwordConfirm,
                nickname: formData.nickname,
            });
            alert('회원가입 성공!');
            router.push('/login');
        } catch {
            alert('가입 실패');
        }
    };

    return {
        formData, handleChange, handleSignUp,
        authCode, setAuthCode, isEmailSent, isVerified,
        handleSendCode, handleVerifyCode
    };
};