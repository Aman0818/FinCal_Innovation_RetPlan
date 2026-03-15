import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateRetirement, type RetirementInputs } from "@/lib/calculations";

// POST /api/calculate — run a calculation (no save) + audit log it
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inputs = body as RetirementInputs;

    if (!inputs.currentAge || !inputs.retirementAge) {
      return NextResponse.json(
        { error: "Invalid inputs" },
        { status: 400 }
      );
    }

    const result = calculateRetirement(inputs);

    // Audit log (no plan attached)
    await prisma.auditLog.create({
      data: {
        action: "calculate",
        payload: inputs as object,
        ip: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? null,
        userAgent: request.headers.get("user-agent"),
      },
    });

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error("POST /api/calculate error:", error);
    return NextResponse.json(
      { error: "Calculation failed" },
      { status: 500 }
    );
  }
}
