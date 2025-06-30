

import React, { useRef, useEffect, useState } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  const handleLayerClick = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onLayerSelect(layerId);
  };

  const handleMouseDown = (layerId: string, e: React.MouseEvent, type: 'drag' | 'resize', handle?: string) => {
    e.stopPropagation();
    
    if (type === 'drag') {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (type === 'resize' && handle) {
      setIsResizing(true);
      setResizeHandle(handle);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
    
    onLayerSelect(layerId);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!selectedLayerId) return;
    
    const selectedLayer = layers.find(l => l.id === selectedLayerId);
    if (!selectedLayer) return;

    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      onLayerUpdate(selectedLayerId, 'x', selectedLayer.properties.x + deltaX);
      onLayerUpdate(selectedLayerId, 'y', selectedLayer.properties.y + deltaY);
      
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isResizing && resizeHandle) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      const { width, height } = selectedLayer.properties;
      
      switch (resizeHandle) {
        case 'se':
          onLayerUpdate(selectedLayerId, 'width', Math.max(10, width + deltaX));
          onLayerUpdate(selectedLayerId, 'height', Math.max(10, height + deltaY));
          break;
        case 'sw':
          onLayerUpdate(selectedLayerId, 'width', Math.max(10, width - deltaX));
          onLayerUpdate(selectedLayerId, 'height', Math.max(10, height + deltaY));
          onLayerUpdate(selectedLayerId, 'x', selectedLayer.properties.x + deltaX);
          break;
        case 'ne':
          onLayerUpdate(selectedLayerId, 'width', Math.max(10, width + deltaX));
          onLayerUpdate(selectedLayerId, 'height', Math.max(10, height - deltaY));
          onLayerUpdate(selectedLayerId, 'y', selectedLayer.properties.y + deltaY);
          break;
        case 'nw':
          onLayerUpdate(selectedLayerId, 'width', Math.max(10, width - deltaX));
          onLayerUpdate(selectedLayerId, 'height', Math.max(10, height - deltaY));
          onLayerUpdate(selectedLayerId, 'x', selectedLayer.properties.x + deltaX);
          onLayerUpdate(selectedLayerId, 'y', selectedLayer.properties.y + deltaY);
          break;
      }
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, selectedLayerId, resizeHandle]);

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
      cursor: isDragging ? 'grabbing' : 'grab',
      border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
      borderRadius: layer.type === 'circle' ? '50%' : '4px',
      transition: isDragging ? 'none' : 'border-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: isSelected ? '0 0 0 1px rgba(59, 130, 246, 0.3)' : 'none'
    };

    return (
      <div
        key={layer.id}
        data-layer-id={layer.id}
        style={baseStyle}
        onMouseDown={(e) => handleMouseDown(layer.id, e, 'drag')}
        onClick={(e) => handleLayerClick(layer.id, e)}
        className="hover:shadow-md transition-shadow"
      >
        {layer.type === 'text' && (
          <span className="text-white text-sm font-medium select-none pointer-events-none">
            {layer.properties.text || 'Text'}
          </span>
        )}
        
        {isSelected && (
          <>
            {/* Resize handles */}
            <div 
              className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize"
              onMouseDown={(e) => handleMouseDown(layer.id, e, 'resize', 'nw')}
            />
            <div 
              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize"
              onMouseDown={(e) => handleMouseDown(layer.id, e, 'resize', 'ne')}
            />
            <div 
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize"
              onMouseDown={(e) => handleMouseDown(layer.id, e, 'resize', 'sw')}
            />
            <div 
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize"
              onMouseDown={(e) => handleMouseDown(layer.id, e, 'resize', 'se')}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gray-100 relative overflow-hidden">
      {/* Canvas Header */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Canvas
        </h3>
        <div className="ml-auto text-xs text-gray-500">
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
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          backgroundColor: '#f9fafb'
        }}
        onClick={() => onLayerSelect('')}
      >
        {/* Canvas Area */}
        <div 
          className="absolute inset-4 bg-white rounded shadow-lg overflow-hidden border border-gray-200"
          style={{
            position: 'relative',
            minHeight: '600px'
          }}
        >
          {layers.map(renderLayer)}
        </div>

        {/* Canvas Info */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded shadow-md text-xs text-gray-700 border border-gray-200">
          <div>Zoom: 100%</div>
          <div className="mt-1">
            Selected: {selectedLayerId ? layers.find(l => l.id === selectedLayerId)?.name : 'None'}
          </div>
        </div>
      </div>
    </div>
  );
};

