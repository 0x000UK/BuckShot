'use server'

import { auth } from "@/auth"
import connectDB from "@/lib/mongodb"
import UserModel from "@/models/user.model"
import MetricModel from "@/models/metric.model"
import DownloadClickModel from "@/models/downloadClick.model"
import { cookies } from "next/headers"
import { sqids } from "@/lib/sqids"
import mongoose from "mongoose"
import type { DownloadClickPayload } from "./types"


export async function recordSiteVisit(): Promise<{ success: boolean }> {
    try {
        const cookieStore = await cookies();
        const today = new Date().toISOString().split("T")[0];
        const visitedToday = cookieStore.get("gs_visit_date")?.value === today;

        await connectDB();

        if (!visitedToday) {
            await MetricModel.findOneAndUpdate(
                { date: today },
                { $inc: { visits: 1, uniqueVisitors: 1 } },
                { upsert: true, new: true }
            );
            cookieStore.set("gs_visit_date", today, {
                maxAge: 60 * 60 * 24, // 24 hours
                httpOnly: true,
                sameSite: "lax",
                path: "/",
            });
        } else {
            await MetricModel.findOneAndUpdate(
                { date: today },
                { $inc: { visits: 1 } },
                { upsert: true, new: true }
            );
        }
        return { success: true };
    } catch (err) {
        console.error("Failed to record site visit:", err);
        return { success: false };
    }
}

export async function recordDownloadClick(payload: DownloadClickPayload): Promise<{ success: boolean }> {
    try {
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
            gameId: payload.gameId,
            gameTitle: payload.gameTitle,
            siteName: payload.siteName,
            url: payload.url,
            linkType: payload.linkType || "non-official",
            category: payload.category || (payload.linkType === "official" ? "Official" : "Direct"),
            userId,
            userHandle,
        });

        const today = new Date().toISOString().split("T")[0];
        await MetricModel.findOneAndUpdate(
            { date: today },
            { $inc: { downloadClicks: 1 } },
            { upsert: true }
        ).catch(() => {});

        return { success: true };
    } catch (err) {
        console.error("Failed to record download click:", err);
        return { success: false };
    }
}
