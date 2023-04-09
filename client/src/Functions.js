import { FFmpeg, createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';




let mediaRecorder;
let chunks = [];
let frames = [];
let video;
let start;
let startTime = 0;
let dataBeingRead = false;
let end;
let endTime = 0;

let constraintObj = { 
  audio: true, 
  video: { 
      facingMode: "user", 
      width: 1280,
      height: 720 
  } 
};

function startRecording() {
      document.crossOriginOpenerPolicy = 'same-origin';

    // Set Cross-Origin-Embedder-Policy header
    document.crossOriginEmbedderPolicy = 'require-corp';
    navigator.mediaDevices.getUserMedia(constraintObj)
    .then(function(mediaStreamObj) {
      //connect the media stream to the first video element
      let video = document.querySelector('video');
      if ("srcObject" in video) {
          video.srcObject = mediaStreamObj;
      } else {
          //old version
          video.src = window.URL.createObjectURL(mediaStreamObj);
      }
      
      video.onloadedmetadata = function(ev) {
          //show in the video element what is being captured by the webcam
          video.play();
      };
      
      //add listeners for saving video/audio
      let start = document.getElementById('btnStart');
      let stop = document.getElementById('btnStop');
      let vidSave = document.getElementById('video');
      let mediaRecorder = new MediaRecorder(mediaStreamObj);
      mediaRecorder.start();
      console.log(mediaRecorder.state);
      let chunks = [];
    

      stop.addEventListener('click', (ev)=>{
          mediaRecorder.stop();
          console.log(mediaRecorder.state);
      });
      mediaRecorder.ondataavailable = function(ev) {
          chunks.push(ev.data);
      }
      mediaRecorder.onstop = (ev)=>{
          let blob = new Blob(chunks, { 'type' : 'video/mp4;' });
          let encodedBlob = encodeVideo(blob);
          chunks = [];
          console.log("Blob");
          console.log(blob);

          const mediaSource = new MediaSource();
          const videoElement = document.createElement('videoForFrames');
          videoElement.src = URL.createObjectURL(mediaSource);

          mediaSource.addEventListener('sourceopen', () => {
            const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64001e"');
            sourceBuffer.addEventListener('updateend', () => {
                sourceBuffer.appendBuffer(blob);
                console.log("appended");
              });
          });


          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          function drawFrame() {
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            console.log("Image data");
            console.log(imageData);
            requestAnimationFrame(drawFrame);
          }


          videoElement.addEventListener('loadedmetadata', () => {
            drawFrame();
          });

          

          


          console.log(1)
          let videoURL = URL.createObjectURL(blob);
          vidSave.src = videoURL;
          console.log(2)
      }
  })
  .catch(function(err) { 
      console.log(err.name, err.message); 
  });
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {

        mediaRecorder.stop();
        video.pause();
        var blob = new Blob(chunks, { type : 'video/mp4' });
/*
        let encodedBlob = encodeVideo(blob);
        console.log('Encoded Blob:');
        console.log(encodedBlob);
        let bitrate =  encodedBlob.bitrate;
        
        var fileSize = encodedBlob.size;
        //var bitrate = fileSize / duration;
        console.log('Byterate: ' + bitrate + ' Bps');
        let fileReader = new FileReader();
    
        fileReader.addEventListener('load', () => {
          var content = fileReader.result; // this is the content of the Blob segment
          console.log("done")
          console.log(content);
          dataBeingRead = false;
        })
    
        */
    
      }
}

async function encodeVideo(blob) {

    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
    
  
    // create an input file from the blob
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(blob));

    let writer;
  
    // run the ffmpeg command to encode the video
    await ffmpeg.run('-i', 'input.mp4', '-c:v', 'libx264','-b:v', '5000k', '-filter_complex', '[0:v]setpts=PTS','-r','30','-segment_time', 3,'-s', '1280x720', 'output%03d.mp4');

    let errorReading = false;
    let filecount =1;
    let prefix = 'output';
    let suffix = '.mp4';

    while(!errorReading){
        try{
            let midString = filecount.toString().padStart(3,'0');
            let fileName = prefix + midString + suffix;
            console.log("Trying");
            console.log(fileName);
            let uintArray = ffmpeg.FS('readFile', fileName);
            filecount++;
        }
        catch(err){
            console.log("Finsihed Reading");
            console.log(err);
            errorReading = true;
        }
    }

    let uintArray = ffmpeg.FS('readFile', 'output%03d.mp4');
    console.log("read successfully");

    console.log("uintarray");
    console.log(uintArray);
    


    return null;
    
  }





export{startRecording, stopRecording}
