import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateRetirement, type RetirementInputs } from "@/lib/calculations";

// POST /api/plans/[id]/scenarios — save a "what-if" scenario against a plan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;
    const body = await request.json();
    const { scenarioType, label, altInputs } = body as {
      scenarioType: string;
      label: string;
      altInputs: RetirementInputs;
    };

    if (!scenarioType || !label || !altInputs) {
      return NextResponse.json(
        { error: "Missing required fields: scenarioType, label, altInputs" },
        { status: 400 }
      );
    }

    const plan = await prisma.retirementPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const altResult = calculateRetirement(altInputs);

    const scenario = await prisma.scenario.create({
      data: {
        planId,
        scenarioType,
        label,
        altInputs: altInputs as object,
        altResult: altResult as unknown as object,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        planId,
        action: "scenario_compare",
        payload: { scenarioType, label, altInputs } as object,
        ip: request.headers.get("x-forwarded-for") ?? null,
        userAgent: request.headers.get("user-agent"),
      },
    });

    return NextResponse.json({ scenario }, { status: 201 });
  } catch (error) {
    console.error("POST /api/plans/[id]/scenarios error:", error);
    return NextResponse.json(
      { error: "Failed to save scenario" },
      { status: 500 }
    );
  }
}
