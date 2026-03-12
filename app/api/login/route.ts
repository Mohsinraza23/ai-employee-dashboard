import { NextRequest, NextResponse } from "next/server";

const DEMO_USERS: Record<string, { password: string; role: "admin" | "user" }> = {
  demo:  { password: "demo123", role: "admin" },
  admin: { password: "admin",   role: "admin" },
};

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const user = DEMO_USERS[username];
  if (!user || user.password !== password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  return NextResponse.json({
    ok:       true,
    token:    `demo-token-${username}-${Date.now()}`,
    username,
    role:     user.role,
  });
}
