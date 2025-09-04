import { io } from "socket.io-client";

// WebSocket configuration
const getWebSocketConfig = () => {
  // Use environment variable with fallback
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const socketUrl = baseUrl.replace('/api', '');
  
  const config = {
    url: socketUrl,
    options: {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      maxReconnectionDelay: 5000,
      autoConnect: true,
      forceNew: false
    }
  };
  
  console.log('🔌 [WS-CONFIG] WebSocket configuration:', config);
  return config;
};

// Create WebSocket connection with enhanced error handling
export const createWebSocketConnection = (eventHandlers = {}) => {
  const { url, options } = getWebSocketConfig();
  
  console.log('🔌 [WS] Creating WebSocket connection to:', url);
  const socket = io(url, options);
  
  // Enhanced connection events
  socket.on('connect', () => {
    console.log('✅ [WS] Connected to voice test server');
    if (eventHandlers.onConnect) eventHandlers.onConnect();
  });
  
  socket.on('disconnect', (reason) => {
    console.log('🔴 [WS] Disconnected:', reason);
    if (eventHandlers.onDisconnect) eventHandlers.onDisconnect(reason);
  });
  
  socket.on('connect_error', (error) => {
    console.error('❌ [WS] Connection error:', error);
    if (eventHandlers.onError) eventHandlers.onError(error);
  });
  
  socket.on('reconnect', (attemptNumber) => {
    console.log(`🔄 [WS] Reconnected after ${attemptNumber} attempts`);
    if (eventHandlers.onReconnect) eventHandlers.onReconnect(attemptNumber);
  });
  
  socket.on('reconnect_error', (error) => {
    console.error('❌ [WS] Reconnection error:', error);
    if (eventHandlers.onReconnectError) eventHandlers.onReconnectError(error);
  });
  
  return socket;
};

// Enhanced audio streaming utility
export const createAudioStreamer = (socket) => {
  let audioContext = null;
  let mediaStream = null;
  let processor = null;
  let source = null;
  let isStreaming = false;
  
  const startAudioStream = async (voiceTestActive = true) => {
    if (isStreaming) {
      console.log('🎤 [AUDIO-STREAM] Already streaming');
      return;
    }
    
    if (!voiceTestActive) {
      console.log('⚠️ [AUDIO-STREAM] Voice test not active, cannot start audio stream');
      return;
    }
    
    try {
      console.log('🎤 [AUDIO-STREAM] Starting audio stream...');
      
      // Request microphone access with optimized settings
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Create AudioContext with correct sample rate
      audioContext = new AudioContext({ sampleRate: 16000 });
      source = audioContext.createMediaStreamSource(mediaStream);
      processor = audioContext.createScriptProcessor(1024, 1, 1);
      
      // Enhanced audio processing for Deepgram (16kHz, 16-bit PCM)
      processor.onaudioprocess = (event) => {
        if (socket?.connected && isStreaming) {
          const inputData = event.inputBuffer.getChannelData(0);
          
          // Resample from 48kHz to 16kHz (3:1 ratio)
          const resampledLength = Math.ceil(inputData.length / 3);
          const resampledData = new Float32Array(resampledLength);
          for (let i = 0, j = 0; i < inputData.length && j < resampledLength; i += 3, j++) {
            resampledData[j] = inputData[i];
          }
          
          // Convert to 16-bit PCM for Deepgram
          const int16Array = new Int16Array(resampledData.length);
          for (let i = 0; i < resampledData.length; i++) {
            int16Array[i] = Math.max(
              -32768,
              Math.min(32767, resampledData[i] * 32768)
            );
          }
          
          // Send with metadata
          if (socket.connected) {
           socket.emit("audio-data", Buffer.from(int16Array.buffer));

          }
        }
      };
      
      // Connect audio graph
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      isStreaming = true;
      console.log('🎤 [AUDIO-STREAM] Audio stream started successfully');
      
    } catch (error) {
      console.error('❌ [AUDIO-STREAM] Failed to start audio stream:', error);
      stopAudioStream();
      throw error;
    }
  };
  
  const stopAudioStream = () => {
    console.log('🛑 [AUDIO-STREAM] Stopping audio stream...');
    
    isStreaming = false;
    
    if (processor) {
      processor.disconnect();
      processor = null;
    }
    
    if (source) {
      source.disconnect();
      source = null;
    }
    
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
      audioContext = null;
    }
    
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    
    console.log('🛑 [AUDIO-STREAM] Audio stream stopped');
  };
  
  const isAudioStreaming = () => isStreaming;
  
  return {
    startAudioStream,
    stopAudioStream,
    isAudioStreaming
  };
};

export default { createWebSocketConnection, createAudioStreamer };
