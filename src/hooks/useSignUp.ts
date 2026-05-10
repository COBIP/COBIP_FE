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
            const result = await sendEmailCodeApi({ email: formData.email });
            if (!result.success) {
                throw new Error(result.message || '인증 번호 발송에 실패했습니다.');
            }

            alert(result.message || '인증 번호가 발송되었습니다.');
            setIsEmailSent(true);
        } catch (error) {
            alert(error instanceof Error ? error.message : '발송 실패');
        }
    };

    // 2. 이메일 인증 확인
    const handleVerifyCode = async () => {
        try {
            const result = await verifyEmailCodeApi({ email: formData.email, code: authCode });
            if (!result.success) {
                throw new Error(result.message || '인증에 실패했습니다.');
            }

            alert(result.message || '인증 완료!');
            setIsVerified(true);
        } catch (error) {
            alert(error instanceof Error ? error.message : '인증 실패');
        }
    };

    // 3. 회원가입 실행
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isVerified) return alert('이메일 인증을 해주세요.');
        if (formData.password !== formData.passwordConfirm) return alert('비밀번호가 다릅니다.');

        try {
            const result = await signUpApi({
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.passwordConfirm,
                nickname: formData.nickname,
            });
            if (!result.success) {
                throw new Error(result.message || '가입 실패');
            }

            alert(result.message || '회원가입 성공!');
            router.push('/login');
        } catch (error) {
            alert(error instanceof Error ? error.message : '가입 실패');
        }
    };

    return {
        formData, handleChange, handleSignUp,
        authCode, setAuthCode, isEmailSent, isVerified,
        handleSendCode, handleVerifyCode
    };
};
