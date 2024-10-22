'use client';

import { useEffect, useState, useCallback } from 'react';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Analytics } from "@vercel/analytics/react";
import Notification from '../lib/notify';
import Footer from './Footer';

// Types
type NotificationType = 'error' | 'success' | 'info';

interface NotificationState {
  message: string;
  type: NotificationType;
}

interface DownloadResponse {
  videoUrl: string;
  error?: string;
}

// Components
const LoadingSpinner = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    aria-label="Loading..."
    role="status"
  >
    <circle cx={4} cy={12} r={3} fill="currentColor">
      <animate
        id="svgSpinners3DotsScale0"
        attributeName="r"
        begin="0;svgSpinners3DotsScale1.end-0.25s"
        dur="0.75s"
        values="3;.2;3"
      />
    </circle>
    <circle cx={12} cy={12} r={3} fill="currentColor">
      <animate
        attributeName="r"
        begin="svgSpinners3DotsScale0.end-0.6s"
        dur="0.75s"
        values="3;.2;3"
      />
    </circle>
    <circle cx={20} cy={12} r={3} fill="currentColor">
      <animate
        id="svgSpinners3DotsScale1"
        attributeName="r"
        begin="svgSpinners3DotsScale0.end-0.45s"
        dur="0.75s"
        values="3;.2;3"
      />
    </circle>
  </svg>
);

const DownloadButton = ({
  disabled,
  loading,
  onClick
}: {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    aria-label={loading ? 'Downloading...' : 'Download video'}
    className={`
      flex items-center justify-center w-10 h-10 rounded-full shadow
      transition-colors duration-200
      ${disabled
        ? 'cursor-not-allowed bg-[#4e4e4e] text-black'
        : 'cursor-pointer bg-[#eeeeee] text-black hover:bg-[#dddddd]'
      }
    `}
  >
    {loading
      ? <span className='flex justify-center items-center text-black text-xl'>
          <LoadingSpinner />
        </span>
      : <FontAwesomeIcon icon={faDownload} />
    }
  </button>
);

const LoomDownloader = () => {
  const [loomUrl, setLoomUrl] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ message, type });
  }, []);

  const downloadVideo = async () => {
    if (!loomUrl) {
      showNotification('Please enter a valid Loom URL', 'error');
      return;
    }

    setLoading(true);
    showNotification('Downloading video...', 'info');

    try {
      const response = await fetch('/api/loom-dl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: loomUrl,
          title: title.trim() || undefined
        }),
      });

      const data: DownloadResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to download video');
      }

      // Create and trigger download
      const link = document.createElement('a');
      link.href = data.videoUrl;
      link.download = `${title || loomUrl.split('/').pop()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification('Video downloaded successfully!', 'success');
      setLoomUrl('');
      setTitle('');
    } catch (error) {
      console.error('Error downloading video:', error);
      showNotification(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-4 bg-[#212121e6]">
      <Analytics />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <h1 className="mb-6 text-2xl font-semibold leading-9">
        Paste Loom Video URL below
      </h1>

      <div className="lg:w-[60%] w-full mx-auto flex flex-col sm:flex-row items-center p-2 mb-8 shadow-lg gap-4 bg-[#2e2e2e] rounded-full">
        <input
          type="text"
          placeholder="Enter Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          aria-label="Video title"
          className="w-full sm:w-auto p-2 rounded bg-[#3e3e3e] text-white placeholder:text-[#aeaeae] focus:outline-none focus:ring-2 focus:ring-[#4e4e4e]"
        />

        <input
          type="url"
          value={loomUrl}
          onChange={(e) => setLoomUrl(e.target.value)}
          placeholder="Enter loom video URL here..."
          disabled={loading}
          required
          aria-label="Loom video URL"
          className="w-full placeholder:text-[#aeaeae] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#4e4e4e] text-white outline-none px-4"
        />

        <DownloadButton
          disabled={!loomUrl || loading}
          loading={loading}
          onClick={downloadVideo}
        />
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default LoomDownloader;
