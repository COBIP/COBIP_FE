import LoginForm from '@/features/auth/components/LoginForm';
import LeftPage from "@/features/auth/components/LeftPage";

const loginPage = () => {
    const meshBackgroundStyle = {
        backgroundColor: "#f6f6f8",
        backgroundImage: `
        radial-gradient(at 0% 0%, rgba(215, 201, 251, 0.4) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(215, 201, 251, 0.3) 0px, transparent 50%),
        radial-gradient(at 50% 50%, rgba(215, 201, 251, 0.1) 0px, transparent 50%)
        `,
    };
    
    return(
        <div className="flex w-full min-h-screen bg-white">
            <div
                className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden"
                style={meshBackgroundStyle}
            >
                <LeftPage />
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <LoginForm />
            </div>
        </div>
    );
}

export default loginPage;