
import React, { useRef, useEffect } from 'react';
import { Layer } from './AnimationEditor';

interface CanvasProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onLayerSelect: (layerId: string) => void;
  onLayerUpdate: (layerId: string, property: string, value: any) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  layers,
  selectedLayerId,
  onLayerSelect,
  onLayerUpdate,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleLayerClick = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onLayerSelect(layerId);
  };

  const renderLayer = (layer: Layer) => {
    if (!layer.visible) return null;

    const {
      x, y, width, height, rotation, scaleX, scaleY, opacity, color
    } = layer.properties;

    const isSelected = selectedLayerId === layer.id;

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: layer.type === 'circle' ? `${width}px` : `${height}px`,
      transform: `rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`,
      opacity: opacity,
      backgroundColor: color,
      cursor: 'pointer',
      border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
      borderRadius: layer.type === 'circle' ? '50%' : '4px',
      transition: 'border-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    return (
      <div
        key={layer.id}
        style={baseStyle}
        onClick={(e) => handleLayerClick(layer.id, e)}
        className="hover:border-blue-400"
      >
        {layer.type === 'text' && (
          <span className="text-white text-sm font-medium select-none pointer-events-none">
            {layer.properties.text || 'Text'}
          </span>
        )}
        
        {isSelected && (
          <>
            {/* Selection handles */}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full pointer-events-none" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full pointer-events-none" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full pointer-events-none" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full pointer-events-none" />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gray-900 relative overflow-hidden">
      {/* Canvas Header */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
          Canvas
        </h3>
        <div className="ml-auto text-xs text-gray-400">
          1920 × 1080
        </div>
      </div>

      {/* Canvas Content */}
      <div 
        ref={canvasRef}
        className="flex-1 relative"
        style={{
          height: 'calc(100% - 48px)',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          backgroundColor: '#111827'
        }}
        onClick={() => onLayerSelect('')}
      >
        {/* Canvas Area - Dark workspace */}
        <div 
          className="absolute inset-4 bg-gray-950 rounded shadow-2xl overflow-hidden"
          style={{
            position: 'relative',
            minHeight: '600px'
          }}
        >
          {layers.map(renderLayer)}
        </div>

        {/* Canvas Info */}
        <div className="absolute bottom-4 left-4 bg-gray-800/90 px-3 py-2 rounded text-xs text-gray-300">
          <div>Zoom: 100%</div>
          <div className="mt-1">
            Selected: {selectedLayerId ? layers.find(l => l.id === selectedLayerId)?.name : 'None'}
          </div>
        </div>
      </div>
    </div>
  );
};
