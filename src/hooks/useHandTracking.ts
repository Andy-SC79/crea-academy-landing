import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { loadExternalScript } from '@/lib/loadExternalScript';

// Declaración global para las librerías cargadas vía CDN
declare global {
    interface Window {
        Hands: any;
        Camera: any;
    }
}

// Definición local mínima para evitar importar de @mediapipe/hands
interface Results {
    multiHandLandmarks: { x: number; y: number; z: number }[][];
    image: any;
}

export interface HandData {
    x: number;
    y: number;
    thumbX: number;
    thumbY: number;
    isPinching: boolean;
    isActive: boolean;
    error: string | null;
}

export const useHandTracking = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const handsRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);
    const [handData, setHandData] = useState<HandData>({
        x: 0,
        y: 0,
        thumbX: 0,
        thumbY: 0,
        isPinching: false,
        isActive: false,
        error: null
    });

    const onResults = useCallback((results: Results) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];

            // Pointer is based on index finger tip (landmark 8)
            const pointer = landmarks[8];
            const thumb = landmarks[4];

            // Calculate distance for pinch gesture (thumb tip to index tip)
            const distance = Math.sqrt(
                Math.pow(pointer.x - thumb.x, 2) +
                Math.pow(pointer.y - thumb.y, 2)
            );

            // Mapping to screen (MediaPipe is 0-1)
            // We invert X because the camera is usually mirrored
            setHandData({
                x: 1 - pointer.x,
                y: pointer.y,
                thumbX: 1 - thumb.x,
                thumbY: thumb.y,
                isPinching: distance < 0.05,
                isActive: true,
                error: null
            });
        } else {
            setHandData(prev => ({ ...prev, isActive: false }));
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const initializeHandTracking = async () => {
            try {
                console.log('[HandTracking] Initializing MediaPipe Hands...');

                await loadExternalScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js', {
                    id: 'mediapipe-camera-utils',
                    crossOrigin: 'anonymous',
                    readyCheck: () => typeof window.Camera !== 'undefined',
                });
                await loadExternalScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js', {
                    id: 'mediapipe-hands',
                    crossOrigin: 'anonymous',
                    readyCheck: () => typeof window.Hands !== 'undefined',
                });

                // Usar window.Hands en lugar de import
                const hands = new window.Hands({
                    locateFile: (file: string) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                    }
                });

                hands.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5
                });

                hands.onResults(onResults);
                handsRef.current = hands;

                // We create a hidden video element
                const videoElement = document.createElement('video');
                videoElement.style.display = 'none';
                videoElement.setAttribute('playsinline', ''); // Importante para iOS
                videoElement.setAttribute('autoplay', '');
                videoRef.current = videoElement;

                console.log('[HandTracking] Creating camera...');
                // Usar window.Camera en lugar de import
                const camera = new window.Camera(videoElement, {
                    onFrame: async () => {
                        if (handsRef.current && mounted) {
                            await handsRef.current.send({ image: videoElement });
                        }
                    },
                    width: 640,
                    height: 480
                });

                cameraRef.current = camera;

                console.log('[HandTracking] Starting camera...');
                await camera.start();
                console.log('[HandTracking] Camera started successfully!');

                if (mounted) {
                    setHandData(prev => ({ ...prev, error: null }));
                }

            } catch (error) {
                console.error('[HandTracking] Error initializing:', error);

                let errorMessage = 'Error desconocido al inicializar la cámara';

                if (error instanceof Error) {
                    if (error.name === 'NotAllowedError') {
                        errorMessage = 'Permiso de cámara denegado. Por favor, permite el acceso a la cámara.';
                    } else if (error.name === 'NotFoundError') {
                        errorMessage = 'No se encontró ninguna cámara. Por favor, conecta una cámara.';
                    } else if (error.name === 'NotReadableError') {
                        errorMessage = 'La cámara está siendo usada por otra aplicación.';
                    } else if (error.message.includes('constructor') || error.message.includes('not a function')) {
                        errorMessage = 'Error interno de librerías. Por favor, recarga la página.';
                    } else if (error.message.includes('Failed to load external script') || error.message.includes('Timed out loading external script')) {
                        errorMessage = 'No fue posible cargar MediaPipe. Verifica tu conexión a internet.';
                    } else {
                        errorMessage = error.message;
                    }
                }

                if (mounted) {
                    setHandData(prev => ({ ...prev, error: errorMessage, isActive: false }));
                }
            }
        };

        initializeHandTracking();

        return () => {
            mounted = false;
            console.log('[HandTracking] Cleaning up...');

            if (cameraRef.current) {
                // MediaPipe Camera utils stop method
                if (typeof cameraRef.current.stop === 'function') {
                    cameraRef.current.stop();
                }
                cameraRef.current = null;
            }

            if (handsRef.current) {
                if (typeof handsRef.current.close === 'function') {
                    handsRef.current.close();
                }
                handsRef.current = null;
            }
        };
    }, [onResults]);

    return useMemo(() => ({
        ...handData,
        videoRef: videoRef.current
    }), [handData]);
};
