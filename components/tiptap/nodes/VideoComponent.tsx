import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Film, Play, Trash2, ExternalLink } from 'lucide-react';

export function VideoComponent({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const { src, videoType, title, caption } = node.attrs;

  // Extract YouTube video ID
  const getYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  // Extract Vimeo video ID
  const getVimeoId = (url: string): string | null => {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
  };

  const renderEmbed = () => {
    if (!src) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Film size={48} className="mb-2" />
          <p className="text-sm">No video URL set</p>
        </div>
      );
    }

    if (videoType === 'youtube') {
      const videoId = getYouTubeId(src);
      if (videoId) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full aspect-video rounded"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        );
      }
    }

    if (videoType === 'vimeo') {
      const videoId = getVimeoId(src);
      if (videoId) {
        return (
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            className="w-full aspect-video rounded"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
          />
        );
      }
    }

    if (videoType === 'file') {
      return (
        <video controls className="w-full rounded">
          <source src={src} />
          Your browser does not support the video tag.
        </video>
      );
    }

    // Fallback: show link
    return (
      <div className="flex items-center gap-2 py-8 justify-center text-gray-500">
        <Play size={24} />
        <a href={src} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
          Open video <ExternalLink size={14} />
        </a>
      </div>
    );
  };

  return (
    <NodeViewWrapper className="my-4">
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white relative group">
        {/* Delete button */}
        <button
          onClick={deleteNode}
          className="absolute top-2 right-2 z-10 p-1.5 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          title="Delete video"
        >
          <Trash2 size={14} />
        </button>

        {/* Video embed area */}
        <div className="bg-gray-900">
          {renderEmbed()}
        </div>

        {/* Controls */}
        <div className="p-3 space-y-2 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <select
              value={videoType}
              onChange={(e) => updateAttributes({ videoType: e.target.value })}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="file">Video File</option>
            </select>
            <input
              type="text"
              value={src}
              onChange={(e) => updateAttributes({ src: e.target.value })}
              placeholder="Paste video URL..."
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => updateAttributes({ title: e.target.value })}
            placeholder="Video title (optional)"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => updateAttributes({ caption: e.target.value })}
            placeholder="Caption (optional)"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
