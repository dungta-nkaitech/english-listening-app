'use client';

import { ITranscript } from '@/types/episode.interface';
import { useEffect, useState } from 'react';

interface Props {
    transcripts: ITranscript[];
    currentTime: number;
    onClickTranscript?: (t: ITranscript) => void;
}

export default function TranscriptList({ transcripts, currentTime, onClickTranscript }: Props) {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const index = transcripts.findIndex(
            t => currentTime >= t.startTime && currentTime < t.endTime
        );
        if (index !== -1) {
            setActiveIndex(index);
        }
    }, [currentTime, transcripts]);

    const getVisibleTranscripts = () => {
        const start = Math.max(0, activeIndex - 3); // 3 dòng trên
        const end = Math.min(transcripts.length, start + 7); // tổng cộng 5 dòng
        return transcripts.slice(start, end);
    };

    const visible = getVisibleTranscripts();

    return (
        <div className=" flex flex-col justify-center items-start overflow-hidden">
            {visible.map((item, i) => {
                const isActive = item.id === transcripts[activeIndex]?.id;

                return (
                    <div
                        key={item.id}
                        className={`w-full px-2 py-1 text-[17px] leading-relaxed cursor-pointer ${
                            isActive ? 'font-semibold text-black' : 'text-gray-600'
                        }`}
                        onClick={() => onClickTranscript?.(item)}
                    >
                       
                        <span>{item.text}</span>
                    </div>
                );
            })}
        </div>
    );
}
