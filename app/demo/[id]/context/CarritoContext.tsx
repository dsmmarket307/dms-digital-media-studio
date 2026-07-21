"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type ItemCarrito = {
  productoIndex: number;
  nombre: string;
  precio: string;
  imagen: string;
  talla: string;
  color: string;
  cantidad: number;
};

type CarritoContextType = {
  items: ItemCarrito[];
  agregar: (item: ItemCarrito) => void;
  quitar: (index: number) => void;
  limpiar: () => void;
  total: number;
  abierto: boolean;
  setAbierto: (v: boolean) => void;
};

const CarritoContext = createContext<CarritoContextType | null>(null);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [abierto, setAbierto] = useState(false);

  const agregar = (item: ItemCarrito) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.productoIndex === item.productoIndex && i.talla === item.talla && i.color === item.color);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].cantidad += item.cantidad;
        return next;
      }
      return [...prev, item];
    });
    setAbierto(true);
    if (typeof window !== "undefined" && (window as any).fbq) {
      const num = parseFloat(item.precio.replace(/[^0-9.]/g, ""));
      (window as any).fbq("track", "AddToCart", {
        content_name: item.nombre,
        value: isNaN(num) ? 0 : num * item.cantidad,
        currency: "COP",
      });
    }
  };

  const quitar = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));
  const limpiar = () => setItems([]);
  const total = items.reduce((a, i) => {
    const num = parseFloat(i.precio.replace(/[^0-9.]/g, ""));
    return a + (isNaN(num) ? 0 : num * i.cantidad);
  }, 0);

  return (
    <CarritoContext.Provider value={{ items, agregar, quitar, limpiar, total, abierto, setAbierto }}>
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de CarritoProvider");
  return ctx;
}