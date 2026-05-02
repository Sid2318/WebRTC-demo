let pc = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
});

let ws;
let localStream;

function start(isSender) {
  // Connect to signaling server using the host serving this page.
  // This lets receiver pages opened from the server automatically connect
  // to the correct IP (useful when sender/receiver are on different machines).
  const wsUrl = `ws://${location.hostname}:8080`;
  console.log("Connecting to signaling server at", wsUrl);
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("Connected to signaling server");
  };

  if (isSender) {
    // Some browsers only expose getUserMedia in secure contexts.
    // When testing locally across machines, open the sender page on the sender
    // machine as `http://localhost:8000/...` (localhost is treated as secure).
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error(
        "getUserMedia is not available. Open the sender page using localhost or HTTPS.",
      );
      alert(
        "Camera unavailable: open the sender page on this computer as http://localhost:8000/client/sender.html (or use HTTPS).",
      );
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        console.log("Camera stream acquired");
        localStream = stream;
        document.getElementById("localVideo").srcObject = stream;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        console.log("Tracks added to peer connection");

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("Sending ICE candidate");
            ws.send(
              JSON.stringify({ type: "candidate", candidate: event.candidate }),
            );
          }
        };

        pc.createOffer()
          .then((offer) => {
            console.log("Offer created:", offer);
            return pc.setLocalDescription(offer);
          })
          .then(() => {
            console.log("Local description set, sending offer");
            ws.send(
              JSON.stringify({ type: "offer", offer: pc.localDescription }),
            );
          })
          .catch((error) => {
            console.error("Error creating offer:", error);
          });
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
      });
  } else {
    pc.ontrack = (event) => {
      console.log("Received remote track:", event.track.kind);
      console.log("Stream ID:", event.streams[0].id);
      console.log("Track enabled:", event.track.enabled);

      const remoteVideo = document.getElementById("remoteVideo");
      remoteVideo.srcObject = event.streams[0];

      remoteVideo.onplay = () => {
        console.log("Video playing successfully!");
      };

      remoteVideo.onerror = (error) => {
        console.error("Video error:", error);
      };
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws.send(
          JSON.stringify({ type: "candidate", candidate: event.candidate }),
        );
      }
    };
  }

  ws.onmessage = async (message) => {
    try {
      let data = JSON.parse(message.data);
      console.log("Message received:", data.type);

      if (data.type === "offer") {
        console.log("Received offer");
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        let answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log("Sending answer");
        ws.send(
          JSON.stringify({ type: "answer", answer: pc.localDescription }),
        );
      }

      if (data.type === "answer") {
        console.log("Received answer");
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }

      if (data.type === "candidate") {
        console.log("Received ICE candidate");
        if (data.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (error) {
            console.error("Error adding ICE candidate:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error in ws.onmessage:", error);
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  ws.onclose = () => {
    console.log("Disconnected from signaling server");
  };
}
