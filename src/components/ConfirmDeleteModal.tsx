"use client";

import React from "react";

interface ConfirmDeleteModalProps {
  open: boolean;
  status: "confirm" | "loading" | "success";
  onClose: () => void;
  onConfirm: () => void;
  itemWord: string;
}

export default function ConfirmDeleteModal({ open, status, onClose, onConfirm, itemWord }: ConfirmDeleteModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
        {status === "confirm" && (
          <>
            <p className="mb-4 text-sm text-gray-700">
              Are you sure you want to delete <strong>{itemWord}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm">
                Cancel
              </button>
              <button onClick={onConfirm} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm">
                Delete
              </button>
            </div>
          </>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-700 border-opacity-50 mb-4"></div>
            <p className="text-sm text-gray-700">Deleting...</p>
          </div>
        )}

        {status === "success" && (
          <>
            <h2 className="text-lg font-bold mb-4 text-green-700">Deleted Successfully!</h2>
            <button onClick={onClose} className="mt-2 px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 text-sm">
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
