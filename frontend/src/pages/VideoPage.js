import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuth';
import { useSocket } from '../context/SocketContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import toast from 'react-hot-toast';
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
                    toast.error("Session not found.");
                    return navigate('/sessions');
                }
                const now = new Date();
                const sessionTime = new Date(session.dateTime);
                // Allow joining up to 15 minutes early
                if (now < new Date(sessionTime.getTime() - 15 * 60000)) {
                    toast.error("This session hasn't started yet.");
                    return navigate('/sessions');
                }
                setSessionDetails(session);
            } catch (err) {
                console.error("Error checking session time:", err);
                toast.error("Could not verify session time.");
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
            toast('The other person has left the call.', { icon: '👋' });
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

    return createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, backgroundColor: '#202124', color: 'white', display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            
            {/* Top Bar (Time / Session Info) */}
            <div className="flex justify-between items-center px-6 py-4 absolute top-0 left-0 right-0 z-50 pointer-events-none">
                <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span className="font-medium">{sessionDetails?.title || 'Session'}</span>
                    <span className="w-px h-4 bg-gray-500"></span>
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        {partnerName}
                    </span>
                </div>
            </div>

            {/* Main Video Area */}
            <div className="flex-grow flex justify-center items-center p-4 lg:p-6 pb-2 relative">
                {/* Partner Video Container */}
                <div className="w-full h-full relative rounded-2xl overflow-hidden bg-[#3c4043] shadow-lg flex justify-center items-center">
                    <video 
                        playsInline 
                        ref={userVideo} 
                        autoPlay 
                        className="w-full h-full object-contain bg-black" 
                    />
                    
                    {/* Partner Name Label */}
                    <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded text-sm font-medium tracking-wide">
                        {partnerName.toUpperCase()}
                    </div>
                </div>

                {/* Self Video (PiP) */}
                <div className="absolute bottom-6 right-6 lg:bottom-10 lg:right-10 w-48 lg:w-72 aspect-video rounded-xl overflow-hidden bg-[#3c4043] shadow-2xl border border-gray-600/50 flex justify-center items-center">
                    <video 
                        playsInline 
                        muted 
                        ref={myVideo} 
                        autoPlay 
                        className="w-full h-full object-contain bg-black" 
                    />
                    
                    {/* Self Name Label */}
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-medium">
                        YOU
                    </div>
                </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="h-20 lg:h-24 bg-[#202124] flex items-center justify-center gap-4 px-6 z-40 shrink-0">
                <button 
                    onClick={handleToggleMute} 
                    className={`w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-full transition-all ${isMuted ? 'bg-[#ea4335] hover:bg-[#d93025]' : 'bg-[#3c4043] hover:bg-[#4a4d51]'}`}
                >
                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>
                
                <button 
                    onClick={handleToggleCamera} 
                    className={`w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-full transition-all ${isCameraOff ? 'bg-[#ea4335] hover:bg-[#d93025]' : 'bg-[#3c4043] hover:bg-[#4a4d51]'}`}
                >
                    {isCameraOff ? <VideoOff size={22} /> : <Video size={22} />}
                </button>
                
                <button 
                    onClick={handleHangUp} 
                    className="h-10 lg:h-12 px-6 lg:px-8 rounded-full bg-[#ea4335] hover:bg-[#d93025] flex items-center justify-center transition-all"
                >
                    <PhoneOff size={22} />
                </button>
            </div>
        </div>,
        document.body
    );
};

export default VideoPage;
