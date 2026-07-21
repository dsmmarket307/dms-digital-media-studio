import { createClient } from "@/lib/supabase/server";
import Script from "next/script";

type Props = { children: React.ReactNode; params: Promise<{ id: string }> };

export default async function DemoLayout({ children, params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: site } = await supabase.from("generated_websites").select("meta_pixel_id").eq("id", id).maybeSingle();

  return (
    <>
      {site?.meta_pixel_id && (
        <>
          <Script id="meta-pixel-base" strategy="afterInteractive">
            {
              "window.dmsPixelQueue = window.dmsPixelQueue || []; window.fbTrack = window.fbTrack || function(ev, params){ if (window.fbq) { window.fbq(" + String.fromCharCode(39) + "track" + String.fromCharCode(39) + ", ev, params || {}); } else { window.dmsPixelQueue.push([ev, params]); } };" +
              "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=true;n.version=" +
              String.fromCharCode(39) + "2.0" + String.fromCharCode(39) + ";n.queue=[];t=b.createElement(e);t.async=true;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document," +
              String.fromCharCode(39) + "script" + String.fromCharCode(39) + "," +
              String.fromCharCode(39) + "https://connect.facebook.net/en_US/fbevents.js" + String.fromCharCode(39) + ");" +
              "fbq(" + String.fromCharCode(39) + "init" + String.fromCharCode(39) + "," + String.fromCharCode(39) + site.meta_pixel_id + String.fromCharCode(39) + ");" +
              "fbq(" + String.fromCharCode(39) + "track" + String.fromCharCode(39) + "," + String.fromCharCode(39) + "PageView" + String.fromCharCode(39) + ");" +
              "(window.dmsPixelQueue||[]).forEach(function(a){ window.fbq(" + String.fromCharCode(39) + "track" + String.fromCharCode(39) + ", a[0], a[1] || {}); }); window.dmsPixelQueue = [];"
            }
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={"https://www.facebook.com/tr?id=" + site.meta_pixel_id + "&ev=PageView&noscript=1"}
              alt=""
            />
          </noscript>
        </>
      )}
      {children}
    </>
  );
}