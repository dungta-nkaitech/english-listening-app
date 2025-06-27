export interface IEpisode {
  id: string;
  episodeUrl: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  quizUrl?: string;
}

export interface ITranscript {
  id: string;
  episodeId: string;
  order: number;
  text: string;
  speaker?: string | null;
  startTime: number;
  endTime: number;
}

export interface IVocabItem {
  id: string;
  episodeId: string;
  word: string;
  definition: string;
  example?: string;
}

export interface IEpisodeWithStatus extends IEpisode {
  isFavorite: boolean;
  isLearned: boolean;
}
