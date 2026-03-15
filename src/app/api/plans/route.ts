import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { calculateRetirement, type RetirementInputs } from "@/lib/calculations";

// GET /api/plans — list user's saved plans (newest first)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plans = await prisma.retirementPlan.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        inputs: true,
        result: true,
        _count: { select: { scenarios: true } },
      },
    });

    return NextResponse.json({ plans }, { status: 200 });
  } catch (error) {
    console.error("GET /api/plans error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

// POST /api/plans — save a new retirement plan
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, inputs } = body as { name: string; inputs: RetirementInputs };

    if (!name || !inputs) {
      return NextResponse.json(
        { error: "Missing required fields: name, inputs" },
        { status: 400 }
      );
    }

    // Server-side recalculate for integrity
    const result = calculateRetirement(inputs);

    const plan = await prisma.retirementPlan.create({
      data: {
        name,
        userId: session.user.id,
        inputs: inputs as object,
        result: result as unknown as object,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        planId: plan.id,
        action: "save",
        payload: inputs as object,
        ip: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? null,
        userAgent: request.headers.get("user-agent"),
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error("POST /api/plans error:", error);
    return NextResponse.json(
      { error: "Failed to save plan" },
      { status: 500 }
    );
  }
}
