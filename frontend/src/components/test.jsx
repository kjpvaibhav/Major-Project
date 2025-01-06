import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/logo.png';

function ChatGPTChat() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [text, setText] = useState(null);
  const inputRef = useRef(null);
  const audioRef = useRef();
  const streamRef = useRef(null);
  const maxTextAreaHeight = 200;
  const [isInputEmpty, setIsInputEmpty] = useState(true);
  const chatAreaRef = useRef(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsInputEmpty(e.target.value.trim() === "");
    adjustTextAreaHeight();
  };

  const adjustTextAreaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      const scrollHeight = inputRef.current.scrollHeight;
      inputRef.current.style.height = `${Math.min(scrollHeight, maxTextAreaHeight)}px`;
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      startRecording();
    } else {
      setIsRecording(false);
      stopRecording();
    }
  };

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
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
            setAudioBlob(blob);
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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  const sendMessage = () => {
    if (audioBlob) {
      sendAudioToBackend();
    } else if (inputValue.trim() !== "") {
      sendTextToBackend(inputValue.trim());
      setInputValue("");
    }
  };
  
  
  const sendTextToBackend = (text) => {
    fetch("http://localhost:8000/send-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Text sent successfully:", data);
        setText(data)
        // Handle response if needed
      })
      .catch((error) => {
        console.error("Error sending text:", error);
      });
  };
  
  const sendAudioToBackend = () => {
    const formData = new FormData();
    formData.append("audio_file", audioBlob);
  
    fetch("http://localhost:8000/upload/", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Audio sent successfully:", data);
        setText(data);
        setAudioBlob(null);
        setIsRecording(false);
      })
      .catch((error) => {
        console.error("Error sending audio:", error);
      });
  };

  useEffect(() => {
    console.log("audioRef.current:", audioRef.current);
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the chat area when new messages are added
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Navigation Bar */}
      <div className="flex items-center fixed top-0 left-0 w-full bg-[#000] p-4 z-10">
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-10 mr-2" />
          <h1 className="text-white text-4xl font-extrabold italic">V<span className="text-[#DAA520]">E</span>DA</h1>
        </div>
      </div>
  
      {/* Main Chat Area */}
      <div ref={chatAreaRef} className="flex-1 flex flex-col relative pt-20 pb-10 overflow-y-scroll px-4">
        {/* Render text messages */}
        {text && (
          <div className="py-2">
            <div className="ml-auto rounded-lg rounded-tr-none my-1 p-2 text-md bg-green-200 flex flex-col relative max-w-screen-md">
              <p>{text.transcript}</p>
            </div>
            <div className="mr-auto rounded-lg rounded-tl-none my-1 p-2 text-md bg-white flex flex-col relative shadow-md text-justify max-w-screen-md">
              <p className="text-gray-800">{text.generated_text}</p>
            </div>
          </div>
        )}

        {/* Render chat messages */}
        {messages.map((message, index) => (
          <div key={index} className={`py-2 ${message.isSent ? 'text-right' : 'text-left'}`}>
            <div className="bg-gray-800 text-white rounded-lg p-2 max-w-md">{message.text}</div>
          </div>
        ))}
      </div>
      {/* Chat Input Box */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#000] p-4 z-10">
        <div className="bg-[#5a595953] w-full max-w-[900px] text-white mx-auto">
          <div className="flex items-center bg-[#3a3a3a91] rounded-lg px-4 py-2">
            {/* Microphone button for recording audio */}
            <button
              onClick={toggleRecording}
              className={`p-2 rounded-full focus:outline-none bg-[#3a3a3a91] hover:bg-gray-600`}
            >
              <FontAwesomeIcon icon={faMicrophone} className="text-white" style={{ fontSize: "1.5em" }} />
            </button>
            {/* Text input area */}
            {!isRecording && (
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 border-none bg-transparent resize-none focus:outline-none custom-scrollbar ml-2"
                style={{ maxHeight: `${maxTextAreaHeight}px`, overflowY: "auto", minHeight: "50px", paddingTop: isInputEmpty ? "10px" : "0" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
            )}
            {isRecording && <div className="flex-1 flex items-center ml-2 text-white">Listening...</div>}
  
            {/* Send button */}
            <button
              onClick={sendMessage}
              className={`ml-4 p-2 rounded-full focus:outline-none ${isInputEmpty ? "bg-gray-600 text-white" : "bg-white text-gray-600"} hover:bg-blue-200`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={`h-6 w-6 ${isInputEmpty ? "text-white" : "text-gray-600"}`}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Audio Element */}
      <audio ref={audioRef} style={{ display: 'none' }} controls />
    </div>
  );
}

export default ChatGPTChat;