import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as fileService from '../../services/fileService';
import { FiSearch, FiDownload, FiFile, FiFolder, FiExternalLink, FiUser, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import TablePagination from '../../components/shared/TablePagination';

export const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const data = await fileService.getAllFiles();
      if (data.success) {
        setFiles(data.files);
      }
    } catch (err) {
      toast.error('Failed to load file records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Reset page to 1 whenever search or filter changes
  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <FiFile className="h-5 w-5 text-slate-400" />;
    if (fileType.includes('image')) return <FiFile className="h-5 w-5 text-emerald-400" />;
    if (fileType.includes('pdf')) return <FiFile className="h-5 w-5 text-red-400" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('compressed')) {
      return <FiFolder className="h-5 w-5 text-amber-400" />;
    }
    return <FiFile className="h-5 w-5 text-indigo-400" />;
  };

  // Client-side filter
  const filteredFiles = files.filter((f) => {
    const cleanSearch = search.trim().toLowerCase();
    const matchesSearch = !cleanSearch ||
      f.originalName?.toLowerCase().includes(cleanSearch) ||
      f.fileName?.toLowerCase().includes(cleanSearch);
    const matchesType = typeFilter === '' ||
      (typeFilter === 'image' && f.fileType?.includes('image')) ||
      (typeFilter === 'pdf' && f.fileType?.includes('pdf')) ||
      (typeFilter === 'document' && !f.fileType?.includes('image') && !f.fileType?.includes('pdf'));
    return matchesSearch && matchesType;
  });

  // Client-side pagination on filtered results
  const total = filteredFiles.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginatedFiles = filteredFiles.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">File Manager</h1>
        <p className="text-sm text-slate-400">View and download all user-uploaded project assets and request reference files.</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search files by name..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute top-2.5 left-3 text-slate-500">
            <FiSearch className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All File Types</option>
            <option value="image">Images</option>
            <option value="pdf">PDFs</option>
            <option value="document">Other Docs</option>
          </select>
        </div>
      </div>

      {/* Files List / Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40 shadow-xl">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : paginatedFiles.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-slate-500 space-y-2">
            <FiInfo className="h-8 w-8 text-slate-650" />
            <p className="text-base font-semibold">No files found</p>
            <p className="text-xs">No records matching your search filters are available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">File Name</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4">Uploaded By</th>
                  <th className="px-6 py-4">Linked Source</th>
                  <th className="px-6 py-4">Date Uploaded</th>
                  <th className="px-6 py-4 text-center">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-transparent">
                {paginatedFiles.map((file) => (
                  <tr key={file._id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 border border-slate-850 rounded-lg shrink-0">
                          {getFileIcon(file.fileType)}
                        </div>
                        <div className="overflow-hidden max-w-xs md:max-w-sm">
                          <p className="truncate font-semibold text-white" title={file.originalName}>
                            {file.originalName}
                          </p>
                          <p className="text-xxs text-slate-500 font-mono truncate">{file.fileName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-medium">
                      {formatBytes(file.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xxs uppercase">
                          {file.uploadedBy?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">{file.uploadedBy?.fullName || 'System'}</div>
                          <div className="text-xxs text-slate-500 capitalize">{file.uploadedBy?.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {file.project ? (
                        <Link
                          to={`/admin/projects/${file.project._id}`}
                          className="inline-flex items-center gap-1 text-xs text-indigo-450 hover:underline hover:text-indigo-300 font-medium"
                        >
                          <FiFolder className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[120px]">{file.project.projectName}</span>
                          <FiExternalLink className="h-3 w-3" />
                        </Link>
                      ) : file.request ? (
                        <Link
                          to={`/admin/requests/${file.request._id}`}
                          className="inline-flex items-center gap-1 text-xs text-amber-450 hover:underline hover:text-amber-300 font-medium"
                        >
                          <FiFile className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[120px]">{file.request.title}</span>
                          <FiExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-550 italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                      {new Date(file.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <a
                        href={file.filePath?.startsWith('http') ? file.filePath : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}${file.filePath}`}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <FiDownload className="h-4.5 w-4.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          />
        )}
      </div>
    </div>
  );
};

export default FileManager;
