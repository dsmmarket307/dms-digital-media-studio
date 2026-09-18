import React from "react";
import ServiciosGrid from "./ServiciosGrid";
import ServiciosCards from "./ServiciosCards";
import ServiciosEditorial from "./ServiciosEditorial";
import Testimonios from "./Testimonios";

export type SeccionProps = {
  c: any;
  pr: string;
  sc?: string;
  ci: any;
  imagenes: string[];
  ParallaxImage: any;
};

type ComponenteSeccion = (props: SeccionProps) => React.ReactElement | null;

export const sectionRegistry: Record<string, { default: string; variants: Record<string, ComponenteSeccion> }> = {
  servicios: {
    default: "grid",
    variants: {
      grid: ServiciosGrid,
      cards: ServiciosCards,
      editorial: ServiciosEditorial,
    },
  },
  testimonios: {
    default: "clasico",
    variants: {
      clasico: Testimonios,
    },
  },
};

export function getSeccionComponente(tipo: string, variante?: string): ComponenteSeccion | null {
  const entry = sectionRegistry[tipo];
  if (!entry) return null;
  const key = variante && entry.variants[variante] ? variante : entry.default;
  return entry.variants[key] ?? null;
}




