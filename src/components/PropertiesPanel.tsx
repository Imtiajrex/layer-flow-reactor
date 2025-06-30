

import React from 'react';
import { Plus } from 'lucide-react';
import { Layer } from './AnimationEditor';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface PropertiesPanelProps {
  layer: Layer | undefined;
  onPropertyChange: (layerId: string, property: string, value: any) => void;
  onKeyframeAdd: (layerId: string, property: string, time: number, value: any) => void;
  currentTime: number;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  layer,
  onPropertyChange,
  onKeyframeAdd,
  currentTime,
}) => {
  if (!layer) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 bg-white">
        <p>Select a layer to edit properties</p>
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: any) => {
    onPropertyChange(layer.id, property, value);
  };

  const handleAddKeyframe = (property: string) => {
    onKeyframeAdd(layer.id, property, currentTime, layer.properties[property as keyof typeof layer.properties]);
  };

  const PropertyInput = ({ 
    label, 
    property, 
    type = 'number', 
    min, 
    max, 
    step = 1 
  }: {
    label: string;
    property: string;
    type?: string;
    min?: number;
    max?: number;
    step?: number;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">
          {label}
        </Label>
        <button
          onClick={() => handleAddKeyframe(property)}
          className="p-1 hover:bg-gray-100 rounded transition-colors border border-gray-200"
          title="Add keyframe"
        >
          <Plus className="w-3 h-3 text-gray-600" />
        </button>
      </div>
      
      {type === 'color' ? (
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={layer.properties[property as keyof typeof layer.properties] as string}
            onChange={(e) => handlePropertyChange(property, e.target.value)}
            className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
          />
          <Input
            type="text"
            value={layer.properties[property as keyof typeof layer.properties] as string}
            onChange={(e) => handlePropertyChange(property, e.target.value)}
            className="flex-1"
          />
        </div>
      ) : (
        <Input
          type={type}
          value={layer.properties[property as keyof typeof layer.properties] as number}
          onChange={(e) => handlePropertyChange(property, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
          min={min}
          max={max}
          step={step}
        />
      )}
    </div>
  );

  return (
    <div className="h-full bg-white border-l border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
          Properties
        </h2>
        <p className="text-xs text-gray-600 mt-1">{layer.name}</p>
      </div>
      
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Transform */}
        <div>
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-1 border-b border-gray-200">
            Transform
          </h3>
          
          <div className="space-y-4">
            <PropertyInput label="X Position" property="x" />
            <PropertyInput label="Y Position" property="y" />
            <PropertyInput label="Rotation" property="rotation" min={-360} max={360} />
            <PropertyInput label="Scale X" property="scaleX" min={0} max={5} step={0.1} />
            <PropertyInput label="Scale Y" property="scaleY" min={0} max={5} step={0.1} />
          </div>
        </div>

        {/* Appearance */}
        <div>
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-1 border-b border-gray-200">
            Appearance
          </h3>
          
          <div className="space-y-4">
            <PropertyInput label="Width" property="width" min={1} />
            <PropertyInput label="Height" property="height" min={1} />
            <PropertyInput label="Opacity" property="opacity" min={0} max={1} step={0.01} />
            <PropertyInput label="Color" property="color" type="color" />
          </div>
        </div>

        {/* Keyframes */}
        {Object.keys(layer.keyframes).length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-1 border-b border-gray-200">
              Keyframes
            </h3>
            
            {Object.entries(layer.keyframes).map(([property, keyframes]) => (
              <div key={property} className="mb-3">
                <p className="text-xs text-gray-600 mb-1 font-medium">{property}</p>
                <div className="space-y-1">
                  {keyframes.map((keyframe, index) => (
                    <div key={index} className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 rounded border border-gray-200">
                      <span className="font-mono">{keyframe.time.toFixed(2)}s</span>
                      <span className="text-gray-700">{keyframe.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

