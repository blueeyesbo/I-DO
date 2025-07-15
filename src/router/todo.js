import { Router } from "express";
import { db } from "../config/db.js";
import { todos } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

const router = Router();

// 获取用户的所有待办事项
router.get("/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const userTodos = await db.select().from(todos).where(eq(todos.userId, userId));
        res.status(200).json(userTodos);
    } catch (error) {
        console.error("获取待办事项失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 获取单个待办事项
router.get("/:userId/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const todoId = parseInt(req.params.id);

        const todo = await db.select().from(todos)
            .where(and(
                eq(todos.id, todoId),
                eq(todos.userId, userId)
            ))
            .limit(1);

        if (todo.length === 0) {
            return res.status(404).json({ message: "待办事项未找到" });
        }

        res.status(200).json(todo[0]);
    } catch (error) {
        console.error("获取待办事项失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 创建新的待办事项
router.post("/", async (req, res) => {
    try {
        const { userId, title, description, priority, dueDate, categoryId, subcategoryId } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "未授权" });
        }

        if (!title) {
            return res.status(400).json({ message: "标题是必需的" });
        }
        const newTodo = await db.insert(todos).values({
            userId,
            title,
            description,
            priority: priority || "medium",
            dueDate: dueDate ? new Date(dueDate) : null,
            categoryId: categoryId || null,
            subcategoryId: subcategoryId || null,
            status: "pending"
        }).returning();

        res.status(201).json(newTodo[0]);
    } catch (error) {
        console.error("创建待办事项失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 更新待办事项
router.put("/:userId/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const todoId = parseInt(req.params.id);


        // 检查待办事项是否存在且属于当前用户
        const existingTodo = await db.select().from(todos)
            .where(and(
                eq(todos.id, todoId),
                eq(todos.userId, userId)
            ))
            .limit(1);

        if (existingTodo.length === 0) {
            return res.status(404).json({ message: "待办事项未找到" });
        }

        const { title, description, priority, status, dueDate, categoryId, subcategoryId } = req.body;
        
        // 如果状态从非完成变为完成，则设置完成时间
        let completedAt = existingTodo[0].completedAt;
        if (status === "completed" && existingTodo[0].status !== "completed") {
            completedAt = new Date();
        } else if (status !== "completed") {
            completedAt = null;
        }

        const updatedTodo = await db.update(todos)
            .set({
                title: title || existingTodo[0].title,
                description: description !== undefined ? description : existingTodo[0].description,
                priority: priority || existingTodo[0].priority,
                status: status || existingTodo[0].status,
                dueDate: dueDate ? new Date(dueDate) : existingTodo[0].dueDate,
                categoryId: categoryId !== undefined ? categoryId : existingTodo[0].categoryId,
                subcategoryId: subcategoryId !== undefined ? subcategoryId : existingTodo[0].subcategoryId,
                updatedAt: new Date(),
                completedAt
            })
            .where(eq(todos.id, todoId))
            .returning();

        res.status(200).json(updatedTodo[0]);
    } catch (error) {
        console.error("更新待办事项失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 删除待办事项
router.delete("/:userId/:id", async (req, res) => {
    try {   
        const userId = parseInt(req.params.userId);
        const todoId = parseInt(req.params.id);


        // 检查待办事项是否存在且属于当前用户
        const existingTodo = await db.select().from(todos)
            .where(and(
                eq(todos.id, todoId),
                eq(todos.userId, userId)
            ))
            .limit(1);

        if (existingTodo.length === 0) {
            return res.status(404).json({ message: "待办事项未找到" });
        }

        await db.delete(todos).where(eq(todos.id, todoId));

        res.status(200).json({ message: "待办事项已删除" });
    } catch (error) {
        console.error("删除待办事项失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

export default router;  