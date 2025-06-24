import { useRouter } from 'next/router';
import { FaChevronLeft, FaHeart, FaCheckCircle, FaCog } from 'react-icons/fa';
import { useState } from 'react';

export default function NavigationBar() {
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLearned, setIsLearned] = useState(false);

    return (
        <div className="flex items-center justify-between px-4 py-2 bg-green-800 text-white">
            <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-1 font-semibold"
            >
                <FaChevronLeft />
                <span>HỌC TIẾNG ANH</span>
            </button>

            <div className="flex items-center space-x-4">
                <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`text-xl transition ${
                        isFavorite ? 'text-red-400' : 'text-white'
                    }`}
                    aria-label="Yêu thích"
                >
                    <FaHeart />
                </button>

                <button
                    onClick={() => setIsLearned(!isLearned)}
                    className={`text-xl transition ${
                        isLearned ? 'text-green-400' : 'text-white'
                    }`}
                    aria-label="Đã học"
                >
                    <FaCheckCircle />
                </button>

                <button aria-label="Cài đặt">
                    <FaCog />
                </button>
            </div>
        </div>
    );
}

