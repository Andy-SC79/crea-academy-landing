import type { ComponentType } from "react";

import Scene1 from "./Scene1";
import Scene2 from "./Scene2";
import Scene3 from "./Scene3";
import Scene4 from "./Scene4";
import Scene5 from "./Scene5";
import type { SceneComponentProps } from "./shared";
import PricingSection from "./PricingSection";

export type TourSceneDefinition = {
  id: string;
  label: string;
  Component: ComponentType<SceneComponentProps>;
};

export const TOUR_SCENES: TourSceneDefinition[] = [
  { id: "scene-1", label: "The Disruption", Component: Scene1 },
  { id: "scene-2", label: "The Revelation", Component: Scene2 },
  { id: "scene-3", label: "Corporate Arsenal", Component: Scene3 },
  { id: "scene-4", label: "Action & Creation", Component: Scene4 },
  { id: "scene-5", label: "Gamification Matrix", Component: Scene5 },
  { id: "scene-7", label: "Pricing & Conversion", Component: PricingSection },
];
