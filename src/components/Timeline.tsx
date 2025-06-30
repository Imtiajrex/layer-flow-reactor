

import React, { useRef, useEffect, useState } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);

  const getTimeFromPosition = (clientX: number) => {
    if (!timelineRef.current) return 0;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return percentage * duration;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const newTime = getTimeFromPosition(e.clientX);
    onTimeChange(newTime);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newTime = getTimeFromPosition(e.clientX);
    onTimeChange(newTime);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    
    const newTime = getTimeFromPosition(e.clientX);
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
    <div className="h-full bg-white flex flex-col border-t border-gray-200">
      {/* Controls */}
      <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-4 space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onTimeChange(0)}
            className="p-2 hover:bg-gray-200 rounded transition-colors border border-gray-300"
          >
            <SkipBack className="w-4 h-4 text-gray-600" />
          </button>
          
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="p-2 hover:bg-gray-200 rounded transition-colors border border-gray-300"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-gray-600" />
            ) : (
              <Play className="w-4 h-4 text-gray-600" />
            )}
          </button>
          
          <button
            onClick={() => onTimeChange(duration)}
            className="p-2 hover:bg-gray-200 rounded transition-colors border border-gray-300"
          >
            <SkipForward className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="text-sm font-mono text-gray-700 bg-white px-2 py-1 rounded border border-gray-300">
          {formatTime(currentTime)}
        </div>

        <div className="text-sm text-gray-500">
          / {formatTime(duration)}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 flex">
        {/* Layer Names */}
        <div className="w-48 bg-gray-50 border-r border-gray-200">
          <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-3">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Layers
            </span>
          </div>
          
          {layers.map((layer) => (
            <div
              key={layer.id}
              className="h-12 border-b border-gray-200/70 flex items-center px-3 hover:bg-gray-100"
            >
              <div 
                className="w-3 h-3 rounded mr-2 border border-gray-300"
                style={{ backgroundColor: layer.properties.color }}
              />
              <span className="text-sm text-gray-700 truncate">
                {layer.name}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline Track */}
        <div className="flex-1 relative">
          {/* Time Ruler */}
          <div className="h-8 bg-gray-100 border-b border-gray-200 relative">
            {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 h-full border-l border-gray-300 flex items-center"
                style={{ left: `${(i / duration) * 100}%` }}
              >
                <span className="text-xs text-gray-600 ml-1">{i}s</span>
              </div>
            ))}
          </div>

          {/* Timeline Tracks */}
          <div
            ref={timelineRef}
            className="relative cursor-pointer select-none"
            onMouseDown={handleMouseDown}
            onClick={handleTimelineClick}
          >
            {layers.map((layer, layerIndex) => (
              <div
                key={layer.id}
                className="h-12 border-b border-gray-200/70 relative hover:bg-gray-50"
              >
                {/* Keyframes */}
                {Object.entries(layer.keyframes).map(([property, keyframes]) =>
                  keyframes.map((keyframe, index) => (
                    <div
                      key={`${property}-${index}`}
                      className="absolute top-1/2 transform -translate-y-1/2 w-2 h-6 bg-blue-500 rounded cursor-pointer hover:bg-blue-600 transition-colors z-10 border border-white shadow-sm"
                      style={{ left: `${getKeyframePosition(keyframe.time)}%` }}
                      title={`${property}: ${keyframe.value} at ${keyframe.time.toFixed(2)}s`}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  ))
                )}
              </div>
            ))}

            {/* Current Time Indicator */}
            <div
              ref={scrubberRef}
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-20"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white pointer-events-auto cursor-ew-resize shadow-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

