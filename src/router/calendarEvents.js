import { Router } from "express";
import { db } from "../config/db.js";
import { calendarEvents } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

const router = Router();

// 获取用户的所有日历事件
router.get("/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const events = await db.select().from(calendarEvents).where(eq(calendarEvents.userId, userId));
        res.status(200).json(events);
    } catch (error) {
        console.error("获取日历事件失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 获取单个日历事件
router.get("/:userId/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const eventId = parseInt(req.params.id);
        const event = await db.select().from(calendarEvents)
            .where(and(eq(calendarEvents.id, eventId), eq(calendarEvents.userId, userId)))
            .limit(1);
        if (event.length === 0) {
            return res.status(404).json({ message: "日历事件未找到" });
        }
        res.status(200).json(event[0]);
    } catch (error) {
        console.error("获取日历事件失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 创建新日历事件
router.post("/", async (req, res) => {
    try {
        const { userId, todoId, importantDateId, title, description, startDatetime, endDatetime, isAllDay, location, color, type, status } = req.body;
        if (!userId || !title || !startDatetime) {
            return res.status(400).json({ message: "userId、title、startDatetime为必填项" });
        }
        const newEvent = await db.insert(calendarEvents).values({
            userId,
            todoId: todoId || null,
            importantDateId: importantDateId || null,
            title,
            description: description || null,
            startDatetime: new Date(startDatetime),
            endDatetime: endDatetime ? new Date(endDatetime) : null,
            isAllDay: isAllDay || 0,
            location: location || null,
            color: color || "#667eea",
            type: type || "event",
            status: status || "scheduled"
        }).returning();
        res.status(201).json(newEvent[0]);
    } catch (error) {
        console.error("创建日历事件失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 更新日历事件
router.put("/:userId/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const eventId = parseInt(req.params.id);
        const existingEvent = await db.select().from(calendarEvents)
            .where(and(eq(calendarEvents.id, eventId), eq(calendarEvents.userId, userId)))
            .limit(1);
        if (existingEvent.length === 0) {
            return res.status(404).json({ message: "日历事件未找到" });
        }
        const { todoId, importantDateId, title, description, startDatetime, endDatetime, isAllDay, location, color, type, status } = req.body;
        const updatedEvent = await db.update(calendarEvents)
            .set({
                todoId: todoId !== undefined ? todoId : existingEvent[0].todoId,
                importantDateId: importantDateId !== undefined ? importantDateId : existingEvent[0].importantDateId,
                title: title || existingEvent[0].title,
                description: description !== undefined ? description : existingEvent[0].description,
                startDatetime: startDatetime ? new Date(startDatetime) : existingEvent[0].startDatetime,
                endDatetime: endDatetime ? new Date(endDatetime) : existingEvent[0].endDatetime,
                isAllDay: isAllDay !== undefined ? isAllDay : existingEvent[0].isAllDay,
                location: location !== undefined ? location : existingEvent[0].location,
                color: color || existingEvent[0].color,
                type: type || existingEvent[0].type,
                status: status || existingEvent[0].status,
                updatedAt: new Date()
            })
            .where(eq(calendarEvents.id, eventId))
            .returning();
        res.status(200).json(updatedEvent[0]);
    } catch (error) {
        console.error("更新日历事件失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 删除日历事件
router.delete("/:userId/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const eventId = parseInt(req.params.id);
        const existingEvent = await db.select().from(calendarEvents)
            .where(and(eq(calendarEvents.id, eventId), eq(calendarEvents.userId, userId)))
            .limit(1);
        if (existingEvent.length === 0) {
            return res.status(404).json({ message: "日历事件未找到" });
        }
        await db.delete(calendarEvents).where(eq(calendarEvents.id, eventId));
        res.status(200).json({ message: "日历事件已删除" });
    } catch (error) {
        console.error("删除日历事件失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

export default router;
