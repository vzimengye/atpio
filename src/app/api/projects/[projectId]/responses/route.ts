import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const body = await request.json();

  return NextResponse.json(
    {
      id: `response_${Date.now()}`,
      projectId,
      answers: body.answers,
      status: "accepted",
    },
    { status: 201 },
  );
}

