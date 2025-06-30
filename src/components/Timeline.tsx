
import React, { useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Layer } from './AnimationEditor';

interface TimelineProps {
  layers: Layer[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeChange: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onKeyframeAdd: (layerId: string, property: string, time: number, value: any) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  layers,
  currentTime,
  duration,
  isPlaying,
  onTimeChange,
  onPlay,
  onPause,
  onKeyframeAdd,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = Math.max(0, Math.min(duration, percentage * duration));
    
    onTimeChange(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const frames = Math.floor((time % 1) * 30); // Assuming 30fps
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const getKeyframePosition = (time: number) => {
    return (time / duration) * 100;
  };

  return (
    <div className="h-full bg-gray-800 flex flex-col">
      {/* Controls */}
      <div className="h-12 bg-gray-750 border-b border-gray-700 flex items-center px-4 space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onTimeChange(0)}
            className="p-2 hover:bg-gray-600 rounded transition-colors"
          >
            <SkipBack className="w-4 h-4 text-gray-300" />
          </button>
          
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="p-2 hover:bg-gray-600 rounded transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-gray-300" />
            ) : (
              <Play className="w-4 h-4 text-gray-300" />
            )}
          </button>
          
          <button
            onClick={() => onTimeChange(duration)}
            className="p-2 hover:bg-gray-600 rounded transition-colors"
          >
            <SkipForward className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        <div className="text-sm font-mono text-gray-300">
          {formatTime(currentTime)}
        </div>

        <div className="text-sm text-gray-400">
          / {formatTime(duration)}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 flex">
        {/* Layer Names */}
        <div className="w-48 bg-gray-750 border-r border-gray-700">
          <div className="h-8 bg-gray-700 border-b border-gray-600 flex items-center px-3">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
              Layers
            </span>
          </div>
          
          {layers.map((layer) => (
            <div
              key={layer.id}
              className="h-12 border-b border-gray-700/50 flex items-center px-3"
            >
              <div 
                className="w-3 h-3 rounded mr-2 border border-gray-600"
                style={{ backgroundColor: layer.properties.color }}
              />
              <span className="text-sm text-gray-300 truncate">
                {layer.name}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline Track */}
        <div className="flex-1 relative">
          {/* Time Ruler */}
          <div className="h-8 bg-gray-700 border-b border-gray-600 relative">
            {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 h-full border-l border-gray-600 flex items-center"
                style={{ left: `${(i / duration) * 100}%` }}
              >
                <span className="text-xs text-gray-400 ml-1">{i}s</span>
              </div>
            ))}
          </div>

          {/* Timeline Tracks */}
          <div
            ref={timelineRef}
            className="relative cursor-pointer"
            onClick={handleTimelineClick}
          >
            {layers.map((layer, layerIndex) => (
              <div
                key={layer.id}
                className="h-12 border-b border-gray-700/50 relative hover:bg-gray-700/30"
              >
                {/* Keyframes */}
                {Object.entries(layer.keyframes).map(([property, keyframes]) =>
                  keyframes.map((keyframe, index) => (
                    <div
                      key={`${property}-${index}`}
                      className="absolute top-1/2 transform -translate-y-1/2 w-2 h-6 bg-blue-500 rounded cursor-pointer hover:bg-blue-400 transition-colors"
                      style={{ left: `${getKeyframePosition(keyframe.time)}%` }}
                      title={`${property}: ${keyframe.value} at ${keyframe.time.toFixed(2)}s`}
                    />
                  ))
                )}
              </div>
            ))}

            {/* Current Time Indicator */}
            <div
              ref={scrubberRef}
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
