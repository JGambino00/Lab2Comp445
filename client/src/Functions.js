import { FFmpeg, createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import axios from 'axios';



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
      let bytesProcessed = 1;
      mediaRecorder.onstop = async (ev)=>{
          let blob = new Blob(chunks, { 'type' : 'video/mp4;' });
          let encodedBlob = [];
          encodedBlob = await encodeVideo(blob);
          chunks = [];
          let fileName = '';
          let count = 1
          console.log(encodedBlob.length);
          for(let i =0; i<encodedBlob.length; i++){
            let blobToSend = new Blob([encodedBlob[i]], {'type' : 'video/mp4'});
            fileName = 'output' + count;
        
            console.log('Transmitting count: ' + count);
            count++;
            console.log(blobToSend);

            const timeoutPromise = new Promise((resolve, reject) => {
              setTimeout(() => {
                reject(new Error('Comp 445 Request timed out'));
              }, 5000); // timeout after 5 seconds
            });

            await Promise.race([
              axios.post('http://localhost:8080/acknowledge', {data: encodedBlob[i], name: fileName, seqNum: bytesProcessed}),
              timeoutPromise
            ]).then(response => {
              
                if(response.data['ackNumber'] == bytesProcessed+encodedBlob[i].length){
                  bytesProcessed += encodedBlob[i].length;
                  
                } else {
                  i--;
                  count--;
                  console.log('Incorrect number, re-transmitting')
                }
              
              
              
            })
            .catch(error => {
              console.log('Error: ', error);
              console.log(error.message.includes('Comp 445 Request timed out'))
              if(error.message.includes('Comp 445 Request timed out')){      
                i--;
                count--;
              }
            });
          
          }
         
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
    
      }
}

async function encodeVideo(blob) {

    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
    
  
    // create an input file from the blob
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(blob));

   
  
    // run the ffmpeg command to encode the video
    await ffmpeg.run('-i', 'input.mp4', '-c:v', 'libx264','-b:v', '5000k', '-filter_complex', '[0:v]setpts=PTS','-r','30','-segment_time', 3,'-s', '1280x720', 'output%03d.mp4');

    let segmentArray = [];
    try{   
      let uintArray = ffmpeg.FS('readFile', 'output%03d.mp4');
      const segmentSize = 1875000;
      console.log(uintArray.length);
      for(let i=0; i< uintArray.length; i+=segmentSize){
        const segment = uintArray.slice(i, i+segmentSize);
        segmentArray.push(segment);
      }
      console.log(segmentArray);  
      console.log(segmentArray.length);      
    }
    catch(err){
        console.log(err);  
    }

    return segmentArray;
    
  }





export{startRecording, stopRecording}
