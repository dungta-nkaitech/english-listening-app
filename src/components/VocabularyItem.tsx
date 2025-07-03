import { IUserVocabulary } from "@/types/vocabulary.interface";
import Link from "next/link";

interface Props {
  item: IUserVocabulary;
  onEdit?: (item: IUserVocabulary) => void;
  onDelete?: (item: IUserVocabulary) => void;
  hideEpisodeLink?: boolean;
}

export default function VocabularyItem({ item, onEdit, onDelete, hideEpisodeLink = false }: Props) {
  return (
    <div className="flex flex-col w-full">
      {/* Nội dung chính */}
      <div className="space-y-1 w-full">
        <h3 className="text-lg font-bold text-green-800 break-words">{item.word}</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{item.definition}</p>
        {item.example && <p className="italic text-gray-600">Example: {item.example}</p>}
        {!hideEpisodeLink && item.episodeId && (
          <>
            <span className="text-sm text-black-600 inline-block mt-1 mr-1">Episode:</span>
            <Link href={`/episode/${item.episodeId}`} className="text-sm text-blue-600 underline inline-block mt-1">
              {`${item.episodeTitle}`}
            </Link>
          </>
        )}
      </div>

      {/* Hàng nút dưới cùng */}
      {onEdit && onDelete && (
        <div className="mt-4 flex w-full justify-end space-x-4">
          <button onClick={() => onEdit(item)} className="text-sm text-blue-600 hover:underline">
            Edit
          </button>
          <button onClick={() => onDelete(item)} className="text-sm text-red-600 hover:underline">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
