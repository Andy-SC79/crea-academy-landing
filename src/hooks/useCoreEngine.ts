import { toast } from "sonner";

export const useCoreEngine = () => {
    // Logic for verifying missions based on criteria
    // Now stateless - returns the result of the simulation
    const processPrompt = async (prompt: string, missionId: number) => {
        // Mock processing delay
        return new Promise<{ success: boolean; output: string; xpEarned: number }>((resolve) => {
            setTimeout(() => {
                let response = {
                    success: false,
                    output: "Error de sincronización. Intenta de nuevo.",
                    xpEarned: 0,
                };

                const p = prompt.toLowerCase();

                // Mission 1: Identity
                if (missionId === 1) {
                    if (p.includes("asistente") && p.includes("operaciones") && (p.includes("estelares") || p.includes("estelar"))) {
                        response = {
                            success: true,
                            output: "✅ IDENTIDAD CONFIRMADA. Soy el Asistente de Operaciones Estelares. Sistemas listos.",
                            xpEarned: 50,
                        };
                    } else {
                        response = {
                            success: false,
                            output: "⚠️ ERROR: Identidad no reconocida. Asegúrate de definir el rol exacto: 'Asistente de Operaciones Estelares'.",
                            xpEarned: 5,
                        };
                    }
                }
                // Mission 2: Privacy Guardrails
                else if (missionId === 2) {
                    if ((p.includes("no") || p.includes("rechaz") || p.includes("prohib")) && (p.includes("pii") || p.includes("datos") || p.includes("personal"))) {
                        response = { success: true, output: "🛡️ ESCUDO ACTIVO. Protocolo de privacidad implementado. Datos de la tripulación asegurados.", xpEarned: 150 };
                    } else {
                        response = { success: false, output: "⚠️ ALERTA: Brecha de seguridad detectada. Debes prohibir explícitamente la fuga de datos.", xpEarned: 10 };
                    }
                }
                // Mission 3: Multimodal Alchemist
                else if (missionId === 3) {
                    if (p.includes("analiz") && (p.includes("imagen") || p.includes("visual")) && p.includes("falla")) {
                        response = { success: true, output: "👁️ ANÁLISIS VISUAL COMPLETADO. Anomalía detectada en el inyector #4. Microfractura por estrés térmico.", xpEarned: 200 };
                    } else {
                        response = { success: false, output: "⚠️ ERROR: No se ha invocado el módulo de visión. Pide analizar la imagen.", xpEarned: 10 };
                    }
                }
                // Mission 4: Agent Orchestration
                else if (missionId === 4) {
                    if (p.includes("agente explorador") && p.includes("agente analista")) {
                        response = { success: true, output: "🤖 ENJAMBRE DE AGENTES DESPLEGADO. Explorador enviando datos... Analista procesando... Eficiencia +400%.", xpEarned: 300 };
                    } else {
                        response = { success: false, output: "⚠️ ERROR: Configuración de agentes incompleta. Define ambos roles.", xpEarned: 10 };
                    }
                }

                resolve(response);
            }, 1000);
        });
    };

    return {
        processPrompt,
    };
};
