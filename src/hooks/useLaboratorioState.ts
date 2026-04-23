import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface LaboratorioState {
    xp: number;
    level: number;
    tokens: number;
    unlockedMissions: number[];
}

const INITIAL_STATE: LaboratorioState = {
    xp: 0,
    level: 1,
    tokens: 1000,
    unlockedMissions: [1],
};

export const useLaboratorioState = () => {
    const [state, setState] = useState<LaboratorioState>(() => {
        const saved = localStorage.getItem("laboratorio_state");
        return saved ? JSON.parse(saved) : INITIAL_STATE;
    });

    useEffect(() => {
        localStorage.setItem("laboratorio_state", JSON.stringify(state));
    }, [state]);

    const calculateLevel = (xp: number) => {
        return Math.floor(xp / 100) + 1;
    };

    const addXp = (amount: number, currentMissionId: number) => {
        setState((prev) => {
            const newXp = prev.xp + amount;
            const newLevel = calculateLevel(newXp);

            // Unlock next mission logically
            const nextMission = currentMissionId + 1;
            const newUnlocked = prev.unlockedMissions.includes(nextMission)
                ? prev.unlockedMissions
                : [...prev.unlockedMissions, nextMission];

            if (newLevel > prev.level) {
                toast.success(`¡NIVEL ASCENDIDO! Acceso de Nivel ${newLevel} concedido.`);
            }

            return {
                ...prev,
                xp: newXp,
                level: newLevel,
                unlockedMissions: newUnlocked,
            };
        });
    };

    const consumeTokens = (amount: number) => {
        if (state.tokens < amount) {
            toast.error("Energía insuficiente. Recarga tokens.");
            return false;
        }
        setState(prev => ({ ...prev, tokens: prev.tokens - amount }));
        return true;
    };

    // Helper to check if a mission is locked
    // A mission is UNlocked if its ID is <= the highest unlocked mission
    const isMissionLocked = (missionId: number) => {
        const highestUnlocked = Math.max(...state.unlockedMissions, 1);
        return missionId > highestUnlocked;
    };

    const resetProgress = () => {
        setState(INITIAL_STATE);
        toast.info("Progreso reiniciado.");
    };

    return {
        state,
        addXp,
        consumeTokens,
        isMissionLocked,
        resetProgress
    };
};
