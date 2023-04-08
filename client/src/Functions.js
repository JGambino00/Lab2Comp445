import { FFmpeg, createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { EncodingMimeType, VideoEncoder, VideoDecoder } from '@mediacapture-encoding/web-codecs';


let mediaRecorder;
let chunks = [];
let video;
let start = new Date();
let startTime = 0;
let dataBeingRead = false;
let end;

function startRecording() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(function(stream) {
      video = document.getElementById('video');
      video.srcObject = stream;
      video.play();
      start = new Date();
      startTime = start.getTime();


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
        //const ffmpeg = createFFmpeg({ log: true });

        mediaRecorder.stop();
        video.pause();
        
        end = new Date();
        let duration =  (end.getTime() - startTime)/1000;
        console.log("DUration: "+duration);
        var mediaSource = new MediaSource();
    
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

const encodeVideo = async (blob) => {
    // Create a VideoEncoder instance
    const encoder = new VideoEncoder({
      mimeType: EncodingMimeType.H264,
      width: 1280,
      height: 720,
      bitrate: 5000000, // 5Mbps bitrate
      framerate: 30,
    });
  
    // Open the encoder
    await encoder.configure();
  
    // Create a ReadableStream from the Blob
    const stream = blob.stream();
  
    // Get a ReadableStreamDefaultReader instance
    const reader = stream.getReader();
  
    // Read chunks of the Blob and feed them into the encoder
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      await encoder.encode(value);
    }
  
    // Flush the encoder
    await encoder.flush();
  
    // Get the encoded data as a Blob
    const encodedBlob = await encoder.close();
  
    return encodedBlob;
  };

// async function encodeVideo(blob) {
//     const ffmpeg = createFFmpeg({ log: true });
//     await ffmpeg.load();
  
//     // create an input file from the blob
//     ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(blob));
  
//     // set the target bitrate to 5 Mbps
//     ffmpeg.setVideoBitrate('5M');
  
//     // run the ffmpeg command to encode the video
//     await ffmpeg.run('-i', 'input.mp4', '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-f', 'segment', '-segment_time', '3', '-map', '0', '-segment_format', 'mp4', 'output%03d.mp4');
  
//     // read the output file from memory
//     const output = ffmpeg.FS('readFile', 'output.mp4');
  
//     // create a blob from the output file
//     const encodedBlob = new Blob([output.buffer], { type: 'video/mp4' });

//     // return the encoded video blob
//     return encodedBlob;
//   }

export{startRecording, stopRecording}