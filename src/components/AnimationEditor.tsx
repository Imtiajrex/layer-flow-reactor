
import React, { useState, useRef, useEffect } from 'react';
import { LayerPanel } from './LayerPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { Timeline } from './Timeline';
import { Canvas } from './Canvas';
import gsap from 'gsap';

export interface Layer {
  id: string;
  name: string;
  type: 'rectangle' | 'circle' | 'text';
  visible: boolean;
  locked: boolean;
  properties: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    opacity: number;
    color: string;
    text?: string;
  };
  keyframes: {
    [property: string]: {
      time: number;
      value: any;
    }[];
  };
}

export interface AnimationEditorProps {}

export const AnimationEditor: React.FC<AnimationEditorProps> = () => {
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: '1',
      name: 'Rectangle 1',
      type: 'rectangle',
      visible: true,
      locked: false,
      properties: {
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        color: '#3b82f6',
      },
      keyframes: {},
    },
    {
      id: '2',
      name: 'Circle 1',
      type: 'circle',
      visible: true,
      locked: false,
      properties: {
        x: 300,
        y: 200,
        width: 80,
        height: 80,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        color: '#ef4444',
      },
      keyframes: {},
    },
  ]);

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>('1');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);

  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // Initialize GSAP timeline
    timelineRef.current = gsap.timeline({ paused: true });
    return () => {
      timelineRef.current?.kill();
    };
  }, []);

  const selectedLayer = layers.find(layer => layer.id === selectedLayerId);

  const updateLayerProperty = (layerId: string, property: string, value: any) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, properties: { ...layer.properties, [property]: value } }
        : layer
    ));
  };

  const addKeyframe = (layerId: string, property: string, time: number, value: any) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? {
            ...layer,
            keyframes: {
              ...layer.keyframes,
              [property]: [
                ...(layer.keyframes[property] || []),
                { time, value }
              ].sort((a, b) => a.time - b.time)
            }
          }
        : layer
    ));
  };

  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
  };

  const playAnimation = () => {
    if (!timelineRef.current) return;
    
    setIsPlaying(true);
    timelineRef.current.play();
  };

  const pauseAnimation = () => {
    if (!timelineRef.current) return;
    
    setIsPlaying(false);
    timelineRef.current.pause();
  };

  const seekTo = (time: number) => {
    if (!timelineRef.current) return;
    
    setCurrentTime(time);
    timelineRef.current.seek(time);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
        <h1 className="text-lg font-semibold text-gray-100">Motion Editor</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel */}
        <div className="w-80 bg-gray-850 border-r border-gray-700 flex flex-col">
          <LayerPanel 
            layers={layers}
            selectedLayerId={selectedLayerId}
            onLayerSelect={setSelectedLayerId}
            onLayerToggle={toggleLayer}
          />
        </div>

        {/* Center Canvas */}
        <div className="flex-1 bg-gray-900 flex flex-col">
          <Canvas 
            layers={layers}
            selectedLayerId={selectedLayerId}
            onLayerSelect={setSelectedLayerId}
            onLayerUpdate={updateLayerProperty}
          />
          
          {/* Timeline */}
          <div className="h-48 bg-gray-800 border-t border-gray-700">
            <Timeline 
              layers={layers}
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              onTimeChange={seekTo}
              onPlay={playAnimation}
              onPause={pauseAnimation}
              onKeyframeAdd={addKeyframe}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 bg-gray-850 border-l border-gray-700">
          <PropertiesPanel 
            layer={selectedLayer}
            onPropertyChange={updateLayerProperty}
            onKeyframeAdd={addKeyframe}
            currentTime={currentTime}
          />
        </div>
      </div>
    </div>
  );
};
