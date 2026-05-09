"use client"; // ✨ 1. 사용자 입력을 받고 페이지를 이동시키려면 최상단에 필수!

import { useState } from "react";
import { useRouter } from "next/navigation"; // ✨ 2. 페이지 이동을 위한 useRouter (next/router 아님 주의!)
import { useAuthMutation } from "@/hooks/useAuthMutation"; //

export default function LoginAuth() {
    const { mutateLogin, isLoading } = useAuthMutation(); //
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // const handleLogin = (e: React.FormEvent) => {
    //     e.preventDefault(); // form의 기본 기능인 '페이지 새로고침'을 막아줍니다.

    //     // ✨ 3. 더미 데이터로 로그인 검사
    //     if (email === "test@cobip.com" && password === "1234") {
    //         // 로그인 성공!
    //         alert("로그인 성공! 환영합니다.");
            
    //         // 메인 페이지로 이동
    //         router.push("/main-home"); 
            
    //         /* (나중에는 여기에 상태 관리 라이브러리(Zustand 등)나 
    //            localStorage를 써서 '나 로그인했음' 이라는 증표를 남겨둘 겁니다) */
    //     } else {
    //         // 로그인 실패!
    //         alert("이메일이나 비밀번호를 다시 확인해주세요.");
    //     }
    // };

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