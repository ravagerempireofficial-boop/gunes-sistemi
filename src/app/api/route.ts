import { NextResponse } from "next/server";

/** Statik export (build:site) için route handler önden derlenir */
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ message: "Hello, world!" });
}