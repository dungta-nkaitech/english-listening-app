'use client'

import { useState } from 'react'
import { IUserVocabulary } from '@/types/vocabulary.interface'
import VocabularyItem from '@/components/VocabularyItem'
import AddVocabularyForm from '@/components/AddVocabularyForm'
import { MdOutlinePostAdd } from 'react-icons/md'

interface Props {
    userVocabItems: IUserVocabulary[]
    systemVocabItems: IUserVocabulary[]
    onEditUserVocab?: (item: IUserVocabulary) => void
    onDeleteUserVocab?: (item: IUserVocabulary) => void
    onSaveNewUserVocab?: (data: { word: string; definition: string; example: string }) => void
}

export default function VocabularyList({
    userVocabItems,
    systemVocabItems,
    onEditUserVocab,
    onDeleteUserVocab,
    onSaveNewUserVocab,
}: Props) {
    const [showAddForm, setShowAddForm] = useState(false)

    return (
        <div className="max-w-2xl mx-auto px-2 py-2 space-y-6">
            {/* Your Vocabulary Section */}
            <div className="border rounded-lg bg-white shadow">
                <div className="flex items-center justify-between px-4 py-3 border-b text-green-800 font-bold bg-gray-50 rounded-t-lg">
                    <span>Your Vocabulary</span>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="text-green-800 p-2 hover:scale-105 transition rounded-full"
                    >
                        <MdOutlinePostAdd size={20} />
                    </button>
                </div>
                <div>
                    {userVocabItems.map((item, idx) => (
                        <div
                            key={item.id}
                            className={`px-4 py-3 ${
                                idx < userVocabItems.length - 1
                                    ? 'border-b border-dashed border-gray-300'
                                    : ''
                            }`}
                        >
                            <VocabularyItem
                                item={item}
                                onEdit={onEditUserVocab}
                                onDelete={onDeleteUserVocab}
                                hideEpisodeLink
                            />
                        </div>
                    ))}
                    {userVocabItems.length === 0 && (
                        <div className="text-center text-gray-400 py-4">
                            No personal vocabulary yet.
                        </div>
                    )}
                </div>
            </div>

            {/* System Vocabulary Section */}
            <div className="border rounded-lg bg-white shadow">
                <div className="px-4 py-3 border-b text-green-800 font-bold bg-gray-50 rounded-t-lg">
                    Episode&apos;s Vocabulary
                </div>
                <div>
                    {systemVocabItems.map((item, idx) => (
                        <div
                            key={item.id}
                            className={`px-4 py-3 ${
                                idx < systemVocabItems.length - 1
                                    ? 'border-b border-dashed border-gray-300'
                                    : ''
                            }`}
                        >
                            <VocabularyItem item={item} hideEpisodeLink />
                        </div>
                    ))}
                    {systemVocabItems.length === 0 && (
                        <div className="text-center text-gray-400 py-4">
                            No system vocabulary available.
                        </div>
                    )}
                </div>
            </div>

            {/* Add Form Modal */}
            {showAddForm && (
                <AddVocabularyForm
                    onClose={() => setShowAddForm(false)}
                    onSave={(data) => {
                        onSaveNewUserVocab?.(data)
                        setShowAddForm(false)
                    }}
                />
            )}
        </div>
    )
}
