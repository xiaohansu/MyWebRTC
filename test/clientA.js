var socket = io.connect();
socket.emit("create or join", "room");
const offerOptions = {
  offerToReceiveVideo: 1,
  offerToReceiveAudio: 1,
};
var localVideo = document.getElementById("local_video");
var remoteVideo = document.getElementById("remote_video");
const bandwidthSelector = document.querySelector("select#bandwidth");
var config = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};
var pa = new RTCPeerConnection(config);
var dataChannel ;
var btStart = document.getElementById("startButton");
var btTs = document.getElementById("test");
var btSend = document.getElementById("sendMsg")
btTs.addEventListener("click",test);
btStart.addEventListener("click", offer);
btSend.addEventListener("click",sendMsg)

navigator.mediaDevices.getUserMedia({audio:true,video:true}).then(mediastream=>{
  console.log(mediastream.getTracks())
  localVideo.srcObject = mediastream;
})
function test(){
    console.log(JSON.stringify(pa.getSenders())) ;
}
function offer() {
  //  navigator.getUserMedia;    getUserMedia(constraints: MediaStreamConstraints, successCallback: NavigatorUserMediaSuccessCallback, errorCallback: NavigatorUserMediaErrorCallback): void;
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then(function (mediastream) {
      mediastream
        .getTracks()
        .forEach((track) => pa.addTrack(track, mediastream));
    })
    .catch(function (e) {
      console.log(JSON.stringify(e));
    });
  pa.createOffer(offerOptions)
    .then((offer) => {
      bandwidthSelector.disabled = false;
      pa.setLocalDescription(offer);
      // console.log("发送自己的sdp",offer);
      socket.emit("signal", offer);
    })
    .catch((e) => {
      console.log(JSON.stringify(e));
    });
}
function sendMsg(msg){
  // if(dataChannel){
    console.log('send but')
    dataChannel.send("hello")
  // }
}
pa.addEventListener("icecandidate", (event) => {
  var iceCandidate = event.candidate;
  if (iceCandidate) {
    // console.log("完成icecandidate的生成",event.candidate)
    socket.emit("ice", iceCandidate);
  }
});
pa.addEventListener("connectionstatechange", (event) => {
  console.log(pa.connectionState);
});

pa.addEventListener("icegatheringstatechange",(event)=>{
    console.log(`ice state : ${pa.iceGatheringState}`);
    // pa.iceGatheringState  
})
pa.addEventListener("iceconnectionstatechange",(event)=>{

})
socket.on("signal", (message) => {
  if (pa) {
    pa.setRemoteDescription(new RTCSessionDescription(message));
    dataChannel = pa.createDataChannel("ca",{reliable:false});
    
    dataChannel.addEventListener("close",()=>{
    
    });
    dataChannel.addEventListener("error",(err)=>{
      console.log("data channel error ",err);
    })
    dataChannel.addEventListener("open",(event)=>{
      console.log("datachnnel open ")
      dataChannel.send("hello this client a")
    })
    // console.log("收到来着clientB的sdp",JSON.stringify(message));
  }
});

socket.on("ice", (candidate) => {
  if (pa) {
    console.log("添加来着clientB的 icecandidate ");
    pa.addIceCandidate(new RTCIceCandidate(candidate));
  }
});

pa.addEventListener("addstream", function (event) {
  console.log("add stream", event.stream);
  remoteVideo.srcObject = event.stream;
});


// bandwidthSelector.onchange = () => {
//   const bandwidth =
//     bandwidthSelector.options[bandwidthSelector.selectedIndex].value;
//     if ((adapter.browserDetails.browser === 'chrome' ||
//     adapter.browserDetails.browser === 'safari' ||
//     (adapter.browserDetails.browser === 'firefox' &&
//      adapter.browserDetails.version >= 64)) &&
//    'RTCRtpSender' in window &&
//    'setParameters' in window.RTCRtpSender.prototype) {
//  const sender = pa1.getSenders()[0];
//  const parameters = sender.getParameters();
//  if (!parameters.encodings) {
//    parameters.encodings = [{}];
//  }
//  if (bandwidth === 'unlimited') {
//    delete parameters.encodings[0].maxBitrate;
//  } else {
//    parameters.encodings[0].maxBitrate = bandwidth * 1000;
//  }
//  sender.setParameters(parameters)
//      .then(() => {
//        bandwidthSelector.disabled = false;
//      })
//      .catch(e => console.error(e));
//  return;
// }

// function updateBandwidthRestriction(sdp, bandwidth) {
//   let modifier = "AS";
//   if (adapter.browserDetails.browser === "firefox") {
//     bandwidth = (bandwidth >>> 0) * 1000;
//     modifier = "TIAS";
//   }
//   if (sdp.indexOf("b=" + modifier + ":") === -1) {
//     // insert b= after c= line.
//     sdp = sdp.replace(
//       /c=IN (.*)\r\n/,
//       "c=IN $1\r\nb=" + modifier + ":" + bandwidth + "\r\n"
//     );
//   } else {
//     sdp = sdp.replace(
//       new RegExp("b=" + modifier + ":.*\r\n"),
//       "b=" + modifier + ":" + bandwidth + "\r\n"
//     );
//   }
//   return sdp;
// }

// function removeBandwidthRestriction(sdp) {
//   return sdp.replace(/b=AS:.*\r\n/, "").replace(/b=TIAS:.*\r\n/, "");
// }
