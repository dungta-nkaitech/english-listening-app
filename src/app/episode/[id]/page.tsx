import { notFound } from "next/navigation";
import EpisodeDetail from "./EpisodeDetail";
import {
  getEpisodeById,
  getTranscriptsByEpisodeId,
  getVocabByEpisodeId,
} from "@/lib/fetchEpisodeById";

type EpisodePageProps = {
  params: {
    id: string;
  };
};

export default async function EpisodePage({ params }: EpisodePageProps) {
  const episode = await getEpisodeById(params.id);
  if (!episode) return notFound();

  const [transcripts, vocabItems] = await Promise.all([
    getTranscriptsByEpisodeId(episode.id),
    getVocabByEpisodeId(episode.id),
  ]);

  return (
    <EpisodeDetail
      episode={episode}
      transcripts={transcripts}
      vocabItems={vocabItems}
    />
  );
}
