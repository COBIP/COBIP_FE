import ProfileHeader from '@/features/my-page/components/profile/ProfileHeader';
import ProfileTabs  from '@/features/my-page/components/profile/ProfileTabs';

export default function MyPage() {

    return (
        <>
            <div className="flex flex-col flex-1 w-full h-full max-w-5xl gap-6 mx-auto">
                <ProfileHeader />
                
            
                <div className="flex flex-col flex-1 min-h-0">
                    <ProfileTabs />
                </div> 
            </div>
        </>
    );
}

