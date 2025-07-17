import { Router } from "express";
import { db } from "../config/db.js";
import { importantDates } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

const router = Router();

// 获取用户的所有重要日期
router.get("/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const dates = await db.select().from(importantDates).where(eq(importantDates.userId, userId));
        res.status(200).json(dates);
    } catch (error) {
        console.error("获取重要日期失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 获取单个重要日期
router.get("/:userId/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const dateId = parseInt(req.params.id);
        const date = await db.select().from(importantDates)
            .where(and(eq(importantDates.id, dateId), eq(importantDates.userId, userId)))
            .limit(1);
        if (date.length === 0) {
            return res.status(404).json({ message: "重要日期未找到" });
        }
        res.status(200).json(date[0]);
    } catch (error) {
        console.error("获取重要日期失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 创建新重要日期
router.post("/", async (req, res) => {
    try {
        const { userId, categoryId, title, description, targetDate, targetTime, type, priority, color, icon, isRecurring, recurringType, recurringInterval, notificationDays, isActive } = req.body;
        if (!userId || !title || !targetDate) {
            return res.status(400).json({ message: "userId、title、targetDate为必填项" });
        }
        const newDate = await db.insert(importantDates).values({
            userId,
            categoryId: categoryId || null,
            title,
            description: description || null,
            targetDate: new Date(targetDate),
            targetTime: targetTime || "23:59:59",
            type: type || "countdown",
            priority: priority || "medium",
            color: color || "#667eea",
            icon: icon || "calendar",
            isRecurring: isRecurring || 0,
            recurringType: recurringType || null,
            recurringInterval: recurringInterval || 1,
            notificationDays: notificationDays || null,
            isActive: isActive !== undefined ? isActive : 1
        }).returning();
        res.status(201).json(newDate[0]);
    } catch (error) {
        console.error("创建重要日期失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 更新重要日期
router.put("/:userId/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const dateId = parseInt(req.params.id);
        const existingDate = await db.select().from(importantDates)
            .where(and(eq(importantDates.id, dateId), eq(importantDates.userId, userId)))
            .limit(1);
        if (existingDate.length === 0) {
            return res.status(404).json({ message: "重要日期未找到" });
        }
        const { categoryId, title, description, targetDate, targetTime, type, priority, color, icon, isRecurring, recurringType, recurringInterval, notificationDays, isActive } = req.body;
        const updatedDate = await db.update(importantDates)
            .set({
                categoryId: categoryId !== undefined ? categoryId : existingDate[0].categoryId,
                title: title || existingDate[0].title,
                description: description !== undefined ? description : existingDate[0].description,
                targetDate: targetDate ? new Date(targetDate) : existingDate[0].targetDate,
                targetTime: targetTime || existingDate[0].targetTime,
                type: type || existingDate[0].type,
                priority: priority || existingDate[0].priority,
                color: color || existingDate[0].color,
                icon: icon || existingDate[0].icon,
                isRecurring: isRecurring !== undefined ? isRecurring : existingDate[0].isRecurring,
                recurringType: recurringType !== undefined ? recurringType : existingDate[0].recurringType,
                recurringInterval: recurringInterval !== undefined ? recurringInterval : existingDate[0].recurringInterval,
                notificationDays: notificationDays !== undefined ? notificationDays : existingDate[0].notificationDays,
                isActive: isActive !== undefined ? isActive : existingDate[0].isActive,
                updatedAt: new Date()
            })
            .where(eq(importantDates.id, dateId))
            .returning();
        res.status(200).json(updatedDate[0]);
    } catch (error) {
        console.error("更新重要日期失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 删除重要日期
router.delete("/:userId/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const dateId = parseInt(req.params.id);
        const existingDate = await db.select().from(importantDates)
            .where(and(eq(importantDates.id, dateId), eq(importantDates.userId, userId)))
            .limit(1);
        if (existingDate.length === 0) {
            return res.status(404).json({ message: "重要日期未找到" });
        }
        await db.delete(importantDates).where(eq(importantDates.id, dateId));
        res.status(200).json({ message: "重要日期已删除" });
    } catch (error) {
        console.error("删除重要日期失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

export default router;
