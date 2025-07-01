import React from 'react';
import { Eye, EyeOff, Lock, Square, Circle, Type, Trash2 } from 'lucide-react';
import { Layer } from './AnimationEditor';
import { Button } from './ui/button';

interface LayerPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onLayerSelect: (layerId: string) => void;
  onLayerToggle: (layerId: string) => void;
  onLayerDelete: (layerId: string) => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  selectedLayerId,
  onLayerSelect,
  onLayerToggle,
  onLayerDelete,
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
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
          Layers
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`
              flex items-center p-3 cursor-pointer transition-colors border-b border-gray-200/50 group
              ${selectedLayerId === layer.id 
                ? 'bg-blue-50 border-blue-200' 
                : 'hover:bg-gray-50'
              }
            `}
            onClick={() => onLayerSelect(layer.id)}
          >
            <button
              className="mr-2 p-1 hover:bg-gray-200 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onLayerToggle(layer.id);
              }}
            >
              {layer.visible ? (
                <Eye className="w-4 h-4 text-gray-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
            </button>

            <div className="mr-3 text-gray-600">
              {getLayerIcon(layer.type)}
            </div>

            <span className="flex-1 text-sm text-gray-800 truncate">
              {layer.name}
            </span>

            {layer.locked && (
              <Lock className="w-4 h-4 text-gray-400 ml-2" />
            )}

            <div 
              className="w-4 h-4 rounded ml-2 border border-gray-300"
              style={{ backgroundColor: layer.properties.color }}
            />

            <Button
              variant="ghost"
              size="sm"
              className="ml-2 p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onLayerDelete(layer.id);
              }}
            >
              <Trash2 className="w-3 h-3 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};