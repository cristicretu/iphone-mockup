"use client";

import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Download, Play, Pause, RefreshCw } from "lucide-react";

export function IphoneMockup() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);

      if (videoRef.current) {
        videoRef.current.load();
      }
    }
  };

  // Play/pause video
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Create a snapshot of the current mockup
  const createSnapshot = useCallback(() => {
    if (!mockupRef.current || !videoRef.current || !canvasRef.current)
      return null;

    const mockup = mockupRef.current;
    const canvas = canvasRef.current;

    // Set canvas size to match mockup
    canvas.width = mockup.offsetWidth;
    canvas.height = mockup.offsetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Draw background gradient
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, "#dbeafe"); // blue-100
    gradient.addColorStop(1, "#f3e8ff"); // purple-100
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create iPhone frame
    const phoneWidth = 300;
    const phoneHeight = 600;
    const phoneX = (canvas.width - phoneWidth) / 2;
    const phoneY = 0;

    // Draw iPhone body
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.roundRect(phoneX, phoneY, phoneWidth, phoneHeight, 48);
    ctx.fill();

    // Draw iPhone screen (inner area)
    const screenMargin = 14;
    const screenWidth = phoneWidth - screenMargin * 2;
    const screenHeight = phoneHeight - screenMargin * 2;
    const screenX = phoneX + screenMargin;
    const screenY = phoneY + screenMargin;

    // Draw screen background
    ctx.fillStyle = "#1e293b"; // slate-800
    ctx.beginPath();
    ctx.roundRect(screenX, screenY, screenWidth, screenHeight, 32);
    ctx.fill();

    // Draw video frame on screen
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(screenX, screenY, screenWidth, screenHeight, 28);
    ctx.clip();

    // Draw the video frame
    ctx.drawImage(
      videoRef.current,
      screenX,
      screenY,
      screenWidth,
      screenHeight
    );
    ctx.restore();

    // Draw notch
    ctx.fillStyle = "#000000";
    const notchWidth = phoneWidth / 2;
    const notchHeight = 28;
    const notchX = phoneX + (phoneWidth - notchWidth) / 2;
    const notchY = phoneY;

    ctx.beginPath();
    ctx.roundRect(notchX, notchY, notchWidth, notchHeight, [0, 0, 12, 12]);
    ctx.fill();

    return canvas.toDataURL("image/png");
  }, []);

  // Download the current frame
  const downloadFrame = async () => {
    if (!videoRef.current) return;

    setIsProcessing(true);

    try {
      // Pause the video to capture the current frame
      videoRef.current.pause();
      setIsPlaying(false);

      // Create a snapshot
      const snapshot = createSnapshot();

      if (snapshot) {
        const a = document.createElement("a");
        a.href = snapshot;
        a.download = `iphone-mockup-${Date.now()}.png`;
        a.click();
      }
    } catch (err) {
      console.error("Error creating snapshot:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Clean up URLs on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="p-6 flex flex-col gap-4">
        <h2 className="text-xl font-semibold">1. Upload Your Video</h2>
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept="video/*"
            id="video-upload"
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor="video-upload"
            className="flex flex-col items-center gap-3 cursor-pointer"
          >
            <Upload className="h-10 w-10 text-slate-400" />
            <span className="text-slate-600">
              {videoFile ? videoFile.name : "Click to upload your video"}
            </span>
          </label>
        </div>

        {videoUrl && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Video Controls</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={togglePlay}>
                {isPlaying ? (
                  <Pause className="h-4 w-4 mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isPlaying ? "Pause" : "Play"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                  }
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        )}

        {videoUrl && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">2. Download Frame</h3>
            <p className="text-sm text-slate-500 mb-3">
              This will capture the current frame of your video in the iPhone
              mockup.
            </p>
            <Button
              onClick={downloadFrame}
              disabled={!videoUrl || isProcessing}
            >
              <Download className="h-4 w-4 mr-2" />
              {isProcessing ? "Processing..." : "Download Frame"}
            </Button>
          </div>
        )}
      </Card>

      <div>
        <div
          ref={mockupRef}
          className="relative mx-auto"
          style={{ width: "300px", height: "600px" }}
        >
          {/* iPhone mockup */}
          <div className="absolute inset-0 bg-black rounded-[3rem] shadow-xl overflow-hidden border-[14px] border-black">
            {/* iPhone notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/2 h-7 bg-black rounded-b-xl z-10"></div>

            {/* iPhone screen */}
            <div className="relative h-full w-full bg-slate-800 overflow-hidden rounded-[1rem]">
              <div
                className="absolute inset-0 overflow-hidden w-full h-12 bg-gradient-to-b from-black via-black to-transparent z-50"
                style={{ borderRadius: "1.8rem" }}
              ></div>
              {videoUrl ? (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ borderRadius: "1.8rem" }}
                >
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                    muted
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-white text-center p-4">
                  Upload a video to see it displayed here
                </div>
              )}
            </div>

            {/* No home indicator as requested */}
          </div>

          {/* Background gradient */}
          <div className="absolute -z-10 inset-0 -m-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl"></div>
        </div>

        {/* Hidden canvas for image generation */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
