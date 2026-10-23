import CareProgramArt from '@/components/CareProgramArt';
import { useCustomImage } from '@/hooks/useCustomImage';
import type { CareProgram } from '@/data/farmStory';

interface CareProgramImageProps {
  program: CareProgram;
  className?: string;
}

/**
 * 치유농업 프로그램 대표 이미지.
 *
 * 관리자가 `/admin/content` 에서 해당 슬롯에 사진을 올렸으면 그 사진을,
 * 아직 없으면 프로그램 내용을 그린 벡터 일러스트를 보여 줍니다.
 */
export default function CareProgramImage({ program, className = '' }: CareProgramImageProps) {
  const uploaded = useCustomImage(program.imageKey, '');

  if (uploaded) {
    return (
      <img
        src={uploaded}
        alt={`${program.name} — ${program.target} 치유농업 프로그램`}
        className={`object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  return <CareProgramArt kind={program.art} className={className} title={`${program.name} 프로그램 일러스트`} />;
}
