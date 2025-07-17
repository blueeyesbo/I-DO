import { Router } from "express";
import { db } from "../config/db.js";
import { timeLogs } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

const router = Router();

// 获取用户的所有时间记录
router.get("/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const logs = await db.select().from(timeLogs).where(eq(timeLogs.userId, userId));
        res.status(200).json(logs);
    } catch (error) {
        console.error("获取时间记录失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 获取单条时间记录
router.get("/:userId/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const logId = parseInt(req.params.id);
        const log = await db.select().from(timeLogs)
            .where(and(eq(timeLogs.id, logId), eq(timeLogs.userId, userId)))
            .limit(1);
        if (log.length === 0) {
            return res.status(404).json({ message: "时间记录未找到" });
        }
        res.status(200).json(log[0]);
    } catch (error) {
        console.error("获取时间记录失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 创建新时间记录
router.post("/", async (req, res) => {
    try {
        const { userId, todoId, startTime, endTime, description } = req.body;
        if (!userId || !startTime) {
            return res.status(400).json({ message: "userId和startTime为必填项" });
        }
        const newLog = await db.insert(timeLogs).values({
            userId,
            todoId: todoId || null,
            startTime: new Date(startTime),
            endTime: endTime ? new Date(endTime) : null,
            description: description || null
        }).returning();
        res.status(201).json(newLog[0]);
    } catch (error) {
        console.error("创建时间记录失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 更新时间记录
router.put("/:userId/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const logId = parseInt(req.params.id);
        const existingLog = await db.select().from(timeLogs)
            .where(and(eq(timeLogs.id, logId), eq(timeLogs.userId, userId)))
            .limit(1);
        if (existingLog.length === 0) {
            return res.status(404).json({ message: "时间记录未找到" });
        }
        const { todoId, startTime, endTime, description } = req.body;
        const updatedLog = await db.update(timeLogs)
            .set({
                todoId: todoId !== undefined ? todoId : existingLog[0].todoId,
                startTime: startTime ? new Date(startTime) : existingLog[0].startTime,
                endTime: endTime ? new Date(endTime) : existingLog[0].endTime,
                description: description !== undefined ? description : existingLog[0].description
            })
            .where(eq(timeLogs.id, logId))
            .returning();
        res.status(200).json(updatedLog[0]);
    } catch (error) {
        console.error("更新时间记录失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 删除时间记录
router.delete("/:userId/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const logId = parseInt(req.params.id);
        const existingLog = await db.select().from(timeLogs)
            .where(and(eq(timeLogs.id, logId), eq(timeLogs.userId, userId)))
            .limit(1);
        if (existingLog.length === 0) {
            return res.status(404).json({ message: "时间记录未找到" });
        }
        await db.delete(timeLogs).where(eq(timeLogs.id, logId));
        res.status(200).json({ message: "时间记录已删除" });
    } catch (error) {
        console.error("删除时间记录失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

export default router;
