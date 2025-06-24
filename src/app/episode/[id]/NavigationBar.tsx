import { useRouter } from "next/navigation";
import { FaChevronLeft } from "react-icons/fa";

export default function NavigationBar() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between bg-green-800 text-white">
      <button
        onClick={() => router.push("/")}
        className="flex items-center space-x-1 font-semibold"
      >
        <FaChevronLeft />
        <span>EPISODE</span>
      </button>
    </div>
  );
}
