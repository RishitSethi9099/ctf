
import { NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const instanceId = searchParams.get("instanceId");

    if (!teamId || !instanceId) {
      return NextResponse.json({ ok: false, error: "Missing teamId or instanceId" }, { status: 400 });
    }

    const key = `history:${teamId}:${instanceId}`;
    // Fetch last 50 commands
    const rawHistory = await redis.lrange(key, 0, 49);
    
    // Parse JSON strings back to objects
    const history = rawHistory.map((item: string) => {
        try {
            return JSON.parse(item);
        } catch (e) {
            // Handle legacy string-only history if any
            return { command: item, output: "" }; 
        }
    });

    // Redis list stores most recent push at the head or tail depending on lpush/rpush.
    // We will use RPUSH (append to end), so LRANGE 0 -1 returns them in chronological order.
    
    return NextResponse.json({ ok: true, history });
  } catch (error: any) {
    console.error("Redis Error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
    try {
        const { teamId, instanceId } = await req.json();

        if (!teamId || !instanceId) {
            return NextResponse.json({ ok: false, error: "Missing teamId or instanceId" }, { status: 400 });
        }

        const key = `history:${teamId}:${instanceId}`;
        await redis.del(key);

        return NextResponse.json({ ok: true });
    } catch (error: any) {
         console.error("Redis Error:", error);
         return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
