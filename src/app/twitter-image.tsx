import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1e293b',
          fontSize: 64,
          fontWeight: 'bold',
          color: 'white',
        }}
      >
        <div style={{ marginBottom: 20 }}>🤖</div>
        <div style={{ fontSize: 72, marginBottom: 20 }}>Chat RKT</div>
        <div style={{ fontSize: 32, opacity: 0.8 }}>
          Chat RKTとチャットできるWebアプリケーション
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}