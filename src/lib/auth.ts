import { cookies as nextCookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import AdminUser, { type AdminUser as AdminUserType } from "@/models/AdminUser";
import { Types } from "mongoose";
import connectDB from "@/lib/db";

const JWT_SECRET = (process.env.JWT_SECRET || "").padEnd(32, "x");
const key = new TextEncoder().encode(JWT_SECRET);

const COOKIE_NAME = "admin_session";
const MAX_AGE = 60 * 60 * 8; // 8h

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export interface AdminJWT {
  id: string;
  email: string;
  role: string;
}

export async function createSession(user: {
  id: string;
  email: string;
  role: string;
}) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key);
  const c = await nextCookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<AdminJWT | null> {
  const c = await nextCookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    const candidate = payload as Record<string, unknown>;
    if (
      typeof candidate.id === "string" &&
      typeof candidate.email === "string" &&
      typeof candidate.role === "string"
    ) {
      return { id: candidate.id, email: candidate.email, role: candidate.role };
    }
    return null;
  } catch {
    return null;
  }
}

export async function verifyToken(token: string): Promise<AdminJWT | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    const candidate = payload as Record<string, unknown>;
    if (
      typeof candidate.id === "string" &&
      typeof candidate.email === "string" &&
      typeof candidate.role === "string"
    ) {
      return { id: candidate.id, email: candidate.email, role: candidate.role };
    }
    return null;
  } catch {
    return null;
  }
}

export async function destroySession() {
  const c = await nextCookies();
  c.delete(COOKIE_NAME);
}

export async function authenticate(email: string, password: string) {
  try {
    await connectDB();
  } catch (e) {
    console.error("Auth DB connect failed:", (e as Error).message);
    return null;
  }
  const user = await AdminUser.findOne({ email }).lean<
    (AdminUserType & { _id: Types.ObjectId }) | null
  >();
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return { id: user._id.toString(), email: user.email, role: user.role };
}

// Seed default admin if not exists
export async function ensureDefaultAdmin() {
  const email = process.env.ADMIN_DEFAULT_EMAIL;
  const pass = process.env.ADMIN_DEFAULT_PASSWORD;
  if (!email || !pass) return;
  try {
    await connectDB();
  } catch (e) {
    console.warn(
      "Skipping default admin seed (DB unavailable):",
      (e as Error).message
    );
    return;
  }
  const existing = await AdminUser.findOne({ email }).lean();
  if (!existing) {
    const passwordHash = await hashPassword(pass);
    await AdminUser.create({
      email,
      passwordHash,
      name: "Administrator",
      role: "admin",
    });
    console.log("Default admin created");
  }
}

export async function getCurrentAdmin() {
  const session = await getSession();
  if (!session) return null;
  try {
    await connectDB();
  } catch (e) {
    console.error("getCurrentAdmin DB connect failed:", (e as Error).message);
    return null;
  }
  const doc = await AdminUser.findById(session.id).lean<
    (AdminUserType & { _id: Types.ObjectId }) | null
  >();
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    email: doc.email,
    role: doc.role,
    name: doc.name,
  };
}
