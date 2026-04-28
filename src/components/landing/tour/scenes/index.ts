import { lazy, type ComponentType, type LazyExoticComponent } from "react";

import type { SceneComponentProps } from "./shared";
import SceneHero from "./SceneHero";

const Scene1 = lazy(() => import("./Scene1"));
const Scene2 = lazy(() => import("./Scene2"));
const Scene3 = lazy(() => import("./Scene3"));
const Scene4 = lazy(() => import("./Scene4"));
const Scene5 = lazy(() => import("./Scene5"));
const ScenePlatformDemo = lazy(() => import("./ScenePlatformDemo"));
const SceneTestimonies = lazy(() => import("./SceneTestimonies"));
const PricingSection = lazy(() => import("./PricingSection"));

type TourSceneComponent =
  | ComponentType<SceneComponentProps>
  | LazyExoticComponent<ComponentType<SceneComponentProps>>;

export type TourSceneDefinition = {
  id: string;
  Component: TourSceneComponent;
};

export const TOUR_SCENES: TourSceneDefinition[] = [
  { id: "scene-hero", Component: SceneHero },
  { id: "scene-1", Component: Scene1 },
  { id: "scene-2", Component: Scene2 },
  { id: "scene-3", Component: Scene3 },
  { id: "scene-4", Component: Scene4 },
  { id: "scene-5", Component: Scene5 },
  { id: "scene-platform-demo", Component: ScenePlatformDemo },
  { id: "scene-testimonies", Component: SceneTestimonies },
  { id: "pricing-section", Component: PricingSection },
];
