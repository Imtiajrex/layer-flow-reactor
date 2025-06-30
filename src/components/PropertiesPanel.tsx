
import React from 'react';
import { Plus } from 'lucide-react';
import { Layer } from './AnimationEditor';

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
      <div className="h-full flex items-center justify-center text-gray-500">
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
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">
          {label}
        </label>
        <button
          onClick={() => handleAddKeyframe(property)}
          className="p-1 hover:bg-gray-600 rounded transition-colors"
          title="Add keyframe"
        >
          <Plus className="w-3 h-3 text-gray-400" />
        </button>
      </div>
      
      {type === 'color' ? (
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={layer.properties[property as keyof typeof layer.properties] as string}
            onChange={(e) => handlePropertyChange(property, e.target.value)}
            className="w-8 h-8 rounded border border-gray-600 bg-transparent cursor-pointer"
          />
          <input
            type="text"
            value={layer.properties[property as keyof typeof layer.properties] as string}
            onChange={(e) => handlePropertyChange(property, e.target.value)}
            className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
          />
        </div>
      ) : (
        <input
          type={type}
          value={layer.properties[property as keyof typeof layer.properties] as number}
          onChange={(e) => handlePropertyChange(property, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
          min={min}
          max={max}
          step={step}
          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
        />
      )}
    </div>
  );

  return (
    <div className="h-full">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
          Properties
        </h2>
        <p className="text-xs text-gray-400 mt-1">{layer.name}</p>
      </div>
      
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Transform */}
        <div>
          <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-3 border-b border-gray-700 pb-1">
            Transform
          </h3>
          
          <PropertyInput label="X Position" property="x" />
          <PropertyInput label="Y Position" property="y" />
          <PropertyInput label="Rotation" property="rotation" min={-360} max={360} />
          <PropertyInput label="Scale X" property="scaleX" min={0} max={5} step={0.1} />
          <PropertyInput label="Scale Y" property="scaleY" min={0} max={5} step={0.1} />
        </div>

        {/* Appearance */}
        <div>
          <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-3 border-b border-gray-700 pb-1">
            Appearance
          </h3>
          
          <PropertyInput label="Width" property="width" min={1} />
          <PropertyInput label="Height" property="height" min={1} />
          <PropertyInput label="Opacity" property="opacity" min={0} max={1} step={0.01} />
          <PropertyInput label="Color" property="color" type="color" />
        </div>

        {/* Keyframes */}
        {Object.keys(layer.keyframes).length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-3 border-b border-gray-700 pb-1">
              Keyframes
            </h3>
            
            {Object.entries(layer.keyframes).map(([property, keyframes]) => (
              <div key={property} className="mb-3">
                <p className="text-xs text-gray-400 mb-1">{property}</p>
                <div className="space-y-1">
                  {keyframes.map((keyframe, index) => (
                    <div key={index} className="flex items-center justify-between text-xs bg-gray-700 px-2 py-1 rounded">
                      <span>{keyframe.time.toFixed(2)}s</span>
                      <span className="text-gray-300">{keyframe.value}</span>
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
