import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa";

export default function NavigationBar() {
  return (
    <div className="flex items-center justify-between bg-green-800 text-white">
      <Link
        href="/"
        className="flex items-center space-x-1 font-semibold px-2 py-1"
      >
        <FaChevronLeft />
        <span>ALL EPISODES</span>
      </Link>
    </div>
  );
}
