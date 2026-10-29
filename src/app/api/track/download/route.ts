import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import DownloadClickModel from "@/models/downloadClick.model";
import MetricModel from "@/models/metric.model";
import UserModel from "@/models/user.model";
import { auth } from "@/auth";
import { sqids } from "@/lib/sqids";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => null);
        if (!body || !body.gameId || !body.url || !body.siteName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectDB();
        const session = await auth();

        let userId: mongoose.Types.ObjectId | null = null;
        let userHandle: string | null = null;

        if (session?.user?.id) {
            const ids = sqids.decode(session.user.id);
            if (ids.length > 0) {
                const user = await UserModel.findOne({ userId: ids[0] }).select("_id handle").lean();
                if (user) {
                    userId = user._id;
                    userHandle = user.handle || null;
                }
            }
        }

        await DownloadClickModel.create({
            gameId: String(body.gameId),
            gameTitle: String(body.gameTitle || "Unknown"),
            siteName: String(body.siteName),
            url: String(body.url),
            linkType: body.linkType === "official" ? "official" : "non-official",
            category: body.category || (body.linkType === "official" ? "Official" : "Direct"),
            userId,
            userHandle,
        });

        const today = new Date().toISOString().split("T")[0];
        await MetricModel.findOneAndUpdate(
            { date: today },
            { $inc: { downloadClicks: 1 } },
            { upsert: true }
        ).catch(() => {});

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error("Download tracking API error:", err);
        return NextResponse.json({ error: "Tracking failed" }, { status: 500 });
    }
}
