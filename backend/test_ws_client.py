import asyncio
import websockets

async def main():
    uri = 'ws://localhost:8000/ws'
    try:
        async with websockets.connect(uri) as ws:
            print('CONNECTED')
            msg = await ws.recv()
            print('MSG', msg[:400])
    except Exception as e:
        print('ERROR', e)

if __name__ == '__main__':
    asyncio.run(main())
