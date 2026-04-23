/**
 * useTamboLive - Hook para conectar Tambo en el Laboratorio via Proxy
 * 
 * REFACTORIZADO (v2): Usa el Proxy de Cloud Run y soporta userName para personalización.
 */

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { GenAILiveClient } from '@/components/real-time/utils/genai-live-client';
import { AudioStreamer } from '@/components/real-time/utils/audio-streamer';
import { audioContext } from '@/components/real-time/utils/utils';
import { useTamboContext } from '@/hooks/useTamboContext';

export type InputMode = 'audio' | 'webcam' | 'screen';

export interface TamboState {
    isActive: boolean;
    isThinking: boolean;
    isSpeaking: boolean;
    inputMode: InputMode | null;
    lastText: string;
    error: string | null;
}

// URL del Proxy WebSocket en Cloud Run
const PROXY_URL = "wss://live-api-proxy-901824861497.us-east1.run.app/ws/live";

export interface UseTamboLiveOptions {
    userName?: string;
}

export const useTamboLive = (options: UseTamboLiveOptions = {}) => {
    const { userName = 'amigo' } = options;
    const { currentWorld } = useTamboContext();

    const [state, setState] = useState<TamboState>({
        isActive: false,
        isThinking: false,
        isSpeaking: false,
        inputMode: null,
        lastText: '',
        error: null
    });

    // Cliente que conecta al proxy (ahora con userName)
    const client = useMemo(
        () => new GenAILiveClient({ proxyUrl: PROXY_URL, userName }),
        [userName]
    );

    const audioStreamerRef = useRef<AudioStreamer | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const frameCaptureIntervalRef = useRef<number | null>(null);
    const isSessionActiveRef = useRef(false);
    const pendingInputModeRef = useRef<InputMode>('audio');
    const hasGreetedRef = useRef(false);

    // Configurar audio streamer para reproducción
    useEffect(() => {
        if (!audioStreamerRef.current) {
            audioContext({ id: "tambo-audio-out" }).then((audioCtx: AudioContext) => {
                audioStreamerRef.current = new AudioStreamer(audioCtx);
            });
        }
    }, []);

    // Configurar eventos del cliente
    useEffect(() => {
        const onOpen = () => {
            console.log("Tambo: Conectado al proxy");
            isSessionActiveRef.current = true;
            setState(s => ({ ...s, isActive: true, error: null }));

            // Saludo proactivo de Tambo - SIMPLIFICADO para baja latencia
            const inputMode = pendingInputModeRef.current;
            const isScreenSharing = inputMode === 'screen';
            const worldLabel = currentWorld ? `Mundo ${currentWorld}` : '';

            // Mensaje corto y directo para minimizar latencia
            let greetingMessage = '';
            if (currentWorld) {
                greetingMessage = isScreenSharing
                    ? `Saluda brevemente a ${userName}, menciona que estás en ${worldLabel} y que ya ves su pantalla. Ofrece ayuda con su misión.`
                    : `Saluda a ${userName}, menciona que estás en ${worldLabel} y pregunta en qué puedes ayudarle.`;
            } else {
                greetingMessage = `Saluda a ${userName} y pregunta qué quiere aprender hoy.`;
            }

            setTimeout(() => {
                if (isSessionActiveRef.current) {
                    if (hasGreetedRef.current) {
                        // Ya saludó - no enviar nada, continuar naturalmente
                        console.log(`[Tambo Live] Modo cambiado, continúa conversación`);
                    } else {
                        client.send([{ text: greetingMessage }]);
                        hasGreetedRef.current = true;
                        console.log(`[Tambo Live] Saludo enviado`);
                    }
                }
            }, 300);
        };

        const onClose = () => {
            console.log("Tambo: Desconectado del proxy");
            isSessionActiveRef.current = false;
            setState(s => ({ ...s, isActive: false, isSpeaking: false, isThinking: false }));
        };

        const onError = (error: ErrorEvent) => {
            console.error("Tambo Error:", error);
            setState(s => ({ ...s, error: error.message || 'Error de conexión' }));
        };

        const onAudio = (data: ArrayBuffer) => {
            setState(s => ({ ...s, isSpeaking: true }));
            audioStreamerRef.current?.addPCM16(new Uint8Array(data));
        };

        const onTurnComplete = () => {
            setState(s => ({ ...s, isThinking: false, isSpeaking: false }));
        };

        const onInterrupted = () => {
            audioStreamerRef.current?.stop();
            setState(s => ({ ...s, isSpeaking: false }));
        };

        client
            .on("open", onOpen)
            .on("close", onClose)
            .on("error", onError)
            .on("audio", onAudio)
            .on("turncomplete", onTurnComplete)
            .on("interrupted", onInterrupted);

        return () => {
            client
                .off("open", onOpen)
                .off("close", onClose)
                .off("error", onError)
                .off("audio", onAudio)
                .off("turncomplete", onTurnComplete)
                .off("interrupted", onInterrupted)
                .disconnect();
        };
    }, [client, userName, currentWorld]);

    const disconnect = useCallback(() => {
        isSessionActiveRef.current = false;

        if (frameCaptureIntervalRef.current) {
            clearInterval(frameCaptureIntervalRef.current);
            frameCaptureIntervalRef.current = null;
        }

        client.disconnect();

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(t => t.stop());
            mediaStreamRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }

        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        audioStreamerRef.current?.stop();

        setState(s => ({
            ...s,
            isActive: false,
            isSpeaking: false,
            isThinking: false,
            inputMode: null
        }));
    }, [client]);

    const captureAndSendFrame = useCallback((videoElement: HTMLVideoElement) => {
        if (!isSessionActiveRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const base64Str = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];

        client.sendRealtimeInput([{
            mimeType: 'image/jpeg',
            data: base64Str
        }]);
    }, [client]);

    const setupStreams = useCallback(async (mode: InputMode) => {
        try {
            let stream: MediaStream;

            if (mode === 'screen') {
                stream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: { echoCancellation: true, noiseSuppression: true }
                });

                const audioTracks = stream.getAudioTracks();
                if (audioTracks.length === 0) {
                    try {
                        const micStream = await navigator.mediaDevices.getUserMedia({
                            audio: { echoCancellation: true, noiseSuppression: true }
                        });
                        micStream.getAudioTracks().forEach(track => stream.addTrack(track));
                    } catch (micErr) {
                        console.warn("No se pudo obtener micrófono:", micErr);
                    }
                }
            } else {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
                    video: mode === 'webcam'
                });
            }

            mediaStreamRef.current = stream;

            // Configurar captura de audio
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length > 0) {
                const audioStream = new MediaStream(audioTracks);
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                audioContextRef.current = audioCtx;

                if (audioCtx.state === 'suspended') {
                    await audioCtx.resume();
                }

                const source = audioCtx.createMediaStreamSource(audioStream);
                const processor = audioCtx.createScriptProcessor(4096, 1, 1);
                processorRef.current = processor;

                processor.onaudioprocess = (e) => {
                    if (!isSessionActiveRef.current) return;
                    const inputData = e.inputBuffer.getChannelData(0);
                    const pcmData = new Int16Array(inputData.length);
                    for (let i = 0; i < inputData.length; i++) {
                        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
                    }
                    const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
                    client.sendRealtimeInput([{
                        data: base64,
                        mimeType: 'audio/pcm;rate=16000'
                    }]);
                };

                source.connect(processor);
                processor.connect(audioCtx.destination);
            }

            // Configurar captura de video
            if (mode === 'webcam' || mode === 'screen') {
                const videoTracks = stream.getVideoTracks();
                if (videoTracks.length > 0) {
                    const videoElement = document.createElement('video');
                    videoElement.srcObject = stream;
                    videoElement.muted = true;
                    await videoElement.play();

                    frameCaptureIntervalRef.current = window.setInterval(() => {
                        captureAndSendFrame(videoElement);
                    }, 2000);
                }
            }

        } catch (err: any) {
            console.error("Stream setup error:", err);
            setState(s => ({ ...s, error: `Error de stream: ${err.message}` }));
            disconnect();
        }
    }, [client, disconnect, captureAndSendFrame]);

    const connect = useCallback(async (mode: InputMode = 'audio') => {
        try {
            pendingInputModeRef.current = mode; // Track mode before connection
            setState(s => ({ ...s, inputMode: mode, error: null }));

            // Configuración con saludo personalizado de Tambo
            // NOTA: Esta config se envía al cliente, pero como usamos el Proxy,
            // el cliente se conectará a /ws/live?userName=... y el proxy usará su config interna
            // con el nombre inyectado.

            const connected = await client.connect(
                "models/gemini-2.5-flash-native-audio-preview-12-2025",
                {
                    // config vacío porque el proxy lo maneja
                }
            );

            if (connected) {
                await setupStreams(mode);
            } else {
                setState(s => ({ ...s, error: 'No se pudo conectar al proxy' }));
            }
        } catch (err: any) {
            console.error("Connection error:", err);
            setState(s => ({ ...s, error: err.message }));
        }
    }, [client, userName, setupStreams]);

    return {
        ...state,
        connect,
        disconnect
    };
};
