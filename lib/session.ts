import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "attendance_session";

function getSecret() {
  return process.env.AUTH_SECRET ?? "dev-secret-change-me";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function buildToken(username: string) {
  const payload = JSON.stringify({ username, ts: Date.now() });
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function verifyToken(token: string) {
  const [encoded, signature] = token.split(".");

  if (!encoded || !signature) {
    return null;
  }

  const expected = sign(encoded);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);

  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as {
    username: string;
    ts: number;
  };

  return payload;
}

export async function createSession(username: string) {
  const token = buildToken(username);
  const jar = await cookies();

  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export function isValidCredentials(username: string, password: string) {
  const expectedUsername = process.env.AUTH_USERNAME ?? "admin";
  const expectedPassword = process.env.AUTH_PASSWORD ?? "admin123";

  return username === expectedUsername && password === expectedPassword;
}

export { COOKIE_NAME };
