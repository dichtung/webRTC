const constraints = {
  video: true,
  audio: false
};
var totalConnectionsNumber = 0;
var socket = undefined;
var peer = undefined;


jQuery("#remoteIdInput").on("change",function(){
    alert("triger III koji je uslovljen triggerom II eventa.");
});




navigator.mediaDevices.getUserMedia(constraints)
.then(function(mediaDeviceStream){

  socket = io().connect(location.host.split(':')[0]+location.host.split(':')[1]);

  // //redirekcija
  socket.on('connRedirect', function() {
    console.log('Reagujem na "connRedirect" event!');
    window.location.replace(window.location + 'redirect.html');
  });

  var video_my = document.querySelector("#myVideo");
  //promenimo view property na video elementu pre nego sto ga reprodukujemo
  jQuery("#selfViewSpan").css("display","block");
  jQuery("#myVideo").css("display","block");

  video_my.muted = true;
  video_my.srcObject = mediaDeviceStream;
  video_my.onloadedmetadata = function (e){
    video_my.play();
  };


  socket.on('connUpd',function(msg){
    console.log('Reagujem na "connUpd" event!');
    jQuery("#connectionNumberHeader").text("Broj aktivnih konekcija je: "+msg.brojKon);

    peer = new SimplePeer({
        //initiator: location.hash === '#init',
        initiator: (msg.brojKon == 2 && msg.idSocket == socket.id),
        trickle: false,
        stream: mediaDeviceStream
    });


    peer.on('signal', function (data) {
      console.log('Iniciram "signaling" event');
      jQuery('#myIdInput').val(JSON.stringify(data));

      console.log('emitujem sending_key_from_init event!');
      socket.emit('sending_key_from_init', data);

    });




    peer.on('stream', function (remoteMediaStream) {
      var video_remote = document.querySelector('#remVideo');
      //prikazujemo remote video tek kad je spreman + menjamo status u connected
      jQuery("#remoteViewSpan").css("display","block");
      jQuery("#remVideo").css("display","block");
      jQuery("#statusHeader").css("color","green");
      jQuery("#statusHeader").text("Connected");
      video_remote.srcObject = remoteMediaStream;
      video_remote.onloadedmetadata = function (e){
        video_remote.play();
      };
    })
  });

  socket.on('propagate_key_from_init',function(data){
    console.log('reagujem na propagate_key_from_init event');
    //sada kada je stigao kljuc, mi se mozemo pomocu njega konektovati na II user-a
    //prvo upisemo primljeni kljuc u tekst polje
    jQuery("#remoteIdInput").val(JSON.stringify(data));
    //trigerujemo f-ju koja triggeruje connect mehanizam
    connect(peer, JSON.stringify(data));

  });






})
.catch(function(error){
  console.log('Unable to fetch media stream' + error.toString());
});



function connect(peer, otherId){
  console.log("u funkciji connect!");
  peer.signal(otherId);
}
