import React, { useEffect, useRef, useState } from "react";


const VideoChat = () => {

    const refSelfMediaStream = useRef(null);
    const refSelfVideo = useRef(null);
    const refPc1 = useRef(
        new RTCPeerConnection()
    );
    const refPc2 = useRef(
        new RTCPeerConnection()
    );
    const refPeerTrackEvents = useRef([]);
    const refPeerVideoElemRefs = useRef({});
    const [peer, setPeer] = useState(false);


    useEffect(() => {
        const pc1 = refPc1.current;
        const pc2 = refPc2.current;
        const func = async () => {
            const selfMediaStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: { width: 320 },
            });
            refSelfMediaStream.current = selfMediaStream;
            if (refSelfMediaStream.current) {
                refSelfVideo.current.srcObject = selfMediaStream;
            }


            pc2.addEventListener("track", (e) => {
                refPeerTrackEvents.current.push(e);
                if (refPeerTrackEvents.current.length === 2) {
                    refPeerVideoElemRefs.current["peer"] = React.createRef();
                    setPeer(true);
                }
            });
            pc1.addEventListener("icecandidate", (e) => {
                if (e.candidate !== null) pc2.addIceCandidate(e.candidate);
            });
            pc2.addEventListener("icecandidate", (e) => {
                if (e.candidate !== null) pc1.addIceCandidate(e.candidate);
            });
            pc1.addEventListener("negotiationneeded", async () => {
                const offer = await pc1.createOffer();
                await pc1.setLocalDescription(offer);
                await pc2.setRemoteDescription(offer);
                const answer = await pc2.createAnswer();
                await pc2.setLocalDescription(answer);
                await pc1.setRemoteDescription(answer);
            });

            selfMediaStream.getTracks().forEach((track) => {
                pc1.addTrack(track, selfMediaStream);
            });
        };

        func();

        return () => {
            if (refSelfMediaStream.current) {
                refSelfMediaStream.current.getTracks().forEach((track) => track.stop());
            }
            pc1.close();
            pc2.close();
        };
    }, []);

    useEffect(() => {
        const events = refPeerTrackEvents.current;
        let elem;
        if (peer) {
            if (refPeerVideoElemRefs.current["peer"] && refPeerVideoElemRefs.current["peer"].current) {
                elem = refPeerVideoElemRefs.current["peer"].current;
                refPeerTrackEvents.current.forEach((e) => {
                    if (elem.srcObject) {
                        (elem.srcObject).addTrack(e.track);
                    } else {
                        elem.srcObject = e.streams[0];
                    }
                });
            }
        }

        return () => {
            if (peer) {
                events.forEach((e) => e.track.stop());
                if (elem) {
                    elem.srcObject.getTracks().forEach((track) => track.stop());
                    elem.srcObject = null;
                }
            }
        };
    }, [peer]);

    return (
        <div >
            <video ref={refSelfVideo} autoPlay />
            {peer
                ? <video ref={refPeerVideoElemRefs.current.peer} autoPlay />
                : null}
        </div>
    );
};

export default VideoChat;