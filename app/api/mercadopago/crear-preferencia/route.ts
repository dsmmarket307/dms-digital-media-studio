import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { package_name, package_slug, price, customer_name, customer_email, customer_phone } = body;

    const siteUrl = process.env.NEXT_PUBLIC_URL || "https://dms-digital-media-studio.vercel.app";

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: package_slug,
            title: package_name,
            quantity: 1,
            unit_price: Number(price),
            currency_id: "COP",
          },
        ],
        back_urls: {
          success: siteUrl + "/checkout/success",
          failure: siteUrl + "/checkout/failure",
          pending: siteUrl + "/checkout/success",
        },
        notification_url: siteUrl + "/api/mercadopago/webhook",
        metadata: { package_slug, package_name, customer_name, customer_email, customer_phone, price },
      },
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error: any) {
    console.error("MP Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}