import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUpApi } from '@/api/services/Auth';
import { type SignUpFormData } from '@/types/AuthTypes';

export const useSignUp = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<SignUpFormData>({
        nickname: '',
        email: '',
        password: '',
        passwordConfirm: '',
    });

    // 입력값 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    // 회원가입 실행 로직
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
        }

        try {
            const result = await signUpApi({
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.passwordConfirm, // ✨ 프론트엔드 상태 -> 백엔드 변수명으로 매핑!
                nickname: formData.nickname,
            });

            if (result.success) {
                alert('회원가입이 완료되었습니다!');
                router.push('/login'); // 성공 시 로그인 페이지로 이동
            } else {
                alert(`가입 실패: ${result.message}`);
            }
        } catch (error) {
            console.error('SignUp Error:', error);
      
            // ✨ Error 객체인지 확인하고, 백엔드에서 던진 진짜 메시지를 alert로 띄워줍니다.
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert('회원가입 처리 중 알 수 없는 오류가 발생했습니다.');
            }
        }
    };

    return { formData, handleChange, handleSignUp };
};