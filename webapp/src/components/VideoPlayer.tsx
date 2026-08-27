"use client";

interface VideoPlayerProps {
  src: string;
  title: string;
}

export function VideoPlayer({ src, title }: VideoPlayerProps) {
  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-black shadow-lg mb-8">
      <video
        controls
        preload="metadata"
        className="w-full aspect-video"
        title={title}
        playsInline
      >
        <source src={src} type="video/mp4" />
        お使いのブラウザは動画再生に対応していません。
      </video>
      <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
        🎬 {title}
      </div>
    </div>
  );
}
