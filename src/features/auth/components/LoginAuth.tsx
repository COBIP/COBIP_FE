"use client"; // ✨ 1. 사용자 입력을 받고 페이지를 이동시키려면 최상단에 필수!

import { useState } from "react";
import { useAuthMutation } from "@/hooks/useAuthMutation"; //

export default function LoginAuth() {
    const { mutateLogin, isLoading } = useAuthMutation(); //
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 1. 서버로 정보를 보냅니다. (이메일, 비밀번호)
        await mutateLogin({ email, password }); // 
    };

    return (
        // ✨ form 태그에 onSubmit 이벤트 연결
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
                type="email" 
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border px-4 py-2 rounded-lg"
            />
            <input 
                type="password" 
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border px-4 py-2 rounded-lg"
            />
            
            <button 
                type="submit" 
                className="bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700 transition"
            >
                로그인
            </button>
        </form>
    );
}