import ProfileHeader from '@/features/my-page/components/profile/ProfileHeader';
import ProfileIntro from '@/features/my-page/components/profile/ProfileIntro';

export default function MyPage() {

    return (
        <>
            <div className="flex flex-col flex-1 w-full h-full max-w-5xl gap-6 mx-auto">
                <ProfileHeader />
                
            
                <div className="flex flex-col flex-1 min-h-0 bg-white border border-[#cbc3d7] rounded-[16px] shadow-[0px_4px_20px_rgba(18,18,18,0.04)] overflow-hidden">
                    <ProfileIntro />
                </div> 
            </div>
        </>
    );
}

