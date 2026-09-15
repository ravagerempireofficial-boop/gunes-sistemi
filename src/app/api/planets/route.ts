import { NextResponse } from "next/server";
import { BODIES } from "@/lib/solar-data";

/** Statik export (build:site) için route handler önden derlenir */
export const dynamic = "force-static";

/**
 * GET /api/planets
 * Güneş sistemi gökcisimlerinin simülasyon + ansiklopedi verilerini döndürür.
 */
export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      count: BODIES.length,
      updatedAt: new Date().toISOString(),
      bodies: BODIES,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Gökcismi verileri yüklenemedi." },
      { status: 500 }
    );
  }
}
