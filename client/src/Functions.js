import { FFmpeg, createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';




let mediaRecorder;
let chunks = [];
let video;
let start;
let startTime = 0;
let dataBeingRead = false;
let end;
let endTime = 0;

function startRecording() {
      document.crossOriginOpenerPolicy = 'same-origin';

    // Set Cross-Origin-Embedder-Policy header
    document.crossOriginEmbedderPolicy = 'require-corp';
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(function(stream) {
      video = document.getElementById('video');
      video.srcObject = stream;
      video.play();


      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = function(event) {
        chunks.push(event.data);
      };

      console.log(chunks);

      mediaRecorder.start();
    })
    .catch(function(err) {
      console.log("An error occurred: " + err);
    });
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {

        mediaRecorder.stop();
        video.pause();
        var blob = new Blob(chunks, { type : 'video/mp4' });

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
    
        var bytesProcessed = 0;
        console.log("Encoded Blob size: "+ encodedBlob.size)
        console.log("Bytes processed: "+bytesProcessed)
        let currentFile;
        let fileName = "myVideo";
        let segmentNum = 0;
        while (bytesProcessed < encodedBlob.size && encodedBlob.size !== 0){
            var start = bytesProcessed;
            var end = Math.min(start + Math.floor(bitrate*3), encodedBlob.size);
            var segment = encodedBlob.slice(start, end);
            console.log("Before");
    
            segment.arrayBuffer().then( buffer => {
              //const uint8Array = new Uint8Array(buffer);
              //console.log(btoa(String.fromCharCode.apply(null,uint8Array)));
              //currentFile = fileName + segmentNum.toString() + ".mp4";
              //console.log(currentFile);
            })
     
            console.log("after")
    
            bytesProcessed += segment.size;
    
            console.log("BYtes: "+bytesProcessed);
            console.log(segment);
    
        }
    
      }
}



async function encodeVideo(blob) {
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load({headers: {'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp'}});
    let encodedBlob;
  
    // create an input file from the blob
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(blob));

    let writer;
  
    // run the ffmpeg command to encode the video
    ffmpeg.run('-i', 'input.mp4', '-c:v', 'libx264','-b:v', '5M', '-preset', 'fast', '-crf', '23', '-c:a', 'aac', '-b:a', '128k', 'output%03d.mp4').then(() => {
      console.log('Video encoding complete');

      console.log("Writer")
      console.log(writer);
      
      const encodedBlob = new Blob([encodedBlob.buffer], { type: 'video/mp4' });
      return encodedBlob;
    }).catch((error) => {
      console.log("error we caught");
      console.log(error);
    })


    return null;
    
  }

export{startRecording, stopRecording}
