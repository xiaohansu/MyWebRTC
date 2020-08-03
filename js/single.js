'use strict'

var startButton = document.getElementById('startButton');
var callButton = document.getElementById('callButton');
var hangupButton = document.getElementById('hangupButton');
callButton.disabled = true;
hangupButton.disabled = true;

startButton.addEventListener('click',startAction);
callButton.addEventListener('click',callAction);
hangupButton.addEventListener('click',hangupAction);

var localVideo = document.getElementById('local_video');
var remoteVideo = document.getElementById('remote_video');
var localStream;
var pc1;
var pc2;
const offerOptions = {
    offerToReceiveVideo: 1,
    offerToReceiveAudio:1
}

function startAction(){
     navigator.mediaDevices.getUserMedia({video:true,audio:true})
     .then(mediaStream=>{
        localStream = mediaStream;
        localVideo.srcObject = mediaStream;
        startButton.disabled = true;
        callButton.disabled = false;
     })
     .catch(e=>{
         console.log(JSON.stringify(e));
     })
}

function callAction(){
    hangupButton.disabled = false;
    callButton.disabled = true;

    pc1 = new RTCPeerConnection();
    pc1.addEventListener('icecandidate',event=>{
        var icecandidate = event.candidate;
        if(icecandidate){
            console.log(JSON.stringify(icecandidate));
            pc2.addIceCandidate(icecandidate);
        }
    });
    localStream.getTracks().forEach(track=>{
        pc1.addTrack(track,localStream);
    });

    pc2 = new RTCPeerConnection();
    pc2.addEventListener('addstream',function(event){
        remoteVideo.srcObject = event.stream;
    });
    
    pc1.createOffer(offerOptions).then(offer=>{
        pc1.setLocalDescription(offer);
        pc2.setRemoteDescription(offer);
        pc2.createAnswer().then(function (description) {
            pc2.setLocalDescription(description);
            pc1.setRemoteDescription(description);
        });
    });
}

function hangupAction() {
    localStream.getTracks().forEach(track => track.stop());
    pc1.close();
    pc2.close();
    pc1 = null;
    pc2 = null;
    hangupButton.disabled = true;
    callButton.disabled = true;
    startButton.disabled = false;
}


    // 1、A createOffer()，生成sdp A 调用setLocalDescription(sdpA）并将sdpA发送给B；
    // 2、B收到sdpA后调用 setRemoteDescription(sdpA),然后createAnswer，生成自己的sdpB,然后setLocalDescription(sdpB）并将sdpB发送给A；
    // 3、A收B的sdpB后，setRemoteDescription(sdpB)；
    // 4、交换ice信息，A将自己生成iceA信息发送给B,B调用addIceCandidate(iceA),然后B将自己生成iceB信息发送给A，A调用addIceCandidate(iceB)；
    // 5、经过以上步骤就建立了p2p链接。
    
    // 交换会话描述和网络描述
 