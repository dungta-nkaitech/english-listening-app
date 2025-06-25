"use client";

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ITranscript } from "@/types/episode.interface";
import { FaAngleDoubleDown, FaAngleDoubleUp } from "react-icons/fa";

export interface TranscriptListRef {
  scrollToActive: () => void;
}

interface Props {
  transcripts: ITranscript[];
  currentTime: number;
  onClickTranscript?: (t: ITranscript) => void;
}

const TranscriptList = forwardRef<TranscriptListRef, Props>(
  ({ transcripts, currentTime, onClickTranscript }, ref) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHighlightVisible, setIsHighlightVisible] = useState(true);
    const [showBackButton, setShowBackButton] = useState(false);
    const [highlightDirection, setHighlightDirection] = useState<"up" | "down">(
      "down"
    );
    const [isAutoScroll, setIsAutoScroll] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Cập nhật activeIndex theo currentTime
    useEffect(() => {
      const index = transcripts.findIndex(
        (t) => currentTime >= t.startTime && currentTime < t.endTime
      );
      if (index !== -1) {
        setActiveIndex(index);
      }
    }, [currentTime, transcripts]);

    // Scroll khi activeIndex thay đổi và isAutoScroll = true
    useEffect(() => {
      if (isAutoScroll) {
        const el = itemRefs.current[activeIndex];
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, [activeIndex, isAutoScroll]);

    // Theo dõi scroll tay của user
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      let timeout: NodeJS.Timeout;

      const handleScroll = () => {
        setIsAutoScroll(false);
        setShowBackButton(true);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          checkVisibility();
        }, 500);
      };

      const checkVisibility = () => {
        const el = itemRefs.current[activeIndex];
        if (!el || !container) return;

        const itemTop = el.getBoundingClientRect().top;
        const containerTop = container.getBoundingClientRect().top;

        setHighlightDirection(itemTop < containerTop ? "up" : "down");
      };

      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }, [activeIndex]);

    // Quan sát dòng active có đang trong view không
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsHighlightVisible(true);
              setIsAutoScroll(true);
              setShowBackButton(false);
            } else {
              setIsHighlightVisible(false);
              const itemTop = entry.boundingClientRect.top;
              const containerTop = container.getBoundingClientRect().top;
              setHighlightDirection(itemTop < containerTop ? "up" : "down");
            }
          });
        },
        {
          root: container,
          threshold: 0.8,
        }
      );

      const el = itemRefs.current[activeIndex];
      if (el) observer.observe(el);

      return () => {
        if (el) observer.unobserve(el);
      };
    }, [activeIndex]);

    // Hàm scroll ra ngoài qua ref
    const scrollToActive = () => {
      const el = itemRefs.current[activeIndex];
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      setIsAutoScroll(true);
      setShowBackButton(false);
    };

    // Expose ra ngoài thông qua ref
    useImperativeHandle(ref, () => ({
      scrollToActive,
    }));

    return (
      <div className="relative h-full flex-1 overflow-hidden">
        {showBackButton && !isHighlightVisible && (
          <button
            onClick={scrollToActive}
            className="absolute z-10 right-4 bottom-4 w-12 h-12 bg-[#016630] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
            title="Quay lại đoạn đang phát"
          >
            {highlightDirection === "up" ? (
              <FaAngleDoubleUp size={24} />
            ) : (
              <FaAngleDoubleDown size={24} />
            )}
          </button>
        )}

        <div
          ref={containerRef}
          className="h-full overflow-y-auto px-2 space-y-1 pb-20"
        >
          {transcripts.map((item, i) => {
            const isActive = i === activeIndex;
            return (
              <div
                key={item.id}
                ref={(el) => (itemRefs.current[i] = el)}
                className={`w-full py-1 text-[17px] leading-relaxed cursor-pointer ${
                  isActive ? "font-semibold text-black" : "text-gray-600"
                }`}
                onClick={() => {
                  const selection = window.getSelection()?.toString().trim();
                  if (!selection) {
                    onClickTranscript?.(item);
                  }
                }}
              >
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

TranscriptList.displayName = "TranscriptList";
export default TranscriptList;
