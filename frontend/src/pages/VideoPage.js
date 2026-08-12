import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuth';
import { useSocket } from '../context/SocketContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import './VideoPage.css';

const VideoPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { socket } = useSocket();
    const { user } = useAuthContext();

    const myVideo = useRef();
    const userVideo = useRef();
    const peerConnection = useRef();
    const localStream = useRef();

    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);

    useEffect(() => {
        if (!socket || !user) return;

        const checkSessionTime = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/session/user/${user._id}`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                const data = await res.json();
                const session = data.find(s => s.roomId === roomId);
                if (!session) {
                    alert("Session not found.");
                    return navigate('/sessions');
                }
                const now = new Date();
                const sessionTime = new Date(session.dateTime);
                if (now < sessionTime) {
                    alert("This session hasn't started yet.");
                    return navigate('/sessions');
                }
            } catch (err) {
                console.error("Error checking session time:", err);
                alert("Could not verify session time.");
                return navigate('/sessions');
            }
        };

        checkSessionTime();

        const configuration = {
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        };

        const setupPeerConnection = () => {
            const pc = new RTCPeerConnection(configuration);

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice-candidate', { roomId, candidate: event.candidate });
                }
            };

            pc.ontrack = (event) => {
                if (userVideo.current && event.streams[0]) {
                    userVideo.current.srcObject = event.streams[0];
                }
            };

            return pc;
        };

        peerConnection.current = setupPeerConnection();

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                localStream.current = stream;
                if (myVideo.current) {
                    myVideo.current.srcObject = stream;
                }
                stream.getTracks().forEach(track => {
                    peerConnection.current.addTrack(track, stream);
                });

                socket.emit('join-room', { roomId, userId: user._id });
            }).catch(err => {
                console.error("Failed to get media stream:", err);
            });

        socket.on('user-connected', () => {
            peerConnection.current.createOffer()
                .then(offer => peerConnection.current.setLocalDescription(offer))
                .then(() => {
                    socket.emit('offer', { roomId, sdp: peerConnection.current.localDescription });
                }).catch(err => console.error("Offer Error:", err));
        });

        socket.on('offer', (payload) => {
            peerConnection.current.setRemoteDescription(payload.sdp)
                .then(() => peerConnection.current.createAnswer())
                .then(answer => peerConnection.current.setLocalDescription(answer))
                .then(() => {
                    socket.emit('answer', { roomId, sdp: peerConnection.current.localDescription });
                }).catch(err => console.error("Answer Error:", err));
        });

        socket.on('answer', (payload) => {
            peerConnection.current.setRemoteDescription(payload.sdp).catch(err => console.error("Set Remote Desc Error:", err));
        });

        socket.on('ice-candidate', (candidate) => {
            peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(err => console.error("ICE Candidate Error:", err));
        });

        socket.on('user-disconnected', () => {
            alert("The other person has left the call.");
            navigate('/sessions');
        });

        return () => {
            if (socket && user) {
                socket.emit('leave-room', { roomId, userId: user._id });
            }
            localStream.current?.getTracks().forEach(track => track.stop());
            peerConnection.current?.close();
            socket.off('user-connected');
            socket.off('user-disconnected');
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
        };

    }, [roomId, socket, user, navigate]);

    const handleToggleMute = () => {
        localStream.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
        setIsMuted(prev => !prev);
    };

    const handleToggleCamera = () => {
        localStream.current.getVideoTracks().forEach(track => track.enabled = !track.enabled);
        setIsCameraOff(prev => !prev);
    };

    const handleHangUp = () => {
        if (socket && user) {
            socket.emit('leave-room', { roomId, userId: user._id });
        }
        navigate('/sessions');
    };

    return (
        <div className="video-page">
            <div className="video-grid">
                <video playsInline muted ref={myVideo} autoPlay className="video-player self-view" />
                <video playsInline ref={userVideo} autoPlay className="video-player partner-view" />
            </div>
            <div className="video-controls">
                <button onClick={handleToggleMute} className={`control-btn ${isMuted ? 'active' : ''}`}>
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                <button onClick={handleToggleCamera} className={`control-btn ${isCameraOff ? 'active' : ''}`}>
                    {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
                </button>
                <button onClick={handleHangUp} className="control-btn hang-up">
                    <PhoneOff size={24} />
                </button>
            </div>
        </div>
    );
};

export default VideoPage;
