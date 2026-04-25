interface SkeletonProps {
  width?: string | number
  height?: string | number
  rounded?: string | number
}

export function Skeleton({ width = '100%', height = 16, rounded = 6 }: SkeletonProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: rounded,
        background: 'rgba(255,255,255,0.06)',
        animation: 'pulse-bar 1.8s ease-in-out infinite',
      }}
    />
  )
}