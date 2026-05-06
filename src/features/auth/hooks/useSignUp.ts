import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUpApi } from '@/api/services/Auth';
import { SignUpFormData } from '@/types/Auth.type';

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
            alert('서버와 연결할 수 없습니다.');
        }
    };

    return { formData, handleChange, handleSignUp };
};