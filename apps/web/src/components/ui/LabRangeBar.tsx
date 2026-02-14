
import React from 'react';

interface LabRangeBarProps {
    currentValue: number;
    previousValue?: number;
    min: number;
    max: number;
    targetMin: number;
    targetMax: number;
    unit: string;
}

export const LabRangeBar: React.FC<LabRangeBarProps> = ({
    currentValue,
    previousValue,
    min,
    max,
    targetMin,
    targetMax,
    unit,
}) => {
    // Calculate positions in percentage (0-100)
    const getPos = (val: number) => {
        const p = ((val - min) / (max - min)) * 100;
        return Math.min(100, Math.max(0, p));
    };

    const currentPos = getPos(currentValue);
    const previousPos = previousValue !== undefined ? getPos(previousValue) : null;

    // Segment colors
    // Low (Orange) -> Target (Green) -> High (Orange/Red)
    const targetStart = getPos(targetMin);
    const targetEnd = getPos(targetMax);

    return (
        <div className="w-full py-4">
            {/* Labels */}
            <div className="flex justify-between text-[10px] text-renal-muted mb-1 px-1">
                <span>{min}</span>
                <span>{max}</span>
            </div>

            <div className="relative h-1.5 w-full bg-renal-border/50 rounded-full overflow-visible">
                {/* Background segments */}
                {/* Normal range (Green) */}
                <div
                    className="absolute h-full bg-rs-green/40 rounded-full"
                    style={{ left: `${targetStart}%`, width: `${targetEnd - targetStart}%` }}
                />

                {/* Low range (Orange) */}
                <div
                    className="absolute h-full left-0 bg-rs-amber/40 rounded-l-full"
                    style={{ width: `${targetStart}%` }}
                />

                {/* High range (Red) */}
                <div
                    className="absolute h-full bg-rs-red/40 rounded-r-full"
                    style={{ left: `${targetEnd}%`, right: 0 }}
                />

                {/* Previous Marker (Light Blue Pin) */}
                {previousPos !== null && (
                    <div
                        className="absolute top-1/2 -translate-y-1/2 z-10 transition-all duration-700"
                        style={{ left: `${previousPos}%` }}
                    >
                        <div className="relative group">
                            <div className="w-3 h-3 bg-rs-blue/30 rounded-full border border-rs-blue/50 flex items-center justify-center">
                                <div className="w-1 h-1 bg-rs-blue rounded-full" />
                            </div>
                            {/* Tooltip-like label */}
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-rs-blue font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                Prev: {previousValue}
                            </div>
                        </div>
                        {/* Pointer downwards */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-2 border-l border-rs-blue/30" />
                    </div>
                )}

                {/* Current Marker (Dark Blue Water Drop) */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-1000"
                    style={{ left: `${currentPos}%` }}
                >
                    <div className="relative -mt-6 -ml-2.5">
                        <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 24C10 24 0 14.5 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 14.5 10 24 10 24Z"
                                className="fill-rs-blue drop-shadow-sm" />
                            <circle cx="10" cy="10" r="3" fill="white" fillOpacity="0.5" />
                        </svg>
                        <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-rs-blue">
                            {currentValue} {unit}
                        </div>
                    </div>
                </div>
            </div>

            {/* Threshold Labels */}
            <div className="relative w-full h-4 mt-1">
                <span
                    className="absolute text-[9px] text-renal-muted font-mono -translate-x-1/2"
                    style={{ left: `${targetStart}%` }}
                >
                    {targetMin}
                </span>
                <span
                    className="absolute text-[9px] text-renal-muted font-mono -translate-x-1/2"
                    style={{ left: `${targetEnd}%` }}
                >
                    {targetMax}
                </span>
            </div>
        </div>
    );
};
