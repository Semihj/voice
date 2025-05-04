import { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); 

const VoiceChatApp = () => {
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerRef = useRef(null);
  const [room] = useState('voice-room');

  useEffect(() => {
    socket.emit('join', { room });

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      localAudioRef.current.srcObject = stream;

      peerRef.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      stream.getTracks().forEach(track => peerRef.current.addTrack(track, stream));

      peerRef.current.onicecandidate = event => {
        if (event.candidate) {
          socket.emit('signal', {
            room,
            type: 'ice-candidate',
            candidate: event.candidate
          });
        }
      };

      peerRef.current.ontrack = event => {
        remoteAudioRef.current.srcObject = event.streams[0];
      };

      socket.on('signal', async (data) => {
        if (data.type === 'offer') {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await peerRef.current.createAnswer();
          await peerRef.current.setLocalDescription(answer);
          socket.emit('signal', { room, type: 'answer', answer });
        } else if (data.type === 'answer') {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else if (data.type === 'ice-candidate') {
          try {
            await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (e) {
            console.error('Error adding received ice candidate', e);
          }
        }
      });

      socket.on('joined', async () => {
        const offer = await peerRef.current.createOffer();
        await peerRef.current.setLocalDescription(offer);
        socket.emit('signal', { room, type: 'offer', offer });
      });
    });
  }, [room]);

  return (
    <div>
      <h2>Voice Chat</h2>
      <audio ref={localAudioRef} autoPlay  />
      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
};

export default VoiceChatApp;
