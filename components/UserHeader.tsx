"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserHeader() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (!user) return null;

    const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Traveler";
    const avatarUrl = user.user_metadata?.avatar_url;

    return (
        <div className="absolute top-4 right-16 z-40 flex items-center gap-3 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-6 h-6 rounded-full" />
            ) : (
                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <User size={14} />
                </div>
            )}
            <span className="text-xs font-medium text-slate-700 max-w-[100px] truncate">
                {displayName}
            </span>
            <div className="w-px h-3 bg-slate-200" />
            <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-500 transition-colors"
                title="Log Out"
            >
                <LogOut size={14} />
            </button>
        </div>
    );
}
