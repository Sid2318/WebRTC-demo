# Quick Start Guide

## Step-by-Step Instructions

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Terminal Window 1 - Start Signaling Server

```bash
cd server
npm start
```

You should see: `Signaling server running on ws://localhost:8080`

### 3. Terminal Window 2 - Start HTTP Server

From the webrtc folder root:

```bash
python -m http.server 8000
```

Or use Node's http-server if you prefer.

### 4. Laptop 1 (Sender)

- Open browser: `http://localhost:8000/client/sender.html`
- Allow camera/microphone access
- You'll see your camera feed

### 5. Laptop 2 (Receiver)

- Open browser: `http://YOUR_LAPTOP1_IP:8000/client/receiver.html`
- To find IP: run `ipconfig` in Command Prompt (Windows)
- You should see the video from Laptop 1 after a few seconds

## For Testing Locally (Both on Same Machine)

1. Start server (Terminal 1)
2. Start HTTP server (Terminal 2)
3. Open sender: `http://localhost:8000/client/sender.html`
4. Open receiver in another tab/window: `http://localhost:8000/client/receiver.html`

## Console Debugging

Press F12 in browser → Console tab to see connection status and any errors.

## Common Issues & Solutions

| Issue                         | Solution                                                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| No camera video               | Browser asking for permission? Click allow. Check camera works elsewhere.                                      |
| Remote video not showing      | Both browsers need to be open. Check console for errors. WebSocket should show "Connected to signaling server" |
| Connection timeout            | Ensure signaling server is running. Check firewall on port 8080.                                               |
| "ws://localhost:8080 refused" | Server not running? Run `npm start` in server folder.                                                          |
