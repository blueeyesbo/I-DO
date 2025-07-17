import { Router } from "express";
import { db } from "../config/db.js";
import { userSettings } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

// 获取用户设置
router.get("/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const settings = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
        if (settings.length === 0) {
            return res.status(404).json({ message: "用户设置未找到" });
        }
        res.status(200).json(settings[0]);
    } catch (error) {
        console.error("获取用户设置失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 创建用户设置
router.post("/", async (req, res) => {
    try {
        const { userId, defaultCalendarView, weekStartDay, defaultEventDuration, timezone, notificationEnabled, emailNotifications, themeColor } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "userId为必填项" });
        }
        const newSettings = await db.insert(userSettings).values({
            userId,
            defaultCalendarView: defaultCalendarView || "month",
            weekStartDay: weekStartDay || 1,
            defaultEventDuration: defaultEventDuration || 60,
            timezone: timezone || "Asia/Shanghai",
            notificationEnabled: notificationEnabled !== undefined ? notificationEnabled : 1,
            emailNotifications: emailNotifications !== undefined ? emailNotifications : 0,
            themeColor: themeColor || "#667eea"
        }).returning();
        res.status(201).json(newSettings[0]);
    } catch (error) {
        console.error("创建用户设置失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 更新用户设置
router.put("/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const existingSettings = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
        if (existingSettings.length === 0) {
            return res.status(404).json({ message: "用户设置未找到" });
        }
        const { defaultCalendarView, weekStartDay, defaultEventDuration, timezone, notificationEnabled, emailNotifications, themeColor } = req.body;
        const updatedSettings = await db.update(userSettings)
            .set({
                defaultCalendarView: defaultCalendarView || existingSettings[0].defaultCalendarView,
                weekStartDay: weekStartDay !== undefined ? weekStartDay : existingSettings[0].weekStartDay,
                defaultEventDuration: defaultEventDuration !== undefined ? defaultEventDuration : existingSettings[0].defaultEventDuration,
                timezone: timezone || existingSettings[0].timezone,
                notificationEnabled: notificationEnabled !== undefined ? notificationEnabled : existingSettings[0].notificationEnabled,
                emailNotifications: emailNotifications !== undefined ? emailNotifications : existingSettings[0].emailNotifications,
                themeColor: themeColor || existingSettings[0].themeColor,
                updatedAt: new Date()
            })
            .where(eq(userSettings.userId, userId))
            .returning();
        res.status(200).json(updatedSettings[0]);
    } catch (error) {
        console.error("更新用户设置失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 删除用户设置
router.delete("/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const existingSettings = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
        if (existingSettings.length === 0) {
            return res.status(404).json({ message: "用户设置未找到" });
        }
        await db.delete(userSettings).where(eq(userSettings.userId, userId));
        res.status(200).json({ message: "用户设置已删除" });
    } catch (error) {
        console.error("删除用户设置失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

export default router;
