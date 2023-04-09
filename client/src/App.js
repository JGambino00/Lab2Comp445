import logo from './logo.svg';
import React, {useState, useEffect} from 'react';
import './App.css';
import { startRecording, stopRecording } from './Functions';
import { FFmpeg, createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
const ffmpeg = createFFmpeg({log:true});



function App() {

  return (
      
      <body ng-controller="DashController" class="ng-scope">   
        <button id="btnStart" onClick={startRecording}>Start Recording</button>
        <button id="btnStop" onClick={stopRecording}>Stop Recording</button>
        <video id="video" width="1280" height="720" autoplay></video>
        <script src="https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.10.8/dist/ffmpeg.min.js" crossorigin></script>
        <script src="https://github.com/antimatter15/whammy/raw/master/whammy.js"></script>
      </body>
    
  );
}

export default App;
