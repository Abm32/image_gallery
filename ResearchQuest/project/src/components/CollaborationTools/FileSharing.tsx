import React from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Download, Trash2, Share2 } from 'lucide-react';

export function FileSharing() {
  const [files, setFiles] = React.useState([
    {
      id: '1',
      name: 'research_proposal.pdf',
      size: '2.5 MB',
      type: 'PDF',
      uploadedBy: 'Dr. Sarah Johnson',
      uploadedAt: '2024-02-20'
    },
    {
      id: '2',
      name: 'dataset_analysis.xlsx',
      size: '4.8 MB',
      type: 'Excel',
      uploadedBy: 'Prof. Michael Chen',
      uploadedAt: '2024-02-19'
    }
  ]);

  const deleteFile = (fileId: string) => {
    setFiles(files.filter(file => file.id !== fileId));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold text-gray-900">File Sharing</h2>
        <p className="text-gray-600">
          Share and manage research files with your team.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Drag and drop files here, or{' '}
            <button className="text-indigo-600 hover:text-indigo-700">
              browse
            </button>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supported files: PDF, Word, Excel, Images
          </p>
        </div>
      </motion.div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Shared Files</h3>
        </div>
        <div className="divide-y">
          {files.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <FileText className="w-8 h-8 text-indigo-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{file.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{file.size}</span>
                      <span>•</span>
                      <span>Uploaded by {file.uploadedBy}</span>
                      <span>•</span>
                      <span>{file.uploadedAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}