import React, { useCallback } from 'react';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';

export const FileUpload = ({ files, setFiles }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
    },
    [setFiles]
  );

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-800 bg-slate-900/30 px-6 py-8 transition-colors hover:bg-slate-900/50"
      >
        <FiUploadCloud className="h-10 w-10 text-slate-500 mb-3" />
        <p className="text-sm text-slate-350">
          Drag and drop files here, or{' '}
          <label className="cursor-pointer text-indigo-400 hover:text-indigo-300 hover:underline">
            browse
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </p>
        <p className="mt-1 text-xxs text-slate-500">Supports PDF, JPG, PNG, DOC, ZIP. Max 50MB per file.</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Selected Files ({files.length})</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-2.5"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FiFile className="h-5 w-5 shrink-0 text-indigo-400" />
                  <div className="overflow-hidden">
                    <p className="truncate text-xs font-semibold text-white">{file.name}</p>
                    <p className="text-xxs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="rounded-md p-1 hover:bg-slate-800 hover:text-red-400 text-slate-500 transition-colors"
                >
                  <FiX className="h-4.5 w-4.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default FileUpload;
