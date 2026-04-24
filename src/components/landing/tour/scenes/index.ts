import { lazy } from 'react';
import SceneHero from './SceneHero';

const Scene1 = lazy(() => import('./Scene1'));
const Scene2 = lazy(() => import('./Scene2'));
const Scene3 = lazy(() => import('./Scene3'));
const Scene4 = lazy(() => import('./Scene4'));
const Scene5 = lazy(() => import('./Scene5'));
const SceneTestimonies = lazy(() => import('./SceneTestimonies'));
const PricingSection = lazy(() => import('./PricingSection'));

export const TOUR_SCENES = [
  SceneHero,
  Scene1,
  Scene2,
  Scene3,
  Scene4,
  Scene5,
  SceneTestimonies,
  PricingSection,
];
