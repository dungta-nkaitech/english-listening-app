import { notFound } from "next/navigation";
import EpisodeDetail from "./EpisodeDetail";
import { getEpisodeById } from "@/lib/fetchEpisodeById";

export default async function EpisodePagee({ params }) {
    const episode = await getEpisodeById(params.id);
    if (!episode) return notFound();

    return <EpisodeDetail episode={episode} />;
}
