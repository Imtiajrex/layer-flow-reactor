
import React from 'react';
import { Eye, EyeOff, Lock, Square, Circle, Type } from 'lucide-react';
import { Layer } from './AnimationEditor';

interface LayerPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onLayerSelect: (layerId: string) => void;
  onLayerToggle: (layerId: string) => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  selectedLayerId,
  onLayerSelect,
  onLayerToggle,
}) => {
  const getLayerIcon = (type: Layer['type']) => {
    switch (type) {
      case 'rectangle':
        return <Square className="w-4 h-4" />;
      case 'circle':
        return <Circle className="w-4 h-4" />;
      case 'text':
        return <Type className="w-4 h-4" />;
      default:
        return <Square className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
          Layers
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`
              flex items-center p-3 cursor-pointer transition-colors border-b border-gray-700/50
              ${selectedLayerId === layer.id 
                ? 'bg-blue-600/20 border-blue-500/30' 
                : 'hover:bg-gray-700/50'
              }
            `}
            onClick={() => onLayerSelect(layer.id)}
          >
            <button
              className="mr-2 p-1 hover:bg-gray-600 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onLayerToggle(layer.id);
              }}
            >
              {layer.visible ? (
                <Eye className="w-4 h-4 text-gray-400" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-500" />
              )}
            </button>

            <div className="mr-3 text-gray-400">
              {getLayerIcon(layer.type)}
            </div>

            <span className="flex-1 text-sm text-gray-200 truncate">
              {layer.name}
            </span>

            {layer.locked && (
              <Lock className="w-4 h-4 text-gray-500 ml-2" />
            )}

            <div 
              className="w-4 h-4 rounded ml-2 border border-gray-600"
              style={{ backgroundColor: layer.properties.color }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
