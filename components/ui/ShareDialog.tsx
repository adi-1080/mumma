'use client';

import React, { useState } from 'react';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  posterDataUrl: string;
  recipeName: string;
}

export function ShareDialog({ isOpen, onClose, posterDataUrl, recipeName }: ShareDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPoster = async () => {
    setIsDownloading(true);
    try {
      // Convert data URL to blob
      const response = await fetch(posterDataUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mummas-kitchen-${recipeName.toLowerCase().replace(/\s+/g, '-')}.png`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download poster:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const sharePoster = async () => {
    try {
      // Convert data URL to blob
      const response = await fetch(posterDataUrl);
      const blob = await response.blob();
      
      // Create file
      const file = new File([blob], `mummas-kitchen-${recipeName}.png`, { type: 'image/png' });
      
      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `I made ${recipeName} with Mumma's Kitchen!`,
          text: `Check out what I cooked with Mumma's Kitchen! 🍳`,
          files: [file]
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`I made ${recipeName} with Mumma's Kitchen! 🍳`);
        alert('Share text copied to clipboard! You can paste this anywhere.');
      }
    } catch (error) {
      console.error('Failed to share poster:', error);
      // Fallback: copy text to clipboard
      try {
        await navigator.clipboard.writeText(`I made ${recipeName} with Mumma's Kitchen! 🍳`);
        alert('Share text copied to clipboard!');
      } catch (clipboardError) {
        console.error('Failed to copy to clipboard:', clipboardError);
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`I made ${recipeName} with Mumma's Kitchen! 🍳`);
      alert('Share text copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-dark rounded-[20px] max-w-md w-full p-6 shadow-custom">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-lilita text-2xl text-dark">Share Your Creation!</h3>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-dark hover:text-yellow transition-colors"
          >
            ×
          </button>
        </div>

        {/* Poster Preview */}
        <div className="mb-6">
          <img
            src={posterDataUrl}
            alt={`${recipeName} poster`}
            className="w-full rounded-[10px] border-2 border-dark"
          />
        </div>

        {/* Share Options */}
        <div className="space-y-3">
          <button
            onClick={downloadPoster}
            disabled={isDownloading}
            className="w-full bg-yellow border-2 border-dark rounded-[10px] px-4 py-3 font-nunito font-bold text-dark hover:bg-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? 'Downloading...' : '[Download] Download Poster'}
          </button>

          <button
            onClick={sharePoster}
            className="w-full bg-green border-2 border-dark rounded-[10px] px-4 py-3 font-nunito font-bold text-white hover:bg-green/90 transition-colors"
          >
            [Share] Share to Social Media
          </button>

          <button
            onClick={copyToClipboard}
            className="w-full bg-blue border-2 border-dark rounded-[10px] px-4 py-3 font-nunito font-bold text-white hover:bg-blue/90 transition-colors"
          >
            [Clipboard] Copy Share Text
          </button>
        </div>

        {/* Share Text Preview */}
        <div className="mt-4 p-3 bg-yellow/20 border-2 border-dark rounded-[10px]">
          <p className="font-nunito text-sm text-dark text-center">
            "I made {recipeName} with Mumma's Kitchen! 🍳"
          </p>
        </div>

        {/* Tips */}
        <div className="mt-4 text-xs font-nunito text-dark/60">
          <p className="mb-1"><strong>Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Perfect for Instagram Stories!</li>
            <li>Works great on WhatsApp, Facebook, Twitter</li>
            <li>Download to save as a memory</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
