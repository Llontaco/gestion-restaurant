export default function Logo({ size = 120 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.35,
        flexShrink: 0,
      }}
    >
      🍽️
    </div>
  );
}
