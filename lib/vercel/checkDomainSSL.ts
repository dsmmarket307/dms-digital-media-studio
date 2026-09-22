export type SslCheckResult = {
  verified: boolean;
  misconfigured: boolean;
  sslStatus: "active" | "pending" | "error";
};

export async function checkDomainSSL(domain: string): Promise<SslCheckResult> {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) {
    throw new Error("Faltan VERCEL_API_TOKEN o VERCEL_PROJECT_ID");
  }

  const [domainRes, configRes] = await Promise.all([
    fetch(`https://api.vercel.com/v9/projects/${projectId}/domains/${domain}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`https://api.vercel.com/v6/domains/${domain}/config`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);

  if (!domainRes.ok) {
    return { verified: false, misconfigured: true, sslStatus: "error" };
  }

  const domainData = await domainRes.json();
  const configData = configRes.ok ? await configRes.json() : { misconfigured: true };

  const verified = Boolean(domainData?.verified);
  const misconfigured = Boolean(configData?.misconfigured);

  let sslStatus: "active" | "pending" | "error" = "pending";
  if (verified && !misconfigured) sslStatus = "active";
  else if (verified && misconfigured) sslStatus = "error";

  return { verified, misconfigured, sslStatus };
}
