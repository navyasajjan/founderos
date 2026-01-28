
import { GoogleGenAI, Type, Modality, Blob, LiveServerMessage } from "@google/genai";
import { QuickCaptureSuggestion, DraftCard } from "./types";

// Helper functions for base64 encoding/decoding as required by SDK rules
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function analyzeQuickCapture(text: string): Promise<QuickCaptureSuggestion[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following unstructured notes from a startup founder. Extract key decisions, risks, assets, tasks, PEOPLE, or EXPENSES mentioned. 
      If a person is mentioned as joining or owning something, extract it as a PERSON.
      If a cost, salary, or bill is mentioned, extract it as an EXPENSE.
      Be concise and precise.
      
      Notes:
      ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                description: "One of: DECISION, RISK, ASSET, TASK, PERSON, EXPENSE",
              },
              title: {
                type: Type.STRING,
                description: "Short descriptive title (e.g., 'New Hire: Ramesh' or 'AWS Outflow')",
              },
              content: {
                type: Type.STRING,
                description: "Detailed description. For expenses, include the numerical amount and frequency.",
              },
              confidence: {
                type: Type.NUMBER,
                description: "AI confidence score from 0 to 1",
              }
            },
            required: ["type", "title", "content", "confidence"]
          }
        }
      }
    });

    const result = JSON.parse(response.text || "[]");
    return result as QuickCaptureSuggestion[];
  } catch (error) {
    console.error("Gemini Quick Capture Error:", error);
    return [];
  }
}

/**
 * Iteratively structure speech text into Draft Cards using gemini-3-flash-preview as requested.
 */
export async function structureLiveTranscript(text: string): Promise<DraftCard[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an NLP engine for a Founder's OS. Convert this live transcript segment into structured "Draft Cards". 
      Categories: DECISION, TASK, RISK, ASSUMPTION, PERSON, EXPENSE.
      
      If the user says "Assign X to Person Y", create a PERSON card.
      If the user mentions a cost (e.g. "Google Workspace costs 4000 rupees"), create an EXPENSE card.
      If the user mentions a new team member, create a PERSON card.
      
      Transcript:
      "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              summary: { type: Type.STRING },
              details: { type: Type.STRING },
              confidence: { type: Type.NUMBER }
            },
            required: ["type", "summary", "details", "confidence"]
          }
        }
      }
    });

    const result = JSON.parse(response.text || "[]");
    return result.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      approved: false
    }));
  } catch (error) {
    console.error("Structuring Error:", error);
    return [];
  }
}

export interface LiveConnectionHandlers {
  onTranscription: (text: string) => void;
  onError: (errorMessage: string) => void;
}

/**
 * Establishes a Live API session for continuous audio transcription.
 * Uses gemini-2.5-flash-native-audio-preview-12-2025 as required for Live API.
 */
export async function startLiveTranscription(handlers: LiveConnectionHandlers) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    handlers.onError("System API Key is missing.");
    throw new Error("API Key missing");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err: any) {
    handlers.onError("Microphone access failed.");
    throw err;
  }

  const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
  
  if (inputAudioContext.state === 'suspended') {
    await inputAudioContext.resume();
  }

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      const s = Math.max(-1, Math.min(1, data[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks: {
      onopen: () => {
        const source = inputAudioContext.createMediaStreamSource(stream);
        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
          const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
          const pcmBlob = createBlob(inputData);
          sessionPromise.then((session) => {
            try {
              session.sendRealtimeInput({ media: pcmBlob });
            } catch (e) {}
          });
        };
        source.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);
      },
      onmessage: async (message: LiveServerMessage) => {
        if (message.serverContent?.inputTranscription) {
          handlers.onTranscription(message.serverContent.inputTranscription.text);
        }
      },
      onerror: (e) => {
        handlers.onError("Connection error.");
      },
    },
    config: {
      responseModalities: [Modality.AUDIO],
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      systemInstruction: "Transcribe founder speech focused on expenses, burn, and team management."
    },
  });

  return {
    stop: async () => {
      try {
        const session = await sessionPromise;
        session.close();
      } catch (e) {}
      stream.getTracks().forEach(track => track.stop());
      if (inputAudioContext.state !== 'closed') {
        await inputAudioContext.close();
      }
    }
  };
}
