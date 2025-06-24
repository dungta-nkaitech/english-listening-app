'use client';
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export default function TopNavbar({ title, showBack = false }: { title: string; showBack?: boolean }) {
    const router = useRouter();

    return (
        <div className="h-12 flex items-center justify-between px-4 bg-[#1b5e20] text-white sticky top-0 z-10">
            {showBack ? (
                <button onClick={() => router.back()} className="text-white">
                    <FaArrowLeft />
                </button>
            ) : (
                <div className="w-4" />
            )}
            <h1 className="text-base font-semibold">{title}</h1>
            <div className="w-4" />
        </div>
    );
}
