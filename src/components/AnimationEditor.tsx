import React, { useState, useRef, useEffect } from 'react';
import { LayerPanel } from './LayerPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { Timeline } from './Timeline';
import { Canvas } from './Canvas';
import { Button } from './ui/button';
import { Plus, Square, Circle, Type } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
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
      keyframes: {
        x: [
          { time: 0, value: 100 },
          { time: 2, value: 300 },
          { time: 4, value: 100 }
        ],
        rotation: [
          { time: 0, value: 0 },
          { time: 2, value: 180 },
          { time: 4, value: 360 }
        ]
      },
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
      keyframes: {
        y: [
          { time: 0, value: 200 },
          { time: 1.5, value: 100 },
          { time: 3, value: 300 },
          { time: 4.5, value: 200 }
        ],
        scaleX: [
          { time: 0, value: 1 },
          { time: 2, value: 1.5 },
          { time: 4, value: 1 }
        ],
        scaleY: [
          { time: 0, value: 1 },
          { time: 2, value: 1.5 },
          { time: 4, value: 1 }
        ]
      },
    },
  ]);

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>('1');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);

  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    // Initialize GSAP timeline
    timelineRef.current = gsap.timeline({ 
      paused: true,
      onUpdate: () => {
        if (timelineRef.current) {
          setCurrentTime(timelineRef.current.time());
        }
      },
      onComplete: () => {
        setIsPlaying(false);
        setCurrentTime(0);
        timelineRef.current?.seek(0);
      }
    });

    buildTimeline();

    return () => {
      timelineRef.current?.kill();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [layers]);

  const buildTimeline = () => {
    if (!timelineRef.current) return;
    
    // Clear existing timeline
    timelineRef.current.clear();
    
    // Build animations for each layer
    layers.forEach(layer => {
      if (!layer.visible) return;
      
      const layerElement = document.querySelector(`[data-layer-id="${layer.id}"]`);
      if (!layerElement) return;

      // Process each property that has keyframes
      Object.entries(layer.keyframes).forEach(([property, keyframes]) => {
        if (keyframes.length === 0) return;

        // Sort keyframes by time
        const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);
        
        // Create animation between keyframes
        for (let i = 0; i < sortedKeyframes.length - 1; i++) {
          const currentKf = sortedKeyframes[i];
          const nextKf = sortedKeyframes[i + 1];
          const duration = nextKf.time - currentKf.time;
          
          let gsapProperty = property;
          let value = nextKf.value;
          
          // Map properties to GSAP format
          switch (property) {
            case 'x':
            case 'y':
              value = `${nextKf.value}px`;
              break;
            case 'rotation':
              gsapProperty = 'rotation';
              value = nextKf.value;
              break;
            case 'scaleX':
            case 'scaleY':
              value = nextKf.value;
              break;
            case 'opacity':
              value = nextKf.value;
              break;
            case 'width':
            case 'height':
              value = `${nextKf.value}px`;
              break;
          }
          
          timelineRef.current.to(layerElement, {
            duration: duration,
            [gsapProperty]: value,
            ease: 'power2.inOut'
          }, currentKf.time);
        }
      });
    });

    // Set timeline duration
    timelineRef.current.duration(duration);
  };

  // Rebuild timeline when layers change
  useEffect(() => {
    buildTimeline();
  }, [layers, duration]);

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

  const removeKeyframe = (layerId: string, property: string, keyframeIndex: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? {
            ...layer,
            keyframes: {
              ...layer.keyframes,
              [property]: (layer.keyframes[property] || []).filter((_, index) => index !== keyframeIndex)
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

  const addLayer = (type: 'rectangle' | 'circle' | 'text') => {
    const newId = Date.now().toString();
    const typeNames = {
      rectangle: 'Rectangle',
      circle: 'Circle',
      text: 'Text'
    };
    
    const newLayer: Layer = {
      id: newId,
      name: `${typeNames[type]} ${layers.length + 1}`,
      type,
      visible: true,
      locked: false,
      properties: {
        x: 150 + (layers.length * 20),
        y: 150 + (layers.length * 20),
        width: type === 'circle' ? 80 : (type === 'text' ? 120 : 200),
        height: type === 'circle' ? 80 : (type === 'text' ? 40 : 100),
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        color: type === 'rectangle' ? '#3b82f6' : (type === 'circle' ? '#ef4444' : '#10b981'),
        text: type === 'text' ? 'Sample Text' : undefined,
      },
      keyframes: {},
    };

    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newId);
  };

  const deleteLayer = (layerId: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== layerId));
    if (selectedLayerId === layerId) {
      setSelectedLayerId(layers.length > 1 ? layers[0].id : null);
    }
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
    
    // Update layer properties based on current time
    updateLayerPropertiesAtTime(time);
  };

  const updateLayerPropertiesAtTime = (time: number) => {
    setLayers(prev => prev.map(layer => {
      const newProperties = { ...layer.properties };
      
      // Interpolate values for each property with keyframes
      Object.entries(layer.keyframes).forEach(([property, keyframes]) => {
        if (keyframes.length === 0) return;
        
        const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);
        
        // Find the keyframes to interpolate between
        let value = sortedKeyframes[0].value;
        
        for (let i = 0; i < sortedKeyframes.length - 1; i++) {
          const current = sortedKeyframes[i];
          const next = sortedKeyframes[i + 1];
          
          if (time >= current.time && time <= next.time) {
            // Linear interpolation
            const progress = (time - current.time) / (next.time - current.time);
            value = current.value + (next.value - current.value) * progress;
            break;
          } else if (time > next.time) {
            value = next.value;
          }
        }
        
        // Fix the type error by properly typing the property assignment
        (newProperties as any)[property] = value;
      });
      
      return { ...layer, properties: newProperties };
    }));
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 text-gray-900 relative">
      {/* Header */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-800">Motion Editor</h1>
        
        {/* Add Element Dropdown */}
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Element
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => addLayer('rectangle')} className="gap-2">
                <Square className="w-4 h-4" />
                Rectangle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addLayer('circle')} className="gap-2">
                <Circle className="w-4 h-4" />
                Circle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addLayer('text')} className="gap-2">
                <Type className="w-4 h-4" />
                Text
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex" style={{ height: 'calc(100vh - 240px)' }}>
        {/* Left Panel */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <LayerPanel 
            layers={layers}
            selectedLayerId={selectedLayerId}
            onLayerSelect={setSelectedLayerId}
            onLayerToggle={toggleLayer}
            onLayerDelete={deleteLayer}
          />
        </div>

        {/* Center Canvas */}
        <div className="flex-1 bg-gray-100 flex flex-col">
          <Canvas 
            layers={layers}
            selectedLayerId={selectedLayerId}
            onLayerSelect={setSelectedLayerId}
            onLayerUpdate={updateLayerProperty}
          />
        </div>

        {/* Right Panel */}
        <div className="w-80 bg-white border-l border-gray-200">
          <PropertiesPanel 
            layer={selectedLayer}
            onPropertyChange={updateLayerProperty}
            onKeyframeAdd={addKeyframe}
            onKeyframeRemove={removeKeyframe}
            currentTime={currentTime}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="h-48 bg-white border-t border-gray-200 shadow-sm">
        <Timeline 
          layers={layers}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onTimeChange={seekTo}
          onPlay={playAnimation}
          onPause={pauseAnimation}
          onKeyframeAdd={addKeyframe}
          onKeyframeRemove={removeKeyframe}
        />
      </div>
    </div>
  );
};