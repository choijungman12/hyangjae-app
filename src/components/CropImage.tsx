import { CROP_VISUAL } from '@/data/crops';

interface CropImageProps {
  cropId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
  name?: string;
}

const SIZE_MAP = {
  sm:  { container: 'w-10 h-10', emoji: 'text-xl' },
  md:  { container: 'w-16 h-16', emoji: 'text-3xl' },
  lg:  { container: 'w-20 h-20', emoji: 'text-4xl' },
  xl:  { container: 'w-28 h-28', emoji: 'text-5xl' },
};

export default function CropImage({ cropId, size = 'md', className = '', showName = false, name }: CropImageProps) {
  const visual = CROP_VISUAL[cropId] ?? { emoji: '🌱', gradient: 'from-gray-400 to-gray-500' };
  const s = SIZE_MAP[size];

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className={`${s.container} rounded-2xl bg-gradient-to-br ${visual.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
        <span className={s.emoji} role="img" aria-label={name ?? cropId}>{visual.emoji}</span>
      </div>
      {showName && name && (
        <span className="text-xs font-bold text-gray-700">{name}</span>
      )}
    </div>
  );
}

/** Inline version – renders just the gradient+emoji square, no wrapper div */
export function CropImageInline({ cropId, className = '' }: { cropId: string; className?: string }) {
  const visual = CROP_VISUAL[cropId] ?? { emoji: '🌱', gradient: 'from-gray-400 to-gray-500' };
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${visual.gradient} flex items-center justify-center ${className}`}>
      <span className="text-3xl" role="img">{visual.emoji}</span>
    </div>
  );
}
