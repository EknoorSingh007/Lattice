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
    const [sessionDetails, setSessionDetails] = useState(null);

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
                // Allow joining up to 15 minutes early
                if (now < new Date(sessionTime.getTime() - 15 * 60000)) {
                    alert("This session hasn't started yet.");
                    return navigate('/sessions');
                }
                setSessionDetails(session);
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

    let partnerName = "Unknown";
    if (sessionDetails) {
        const isUser1 = sessionDetails.user1._id === user._id;
        const partner = isUser1 ? sessionDetails.user2 : sessionDetails.user1;
        if (partner?.profile) {
            partnerName = `${partner.profile.firstName} ${partner.profile.lastName}`;
        }
    }

    return (
        <div className="video-page fixed inset-0 z-50 bg-gray-900">
            {sessionDetails && (
                <div className="absolute top-6 left-6 z-40 bg-black/50 text-white px-6 py-3 rounded-xl backdrop-blur-sm border border-white/10">
                    <h2 className="text-2xl font-bold">{sessionDetails.title}</h2>
                    <p className="text-gray-300 flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        In session with {partnerName}
                    </p>
                </div>
            )}
            <div className="video-grid h-full w-full relative">
                <video playsInline muted ref={myVideo} autoPlay className="video-player self-view absolute bottom-24 right-6 w-48 md:w-64 aspect-video rounded-xl border-2 border-white/20 shadow-2xl z-30 object-cover bg-gray-800" />
                <video playsInline ref={userVideo} autoPlay className="video-player partner-view w-full h-full object-cover bg-gray-900 absolute inset-0 z-10" />
            </div>
            <div className="video-controls absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center gap-4 z-40">
                <button onClick={handleToggleMute} className={`control-btn p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600/80 hover:bg-gray-500/80'}`}>
                    {isMuted ? <MicOff size={28} className="text-white" /> : <Mic size={28} className="text-white" />}
                </button>
                <button onClick={handleToggleCamera} className={`control-btn p-4 rounded-full transition-all ${isCameraOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600/80 hover:bg-gray-500/80'}`}>
                    {isCameraOff ? <VideoOff size={28} className="text-white" /> : <Video size={28} className="text-white" />}
                </button>
                <button onClick={handleHangUp} className="control-btn hang-up p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                    <PhoneOff size={28} className="text-white" />
                </button>
            </div>
        </div>
    );
};

export default VideoPage;
