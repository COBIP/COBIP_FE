
import LoginHeader from "@/features/auth/components/LoginHeader";
import LoginAuth from "@/features/auth/components/LoginAuth";
import SocialLogin from "@/features/auth/components/SocialLogin";

export default function LoginPage() {
  return (
    <main className="w-full max-w-[440px] flex flex-col">
      <LoginHeader />
      <LoginAuth />
      <SocialLogin />
    </main>
  );
}