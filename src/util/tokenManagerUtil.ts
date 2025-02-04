//--./src/util/tokenManagerUtil.ts--
const tokenConfig = {
  path: "/",
} as const;

const cookies = {
  access: "accessToken",
  refresh: "refreshToken",
} as const;

function parseCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

export function getAccessToken(): string | undefined {
  return parseCookie(cookies.access);
}

export function getRefreshToken(): string | undefined {
  return parseCookie(cookies.refresh);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  const options = Object.entries(tokenConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");

  // Store tokens as-is without additional encoding
  document.cookie = `${cookies.access}=${accessToken}; ${options}`;
  document.cookie = `${cookies.refresh}=${refreshToken}; ${options}`;
}

export function clearTokens(): void {
  const expires = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  const options = `path=/; ${expires}`;

  document.cookie = `${cookies.access}=; ${options}`;
  document.cookie = `${cookies.refresh}=; ${options}`;
}
