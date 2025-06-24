'use client';

import EpisodeDetail from './EpisodeDetail';
import { mockEpisodes } from '../../../lib/mockEpisode';

export default function Page() {
    return <EpisodeDetail episode={mockEpisodes[0]}></EpisodeDetail>;
}
