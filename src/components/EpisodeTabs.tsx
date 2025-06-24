'use client';

import { useState } from 'react';
import { IEpisode } from '@/types/episode.interface';
import EpisodeCard from './EpisodeCard';

type Tab = 'all' | 'favorites' | 'learned';

export default function EpisodeTabs({ episodes }: { episodes: IEpisode[] }) {
    const [currentTab, setCurrentTab] = useState<Tab>('all');

    // Fake data (sau này thay bằng real user state)
    const favoriteIds = ['ep001', 'ep002'];
    const learnedIds = ['ep003'];

    const filtered = episodes.filter((ep) => {
        if (currentTab === 'favorites') return favoriteIds.includes(ep.id);
        if (currentTab === 'learned') return learnedIds.includes(ep.id);
        return true;
    });

    return (
        <div>
            {/* Tabs */}
            <div className="flex gap-2 mb-3">
                <button
                    onClick={() => setCurrentTab('all')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                        currentTab === 'all'
                            ? 'bg-green-700 text-white'
                            : 'bg-gray-200 text-gray-700'
                    }`}
                >
                    All Episodes
                </button>
                <button
                    onClick={() => setCurrentTab('favorites')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                        currentTab === 'favorites'
                            ? 'bg-green-700 text-white'
                            : 'bg-gray-200 text-gray-700'
                    }`}
                >
                    Favorites
                </button>
                <button
                    onClick={() => setCurrentTab('learned')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                        currentTab === 'learned'
                            ? 'bg-green-700 text-white'
                            : 'bg-gray-200 text-gray-700'
                    }`}
                >
                    Learned
                </button>
            </div>

            {/* Cards */}
            <div className="space-y-3">
                {filtered.map((ep) => (
                    <EpisodeCard key={ep.id} episode={ep} />
                ))}
                {filtered.length === 0 && (
                    <p className="text-sm text-gray-500 text-center">No episodes to show.</p>
                )}
            </div>
        </div>
    );
}
