import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function LibraryPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/api/auth/signin?callbackUrl=/library');
    }
    redirect(`/u/${session.user.id}/${session.user.handle || 'user'}?section=library`);
}