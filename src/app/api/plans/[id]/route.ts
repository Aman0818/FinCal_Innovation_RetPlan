import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { calculateRetirement, type RetirementInputs } from "@/lib/calculations";

// GET /api/plans/[id] — get a single plan with its scenarios
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const plan = await prisma.retirementPlan.findUnique({
      where: { id, userId: session.user.id },
      include: { scenarios: { orderBy: { createdAt: "desc" } } },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        planId: plan.id,
        action: "load",
        payload: plan.inputs as object,
      },
    });

    return NextResponse.json({ plan }, { status: 200 });
  } catch (error) {
    console.error("GET /api/plans/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}

// PUT /api/plans/[id] — update an existing plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, inputs } = body as { name?: string; inputs?: RetirementInputs };

    const existing = await prisma.retirementPlan.findUnique({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (inputs) {
      updateData.inputs = inputs as object;
      updateData.result = calculateRetirement(inputs) as unknown as object;
    }

    const plan = await prisma.retirementPlan.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        planId: plan.id,
        action: "save",
        payload: (inputs ?? existing.inputs) as object,
        ip: request.headers.get("x-forwarded-for") ?? null,
        userAgent: request.headers.get("user-agent"),
      },
    });

    return NextResponse.json({ plan }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/plans/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}

// DELETE /api/plans/[id] — delete a plan (cascading scenarios)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.retirementPlan.findUnique({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Audit log before delete
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        planId: id,
        action: "delete",
        ip: request.headers.get("x-forwarded-for") ?? null,
        userAgent: request.headers.get("user-agent"),
      },
    });

    await prisma.retirementPlan.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/plans/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete plan" },
      { status: 500 }
    );
  }
}
