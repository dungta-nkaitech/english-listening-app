export default function SaveStatusModal({ open, status, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-700 mb-4 mx-auto"></div>
            <p className="text-sm text-gray-700">Saving...</p>
          </>
        )}
        {status === "success" && (
          <>
            <h2 className="text-lg font-bold mb-4 text-green-700">Saved Successfully!</h2>
            <button onClick={onClose} className="mt-2 px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 text-sm">
              Close
            </button>
          </>
        )}
        {status === "error" && (
          <>
            <h2 className="text-lg font-bold mb-4 text-red-700">Failed to Save!</h2>
            <button onClick={onClose} className="mt-2 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm">
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
