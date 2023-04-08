import logo from './logo.svg';
import './App.css';
import { startRecording, stopRecording } from './Functions';
import 'sharedarraybuffer';

function App() {
  return (
      
      <body ng-controller="DashController" class="ng-scope">   
        <button onClick={startRecording}>Start Recording</button>
        <button onClick={stopRecording}>Stop Recording</button>
        <video id="video" width="1280" height="720" autoplay></video>
        <script src="https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.10.8/dist/ffmpeg.min.js" crossorigin></script>
      </body>
    
  );
}

export default App;
