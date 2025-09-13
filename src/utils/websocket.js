import { io } from "socket.io-client";

// WebSocket configuration
import { getBaseUrl } from './api'; // adjust path if needed

const getWebSocketConfig = () => {
  const socketUrl = import.meta.env.VITE_WS_URL;
  console.log('🔌 [WS-CONFIG] Using WebSocket URL:', socketUrl);

  return {
    url: socketUrl,
    options: {
      transports: ['websocket'],
      path: '/socket.io',
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      maxReconnectionDelay: 5000,
      autoConnect: true,
      forceNew: true,
      secure: socketUrl.startsWith('wss://'),
      rejectUnauthorized: false
    }
  };
};


// Alternative method for trying specific namespaces
export const createWebSocketConnectionWithNamespace = (namespace = '/', eventHandlers = {}) => {
  const { url, options } = getWebSocketConfig();
  
  console.log(`🔌 [WS-NS] Creating WebSocket connection to namespace: ${namespace}`);
  
  const connectionOptions = {
    ...options,
    path: '/socket.io',
    transports: ['websocket'],
    secure: url.startsWith('wss://'),
    rejectUnauthorized: false,
    query: {
      token: localStorage.getItem('token'),
      testId: localStorage.getItem('testId'),
      userId: localStorage.getItem('userId'),
      client: 'web-voice-test',
      namespace: namespace
    }
  };
  
  // Create connection with specific namespace
  const socket = io(`${url}${namespace}`, connectionOptions);
  
  // Set up event handlers (same as main function)
  setupSocketEvents(socket, eventHandlers);
  
  return socket;
};

// Common event setup function
const setupSocketEvents = (socket, eventHandlers) => {
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
    console.error('❌ [WS] Error details:', {
      message: error.message,
      description: error.description,
      context: error.context
    });
    
    if (error.message.includes('Invalid namespace')) {
      console.error('⚠️ [WS] Namespace issue detected.');
      console.error('⚠️ [WS] Try using createWebSocketConnectionWithNamespace() with specific namespaces:');
      console.error('⚠️ [WS] - "/voice-test"');
      console.error('⚠️ [WS] - "/exam"');
      console.error('⚠️ [WS] - "/audio"');
    }
    
    if (eventHandlers.onError) eventHandlers.onError(error);
  });
  
  // Other event handlers...
  socket.on('reconnect', (attemptNumber) => {
    console.log(`🔄 [WS] Reconnected after ${attemptNumber} attempts`);
    if (eventHandlers.onReconnect) eventHandlers.onReconnect(attemptNumber);
  });
  
  socket.on('reconnect_error', (error) => {
    console.error('❌ [WS] Reconnection error:', error);
    if (eventHandlers.onReconnectError) eventHandlers.onReconnectError(error);
  });
};



// Create WebSocket connection with enhanced error handling
export const createWebSocketConnection = (eventHandlers = {}) => {
  const { url, options } = getWebSocketConfig();
  
  console.log('🔌 [WS] Creating WebSocket connection to:', url);
  
  // Enhanced connection options with authentication and fallback support
  const connectionOptions = {
    ...options,
    path: '/socket.io',   // ensure path is correct
    transports: ['websocket'], // force websocket
    secure: url.startsWith('wss://'), // enable WSS
    rejectUnauthorized: false, // ⚠️ optional for self-signed certs
    // Add authentication and context information
    query: {
      token: localStorage.getItem('token'),
      testId: localStorage.getItem('testId'),
      userId: localStorage.getItem('userId'),
      client: 'web-voice-test'
    },
    // Additional connection settings for better reliability
    forceNew: true,
    timeout: 15000,
    reconnectionDelayMax: 10000
  };
  
  const socket = io(url, connectionOptions);

  // Use the shared event setup function
  setupSocketEvents(socket, eventHandlers);
  
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
           // Convert Int16Array to ArrayBuffer for socket.io transmission
           socket.emit("audio-data", int16Array.buffer);
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

export default {
  createWebSocketConnection,
  createWebSocketConnectionWithNamespace,
  createAudioStreamer
};
