import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { prisma } from "./prisma";


const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is not defined");
}

const secretKey = new TextEncoder().encode(secret);


// ==========================================
// CREATE JWT
// ==========================================

export async function createAuthToken(userId: number) {
  return await new SignJWT({
    userId,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}


// ==========================================
// VERIFY JWT
// ==========================================

export async function verifyAuthToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    return payload;
  } catch {
    return null;
  }
}


// ==========================================
// GET CURRENT LOGGED-IN USER
// ==========================================

export async function getCurrentUser() {

  // 1. Get cookies from request
  const cookieStore = await cookies();

  // 2. Get our authentication cookie
  const token = cookieStore.get("auth_token")?.value;

  // No token = not logged in
  if (!token) {
    return null;
  }


  // 3. Verify JWT
  const payload = await verifyAuthToken(token);

  if (!payload || !payload.userId) {
    return null;
  }


  // 4. Convert JWT userId into number
  const userId = Number(payload.userId);

  if (!Number.isInteger(userId)) {
    return null;
  }


  // 5. Find user in database
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });


  return user;
}