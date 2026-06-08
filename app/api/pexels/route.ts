import { NextRequest, NextResponse } from "next/server";

const CATEGORIA_KEYWORDS: Record<string, string> = {
  "Landing Page": "business professional office",
  "Sitio Corporativo": "corporate business team",
  "Tienda Online": "shopping ecommerce products",
  "Agencia": "creative agency team design",
  "Restaurante": "restaurant food delicious",
  "Inmobiliaria": "real estate house luxury home",
  "Consultorio": "medical doctor clinic health",
  "Portafolio": "creative portfolio design art",
  "Salon de Belleza": "beauty salon hair makeup",
  "Spa": "spa wellness relaxation massage",
  "Abogados": "law office lawyer justice",
  "Contaduria": "accounting finance business",
  "Medicos": "medical doctor hospital health",
  "Gimnasio": "gym fitness workout training",
  "Fotografia": "photography camera professional",
  "Tecnologia": "technology digital innovation",
  "Turismo": "travel tourism adventure nature",
  "Veterinaria": "veterinary animals pets",
  "Eventos": "events wedding celebration party",
  "Consultoria": "consulting business strategy",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoria = searchParams.get("categoria") ?? "business";
  const query = CATEGORIA_KEYWORDS[categoria] ?? categoria;

  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape`,
    { headers: { Authorization: process.env.PEXELS_API_KEY! } }
  );

  const data = await res.json();
  const imagenes = data.photos?.map((p: any) => ({
    url: p.src.large,
    thumb: p.src.medium,
    photographer: p.photographer,
  })) ?? [];

  return NextResponse.json({ imagenes });
}