"use strict";

var socket = io.connect();
var remoteVideo = document.getElementById('remote_video');
var socketTestBtn = document.getElementById('socketTest')
var dataChannel;
socket.emit("create or join", "room");


socketTestBtn.addEventListener('click',socketTest);
function socketTest(){
  console.log('send socket test msg')
  socket.emit('test',"testmessage");

}
var config = {
    'iceServers': [{
        'urls': 'stun:stun.l.google.com:19302'
    }]
};
var pb = new RTCPeerConnection(null);
socket.on("signal", function (message) {
  // console.log("收到来着clientA的sdp", JSON.stringify(message));

  pb.setRemoteDescription(new RTCSessionDescription(message));

  navigator.mediaDevices.getUserMedia({video:true,audio:false}).then(mediastream=>{
    mediastream.getTracks().forEach(track => pb.addTrack(track, mediastream));
  }).catch(e=>{
    console.log(JSON.stringify(e));
  })
  pb.createAnswer().then((description) => {
    pb.setLocalDescription(description);
    // console.log("发送自己的sdp", JSON.stringify(message));
    socket.emit("signal", description);
  });


});

pb.addEventListener("datachannel",event=>{
  dataChannel = event.channel;
  dataChannel.onmessage = (event)=>{
    console.log("message from client a ",event.data);
  }
})
socket.on("ice",candidate=>{
    // console.log("添加来着clientA的 icecandidate ")
    pb.addIceCandidate(new RTCIceCandidate(candidate));
});
pb.addEventListener("icecandidate",event=>{
  var iceCandidate = event.candidate;
  if (iceCandidate) {
      socket.emit('ice', iceCandidate);
  }
})

pb.addEventListener('addstream', function (event) {
  console.log("add stream",event.stream);
  remoteVideo.srcObject = event.stream;
});
