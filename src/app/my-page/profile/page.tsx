import { ExternalAssets } from '@/features/my-page/components/profile/ExternalAssets';
import ProfileHeader from '@/features/my-page/components/profile/ProfileHeader';
import ProfileTabs  from '@/features/my-page/components/profile/ProfileTabs';

export default function MyPage() {
    const user = {
        nickName : "nickName",
        image: "/test.png"
    };

    return (
        <>
            <ExternalAssets />
            <div className="flex flex-col flex-1 w-full h-full max-w-5xl gap-6 mx-auto">
                <ProfileHeader 
                    nickName={user.nickName} 
                    profileImage={user.image} 
                />
                
                <div className="flex flex-col flex-1 min-h-0">
                    <ProfileTabs />
                </div> 
            </div>
        </>
    );
}

