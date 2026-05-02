# WebRTC Video Streaming Application

This application allows you to stream video from one laptop's camera to another using WebRTC peer-to-peer connection with a signaling server.

## Architecture

- **Signaling Server** (server.js): WebSocket server that helps establish peer connections
- **Sender** (sender.html): Captures video from local camera
- **Receiver** (receiver.html): Displays the remote video stream

## Setup Instructions

### 1. Start the Signaling Server

```bash
cd server
npm install
npm start
```

The server will run on `ws://localhost:8080`

### 2. Open Sender (on Laptop 1)

- Important: For camera access the page must be opened in a secure context. The easiest way while testing is to open the sender page on the same machine as the camera using `localhost` (browsers treat `localhost` as a secure origin).

- Open a browser on the sender machine and navigate to: `http://localhost:8000/client/sender.html`
- Allow camera and microphone access when prompted
- You'll see your local camera feed

### 3. Open Receiver (on Laptop 2)

- Open a browser and navigate to: `http://localhost:8000/client/receiver.html` on the second laptop
- You'll see the video stream from Laptop 1's camera

## For Remote Connection (Different Machines)

If you want to connect between different machines on a network:

### Update the server address:

1. Find your laptop's local IP address:
   - Windows: Open Command Prompt and type `ipconfig` (look for IPv4 Address)
   - Mac/Linux: Open Terminal and type `ifconfig`

2. In `client/script.js`, the client already tries to connect to the same host serving the page. If you serve the pages from the server machine then the receiver will connect automatically. If you modify manually, change the WebSocket URL to the server IP like this:

   ```javascript
   ws = new WebSocket("ws://YOUR_SERVER_IP:8080");
   ```

3. Also update the server's firewall settings to allow connections on port 8080

### Running a local HTTP server:

You'll need a simple HTTP server to serve the HTML files. Use one of these:

**Python 3:**

```bash
python -m http.server 8000
```

**Python 2:**

```bash
python -m SimpleHTTPServer 8000
```

**Node.js (using http-server):**

```bash
npm install -g http-server
http-server -p 8000
```

## How It Works

1. **Signaling**: The WebSocket server exchanges connection information between sender and receiver
2. **Offer/Answer**: Sender creates an offer, receiver creates an answer (WebRTC SDP)
3. **ICE Candidates**: Both peers exchange ICE candidates for direct connection
4. **P2P Connection**: Once connected, video streams directly between peers
5. **STUN Server**: Uses Google's STUN server to help find public IP addresses

## Troubleshooting

### "No remote video appearing"

- Check browser console for errors (F12 → Console tab)
- Ensure both pages are opened and connected to the signaling server
- Check that WebSocket is connecting (you should see "Connected to signaling server" in console)

### "Camera permission denied"

- Check browser settings for camera/microphone permissions
- Restart the browser and try again
- Some browsers require HTTPS for camera access (except localhost)

### "Connection issues"

- Ensure the signaling server is running (`npm start` in server folder)
- Check that you're using the correct server IP/port
- Firewall may be blocking WebSocket on port 8080

## Browser Compatibility

- Chrome/Chromium 43+
- Firefox 22+
- Safari 11+
- Edge 79+

**Note:** Most modern browsers support WebRTC. Use the latest version for best compatibility.
