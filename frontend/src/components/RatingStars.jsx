import { useState } from 'react';
import { Star } from 'lucide-react';

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Average',
  4: 'Good',
  5: 'Excellent!'
};

export default function RatingStars({
  value = 0,
  max = 5,
  interactive = false,
  onChange = () => {},
  size = 20,
  showLabel = false
}) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = interactive && hoverValue > 0 ? hoverValue : value;
  const currentLabel = RATING_LABELS[displayValue] || '';

  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: max }, (_, index) => {
          const starNumber = index + 1;
          const isFilled = starNumber <= Math.round(displayValue);

          return (
            <button
              key={starNumber}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange(starNumber)}
              onMouseEnter={() => interactive && setHoverValue(starNumber)}
              onMouseLeave={() => interactive && setHoverValue(0)}
              className={`transition-all duration-150 ${
                interactive
                  ? 'cursor-pointer hover:scale-115 active:scale-95 focus:outline-none'
                  : 'cursor-default'
              }`}
              title={interactive ? `${starNumber} star - ${RATING_LABELS[starNumber]}` : `${value} stars`}
            >
              <Star
                size={size}
                className={`${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                    : 'text-slate-200 fill-slate-100'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && currentLabel && (
        <span className="text-xs font-semibold text-slate-700 min-w-[65px]">
          {currentLabel}
        </span>
      )}
    </div>
  );
}
