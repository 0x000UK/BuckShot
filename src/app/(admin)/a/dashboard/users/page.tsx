import UsersView from "@/components/admin/UserView";
import { getAllUsers } from "@/lib/queries";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function UsersPage(){
    const users = await getAllUsers()
    if(!users) return notFound()
    return (
        <Suspense fallback={<div className="text-white/40 font-jost text-xs">Loading users...</div>}>
            <UsersView users={users}/>
        </Suspense>
    );
}