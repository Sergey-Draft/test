import React, { useEffect, useRef, useState } from 'react';
import './App.scss';


const App = () => {

  const localVideoRef = useRef()
  const remoteVideoRef = useRef()
  const [callDisabled, setCallDisabled] = useState(true)
  const [startDisabled, setStartDisabled] = useState(false)

  const [localStream, setLoaclStream] = useState(null)


  const [callInfo, setCallInfo] = useState({
    statistic: [
      {
        /*         date: '',
                startTime: '',
                endTime: '',
                duration: '' */
      }
    ]
  })


/*   useEffect(() => {
    console.log(callInfo);
  }, [callInfo]) */




  let pc1;
  let pc2;
  const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
  };


  function getName(pc) {
    return (pc === pc1) ? 'pc1' : 'pc2';
  }

  function getOtherPc(pc) {
    return (pc === pc1) ? pc2 : pc1;
  }


  const getUserMedia = async () => {
    const constraints = {
      audio: true,
      video: true
    }
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => { localVideoRef.current.srcObject = stream; setLoaclStream(stream) })
      .catch(e => { console.log('getUserMedia Error: ', e) })

    setCallDisabled(false)
    setStartDisabled(true)
    console.log(localStream)

  }



  async function call() {
    console.log('Starting call');
    console.log(localStream);


    const currentDate = new Date().toLocaleDateString()
    const startTime = new Date().toLocaleTimeString()

    const configuration = {};
    console.log('RTCPeerConnection configuration:', configuration);
    pc1 = new RTCPeerConnection(configuration);
    console.log('Created local peer connection object pc1');
    pc1.onicecandidate = (e) => onIceCandidate(pc1, e);
    pc2 = new RTCPeerConnection(configuration);
    console.log('Created remote peer connection object pc2');
    pc2.onicecandidate = (e) => onIceCandidate(pc2, e);
    pc2.addEventListener('track', gotRemoteStream);

    localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));
    console.log('Added local stream to pc1');

    try {
      console.log('pc1 createOffer start');
      const offer = await pc1.createOffer(offerOptions);
      await onCreateOfferSuccess(offer);
    } catch (e) {
      onCreateSessionDescriptionError(e);
    }

    setCallInfo({
      statistic: [{ date: currentDate, startTime: startTime }]
    })
  }


  

  function onCreateSessionDescriptionError(error) {
    console.log(`Failed to create session description: ${error.toString()}`);
  }

  async function onCreateOfferSuccess(desc) {
    console.log(`Offer from pc1\n${desc.sdp}`);
    console.log('pc1 setLocalDescription start');
    try {
      await pc1.setLocalDescription(desc);
      onSetLocalSuccess(pc1);
    } catch (e) {
      onSetSessionDescriptionError();
    }

    console.log('pc2 setRemoteDescription start');
    try {
      await pc2.setRemoteDescription(desc);
      onSetRemoteSuccess(pc2);
    } catch (e) {
      onSetSessionDescriptionError();
    }

    console.log('pc2 createAnswer start');
    try {
      const answer = await pc2.createAnswer();
      await onCreateAnswerSuccess(answer);
    } catch (e) {
      onCreateSessionDescriptionError(e);
    }
  }

  function onSetLocalSuccess(pc) {
    console.log(`${getName(pc)} setLocalDescription complete`);
  }

  function onSetRemoteSuccess(pc) {
    console.log(`${getName(pc)} setRemoteDescription complete`);
  }

  function onSetSessionDescriptionError(error) {
    console.log(`Failed to set session description: ${error.toString()}`);
  }

  function gotRemoteStream(e) {
    console.log(remoteVideoRef)
    if (remoteVideoRef.current.srcObject !== e.streams[0]) {
      remoteVideoRef.current.srcObject = e.streams[0];
      console.log('pc2 received remote stream');
    }
  }

  async function onCreateAnswerSuccess(desc) {
    console.log(`Answer from pc2:\n${desc.sdp}`);
    console.log('pc2 setLocalDescription start');
    try {
      await pc2.setLocalDescription(desc);
      onSetLocalSuccess(pc2);
    } catch (e) {
      onSetSessionDescriptionError(e);
    }
    console.log('pc1 setRemoteDescription start');
    try {
      await pc1.setRemoteDescription(desc);
      onSetRemoteSuccess(pc1);
    } catch (e) {
      onSetSessionDescriptionError(e);
    }
  }

  async function onIceCandidate(pc, event) {
    try {
      await (getOtherPc(pc).addIceCandidate(event.candidate));
      onAddIceCandidateSuccess(pc);
    } catch (e) {
      onAddIceCandidateError(pc, e);
    }
    console.log(`${getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
  }

  function onAddIceCandidateSuccess(pc) {
    console.log(`${getName(pc)} addIceCandidate success`);
  }

  function onAddIceCandidateError(pc, error) {
    console.log(`${getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
  }


  function hangup() {
    console.log('Ending call', pc1);
    pc1.close();
    pc2.close();
    pc1 = null;
    pc2 = null;

  }


  return (
    <div>
      <div className="container" >
        <video id="localVideo" autoPlay ref={localVideoRef} ></video>
        <video id="remoteVideo" autoPlay ref={remoteVideoRef} ></video>
        <p>statistic</p>
        <div className="statistic">{JSON.stringify(callInfo)}</div>
        <div className="box" >
          <button className="btn btn-success" onClick={() => getUserMedia()} disabled={startDisabled} >Захват аудио видео</button>
          <button className="btn btn-success" onClick={() => call() } disabled={callDisabled} >Звонок</button>
          <button className="btn btn-danger" onClick={() => hangup()} >Сброс</button>
        </div>
      </div>
    </div>
  );
}

export default App;
