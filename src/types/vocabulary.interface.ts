export interface IUserVocabulary {
  id: string;
  userId: string;
  episodeId?: string;
  word: string;
  definition: string;
  example?: string;
  createdAt: string;
}
