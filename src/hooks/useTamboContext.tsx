import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Modos de operación del asistente Tambo
 */
export type TamboMode = 'CONCIERGE' | 'TUTOR' | 'CO_PILOT' | 'ONBOARDING';

/**
 * Datos contextuales extraídos de la URL
 */
export interface TamboContextData {
    courseId?: string;
    lessonId?: string;
    missionId?: string;
}

/**
 * Personalización del agente
 */
export interface AgentPersonalization {
    agent_name: string;
    agent_voice: string;
    user_avatar_animal: string;
    user_gender: string;
    preferred_mode: TamboMode;
    learning_style: {
        visual: number;
        auditory: number;
        kinesthetic: number;
    };
}

/**
 * Valor de retorno del hook useTamboContext
 */
export interface UseTamboContextReturn {
    // Estado derivado de la URL (Lectura)
    mode: TamboMode;
    contextData: TamboContextData;
    modeLabel: string;
    modeDescription: string;

    // Estado global mutable
    currentWorld: number | string | null;
    setCurrentWorld: (world: number | string | null) => void;

    // Personalización del agente
    personalization: AgentPersonalization | null;
    loadingPersonalization: boolean;
    refreshPersonalization: () => Promise<void>;
}

/**
 * Configuración de etiquetas y descripciones por modo
 */
const MODE_CONFIG: Record<TamboMode, { label: string; description: string }> = {
    CONCIERGE: {
        label: 'Conserje',
        description: 'Gestión de tareas, eventos y navegación general de la plataforma'
    },
    TUTOR: {
        label: 'Tutor',
        description: 'Modo pedagógico y socrático para el aprendizaje'
    },
    CO_PILOT: {
        label: 'Co-Piloto',
        description: 'Asistente técnico para debugging y desarrollo'
    },
    ONBOARDING: {
        label: 'Onboarding',
        description: 'Conociendo al estudiante — configuración inicial del mentor'
    }
};

/**
 * Patrones de rutas para determinar el modo de Tambo
 */
const ROUTE_PATTERNS = {
    ONBOARDING: [
        /^\/onboarding$/,  // /onboarding
    ],
    TUTOR: [
        /^\/cursos\/([^/]+)(?:\/ver)?$/, // /cursos/:id o /cursos/:id/ver
        /^\/cursos\/([^/]+)\/examen$/,   // /cursos/:id/examen
        /^\/workspace\/([^/]+)$/,        // /workspace/:routeId o /workspace/new
    ],
    CO_PILOT: [
        /^\/laboratorio(?:\/sandbox\/([^/]+))?$/, // /laboratorio o /laboratorio/sandbox/:missionId
        /^\/real-time$/,                           // /real-time
    ],
    CONCIERGE: [
        /^\/$/,           // Página principal
        /^\/dashboard$/, // Dashboard
        /^\/cursos$/,    // Lista de cursos (sin ID específico)
        /^\/bootcamps/,  // Bootcamps
        /^\/badges/,     // Insignias
    ]
};

// Crear el Contexto
const TamboContext = createContext<UseTamboContextReturn | undefined>(undefined);

/**
 * Provider para el contexto de Tambo.
 * Maneja tanto la detección automática de modo basada en URL como
 * el estado compartido manual (como currentWorld).
 */
export const TamboProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const location = useLocation();
    const { user } = useAuth();

    // Estado mutable
    const [currentWorld, setCurrentWorld] = useState<number | string | null>(null);
    const [personalization, setPersonalization] = useState<AgentPersonalization | null>(null);
    const [loadingPersonalization, setLoadingPersonalization] = useState(true);

    // Lógica de detección de URL (Memoizada)
    const derivedState = useMemo(() => {
        const pathname = location.pathname;
        const contextData: TamboContextData = {};
        let detectedMode: TamboMode = 'CONCIERGE'; // Modo por defecto

        // Check ONBOARDING first
        for (const pattern of ROUTE_PATTERNS.ONBOARDING) {
            if (pathname.match(pattern)) {
                detectedMode = 'ONBOARDING';
                break;
            }
        }

        // Verificar patrones de TUTOR
        if (detectedMode === 'CONCIERGE') {
            for (const pattern of ROUTE_PATTERNS.TUTOR) {
                const match = pathname.match(pattern);
                if (match) {
                    detectedMode = 'TUTOR';
                    contextData.courseId = match[1];
                    break;
                }
            }
        }

        // Verificar patrones de CO_PILOT si no es TUTOR
        if (detectedMode === 'CONCIERGE') {
            for (const pattern of ROUTE_PATTERNS.CO_PILOT) {
                const match = pathname.match(pattern);
                if (match) {
                    detectedMode = 'CO_PILOT';
                    // Extraer missionId del sandbox si existe
                    if (match[1]) {
                        contextData.missionId = match[1];
                    }
                    break;
                }
            }
        }

        const config = MODE_CONFIG[detectedMode];

        return {
            mode: detectedMode,
            contextData,
            modeLabel: config.label,
            modeDescription: config.description
        };
    }, [location.pathname]);

    // Función para cargar personalización
    const loadPersonalization = async () => {
        if (!user) {
            setLoadingPersonalization(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('agent_personalization')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) {
                console.error('Error loading personalization:', error);
                setPersonalization(null);
            } else {
                setPersonalization(data as AgentPersonalization);
            }
        } catch (err) {
            console.error('Failed to load personalization:', err);
        } finally {
            setLoadingPersonalization(false);
        }
    };

    // Cargar personalización al montar o cuando cambia el usuario
    useEffect(() => {
        loadPersonalization();
    }, [user?.id]);

    const value: UseTamboContextReturn = {
        ...derivedState,
        currentWorld,
        setCurrentWorld,
        personalization,
        loadingPersonalization,
        refreshPersonalization: loadPersonalization,
    };

    return (
        <TamboContext.Provider value={value}>
            {children}
        </TamboContext.Provider>
    );
};

/**
 * Hook para consumir el contexto de Tambo
 */
export const useTamboContext = (): UseTamboContextReturn => {
    const context = useContext(TamboContext);
    if (context === undefined) {
        throw new Error('useTamboContext must be used within a TamboProvider');
    }
    return context;
};

export default useTamboContext;
