"use client";
import { useState, useEffect, useRef } from "react";
export default function Home() {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
          let finalText = "";
          for (let i = 0; i < event.results.length; i++) {
            finalText += event.results[i][0].transcript;
          }
          setText(finalText);
        };
        recognitionRef.current = recognition;
      }
    }
  }, []);
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setListening(!listening);
  };
  const saveTranscript = async () => {
    const res = await fetch("/api/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setTranscript(data.text);
  };
  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-900 via-black to-fuchsia-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">dictation</h1>
        <p className="text-xl text-gray-300 mb-8">Browser speech-to-text</p>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 text-center">
          <button onClick={toggleListening}
            className={`w-32 h-32 rounded-full text-2xl font-bold transition-all ${listening ? "bg-red-600 animate-pulse scale-110" : "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:scale-105"}`}>
            {listening ? "Stop" : "Mic"}
          </button>
          <p className="mt-4 text-gray-400">{listening ? "Listening..." : "Click to start dictation"}</p>
          {text && (
            <div className="mt-6 bg-white/5 rounded-xl p-4 text-left">
              <p className="text-lg">{text}</p>
            </div>
          )}
          {text && (
            <button onClick={saveTranscript}
              className="mt-4 px-6 py-2 bg-violet-600 rounded-full hover:bg-violet-500 transition">Save Transcript</button>
          )}
        </div>
        {transcript && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-2">Saved Transcript</h2>
            <p>{transcript}</p>
          </div>
        )}
      </div>
    </main>
  );
}