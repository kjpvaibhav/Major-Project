import React, { useState, useRef } from "react";

function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [text, setText] = useState();
  const audioRef = useRef();
  const streamRef = useRef(null);

  const startRecording = () => {
    setRecording(true);
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((mediaStream) => {
        if (audioRef.current && "srcObject" in audioRef.current) {
          streamRef.current = mediaStream;
          audioRef.current.srcObject = mediaStream;
          const mediaRecorder = new MediaRecorder(mediaStream);
          const chunks = [];

          mediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data);
          };

          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: "audio/wav" });
            setAudioFile(blob);
          };

          mediaRecorder.start();
        } else {
          console.error("Audio element or srcObject not available.");
        }
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  };

  const stopRecording = () => {
    setRecording(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  const sendAudio = () => {
    if (audioFile) {
      const formData = new FormData();
      formData.append("audio_file", audioFile);

      fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          setText(data);
        })
        .catch((error) => {
          console.error("Error sending audio:", error);
        });
    } else {
      console.error("No audio to send.");
    }
  };

  return (
    <>
      {text && (
        <div className="py-20 relative flex flex-grow flex-col px-12 justify-end bg-black">
          <div className="ml-auto rounded-lg rounded-tr-none my-1 p-2 text-md bg-green-200 flex flex-col relative max-w-screen-md">
            <p> {text.transcript}</p>
            <p className="text-gray-600 text-xs text-right leading-none">
              8:00 AM
            </p>
          </div>
          <div className="mr-auto rounded-lg rounded-tl-none my-1 p-2 text-md bg-white flex flex-col relative shadow-md text-justify max-w-screen-md">
            <p className="text-gray-800">{text.generated_text}</p>
            <p className="text-gray-600 text-xs text-right mt-1">8:45 AM</p>
          </div>
        </div>
      )}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-200 p-4 flex justify-between items-center">
        <audio ref={audioRef} controls className="hidden" />
        <button
          onClick={startRecording}
          disabled={recording}
          className={`flex flex-shrink-0 p-2 bg-blue-500 text-white rounded-full focus:outline-none ${
            recording ? "bg-blue-400 cursor-not-allowed" : "hover:bg-blue-600"
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          <span className="hidden md:block ml-2">Start Recording</span>
        </button>
        <button
          onClick={stopRecording}
          disabled={!recording}
          className={`flex flex-shrink-0 p-2 bg-red-500 text-white rounded-full focus:outline-none ${
            !recording ? "bg-red-400 cursor-not-allowed" : "hover:bg-red-600"
          } ml-2`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span className="hidden md:block ml-2">Stop Recording</span>
        </button>
        <button
          onClick={sendAudio}
          disabled={!audioFile}
          className={`flex flex-shrink-0 p-2 bg-green-500 text-white rounded-full focus:outline-none ${
            audioFile ? "bg-green-600 hover:bg-green-700" : "bg-green-400 cursor-not-allowed"
          } ml-2`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="hidden md:block ml-2">Send Audio</span>
        </button>
      </div>
    </>
  );
        }  
export default AudioRecorder;
