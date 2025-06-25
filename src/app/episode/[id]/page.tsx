import { notFound } from "next/navigation";
import EpisodeDetail from "./EpisodeDetail";
import {
  getEpisodeById,
  getTranscriptsByEpisodeId,
  getVocabByEpisodeId,
} from "@/lib/fetchEpisodeById";

// ✅ KHÔNG KHAI BÁO KIỂU params TAY
export default async function EpisodePagee({ params }) {
  const episode = await getEpisodeById(params.id);
  if (!episode) return notFound();

  const [transcripts, vocabItems] = await Promise.all([
    getTranscriptsByEpisodeId(episode.id),
    getVocabByEpisodeId(episode.id),
  ]);

  console.log(vocabItems.length);

  return (
    <EpisodeDetail
      episode={episode}
      transcripts={transcripts}
      vocabItems={vocabItems}
    />
  );
}
