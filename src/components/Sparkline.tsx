'use client';

type Props = {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  filled?: boolean;
  className?: string;
};

export default function Sparkline({
  data,
  width = 140,
  height = 42,
  stroke = '#d4af37',
  filled = false,
  className,
}: Props) {
  if (!data?.length) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1 || 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });

  const pathD = `M ${points[0]} L ${points.slice(1).join(' ')}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className={className}>
      {filled && (
        <path
          d={`${pathD} L ${width},${height} L 0,${height} Z`}
          fill={stroke} fillOpacity="0.12"
          stroke="none"
        />
      )}
      <path d={pathD} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
