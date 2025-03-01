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
  const [isDev, setIsDev] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check if in development mode
  useEffect(() => {
    setIsDev(process.env.NODE_ENV === "development");
  }, []);

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

    // Draw status bar
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    // Draw time
    ctx.fillText("9:41", phoneX + 20, phoneY + 14);

    // Draw status icons in correct order: signal, WiFi, battery
    const iconSpacing = 18;
    const startX = phoneX + phoneWidth - 20;

    if (isDev) {
      // In dev mode, we'll load and draw the images
      // This is a placeholder since we can't directly load external images in canvas
      // In a real implementation, you would preload these images and draw them

      // For now, we'll fall back to drawing the icons manually
      drawStatusIcons(ctx, startX, phoneX, phoneY, iconSpacing);
    } else {
      // In production mode, draw the icons manually
      drawStatusIcons(ctx, startX, phoneX, phoneY, iconSpacing);
    }

    return canvas.toDataURL("image/png");
  }, [isDev]);

  // Helper function to draw status icons
  const drawStatusIcons = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    phoneX: number,
    phoneY: number,
    iconSpacing: number
  ) => {
    // Battery icon (rightmost)
    ctx.save();
    ctx.translate(startX, phoneY + 14);
    ctx.strokeStyle = "#FFFFFF";
    ctx.fillStyle = "#FFFFFF";
    ctx.lineWidth = 1;

    // Draw battery outline
    ctx.beginPath();
    ctx.roundRect(-16, -4, 16, 8, 2);
    ctx.stroke();

    // Draw battery cap
    ctx.beginPath();
    ctx.fillRect(-18, -2, 2, 4);

    // Draw battery fill (empty in SF Symbol)
    // If you want to show it as full, uncomment the next line
    // ctx.fillRect(-14, -2, 12, 4);

    ctx.restore();

    // WiFi icon (middle)
    ctx.save();
    ctx.translate(startX - iconSpacing, phoneY + 14);
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1;

    // Draw WiFi arcs
    const drawWifiArc = (radius: number) => {
      ctx.beginPath();
      ctx.arc(0, 0, radius, Math.PI, 0, true);
      ctx.stroke();
    };

    drawWifiArc(6);
    drawWifiArc(4);
    drawWifiArc(2);

    // Draw center dot
    ctx.beginPath();
    ctx.arc(0, 2, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Cellular Signal icon (leftmost) - SF Symbol style
    ctx.save();
    ctx.translate(startX - iconSpacing * 2, phoneY + 14);
    ctx.fillStyle = "#FFFFFF";

    // Draw cellular signal bars
    const barWidth = 2;
    const barGap = 1;

    for (let i = 0; i < 4; i++) {
      const barHeight = 2 + i * 2;
      const x = -8 + i * (barWidth + barGap);
      const y = 4 - barHeight;
      ctx.fillRect(x, y, barWidth, barHeight);
    }

    ctx.restore();
  };

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

            {/* Status Bar */}
            <div className="absolute top-0 left-4 right-0 h-7 flex justify-between items-center px-5 text-white text-xs font-medium z-[200]">
              <div>9:41</div>
              <div className="flex items-center gap-1.5">
                {isDev ? (
                  <>
                    <img
                      className="w-4 relative invert"
                      src="https://i.ibb.co/WV4rNDn/cellular.png"
                      alt="cellular signal"
                    />
                    <img
                      className="w-4 relative invert"
                      src="https://i.ibb.co/PgHjfwv/wifi.png"
                      alt="wifi"
                    />
                    <img
                      className="w-[18px] relative invert"
                      src="https://i.ibb.co/1vXsNs4/battery.png"
                      alt="battery"
                    />
                  </>
                ) : (
                  <>
                    {/* Cellular Signal - SF Symbol */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M0 14a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-1ZM4 12a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3ZM8 8a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8ZM12 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V4Z" />
                    </svg>

                    {/* WiFi - SF Symbol */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.188 7.063a8.75 8.75 0 0 0-12.374 0 .75.75 0 0 1-1.061-1.06c4.003-4.004 10.493-4.004 14.496 0a.75.75 0 1 1-1.061 1.06Zm-2.121 2.121a5.75 5.75 0 0 0-8.132 0 .75.75 0 0 1-1.06-1.06 7.25 7.25 0 0 1 10.252 0 .75.75 0 0 1-1.06 1.06Zm-2.122 2.122a2.75 2.75 0 0 0-3.889 0 .75.75 0 1 1-1.06-1.061 4.25 4.25 0 0 1 6.01 0 .75.75 0 0 1-1.06 1.06Zm-2.828 1.06a1.25 1.25 0 0 1 1.768 0 .75.75 0 0 1 0 1.06l-.355.355a.75.75 0 0 1-1.06 0l-.354-.354a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>

                    {/* Battery - SF Symbol */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M1 6.25A2.25 2.25 0 0 1 3.25 4h8.5A2.25 2.25 0 0 1 14 6.25v.085a1.5 1.5 0 0 1 1 1.415v.5a1.5 1.5 0 0 1-1 1.415v.085A2.25 2.25 0 0 1 11.75 12h-8.5A2.25 2.25 0 0 1 1 9.75v-3.5Zm2.25-.75a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75h-8.5Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </>
                )}
              </div>
            </div>

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
