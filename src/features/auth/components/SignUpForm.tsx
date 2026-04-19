import SignUPHeader from "@/features/auth/components/SignUpHeader";
import SignUpAuth from "@/features/auth/components/SignUpAuth";

export default function SignUpForm() {
    return (
        <div className="w-full max-w-[440px] flex flex-col">
            <SignUPHeader/>
            <SignUpAuth/>
        </div>
    );
}