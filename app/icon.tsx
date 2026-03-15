import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const contentType = 'image/png'

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#7c3aed',
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 'bold',
                    borderRadius: '8px',
                }}
            >
                D
            </div>
        ),
        {
            width: 32,
            height: 32,
        }
    )
}
