import { Router } from "express";
import { db } from "../config/db.js";
import { categories } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

const router = Router();

// 获取用户的所有分类
router.get("/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const userCategories = await db.select().from(categories).where(eq(categories.userId, userId));
        res.status(200).json(userCategories);
    } catch (error) {
        console.error("获取分类失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 获取单个分类
router.get("/:userId/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const categoryId = parseInt(req.params.id);
        const category = await db.select().from(categories)
            .where(and(
                eq(categories.id, categoryId),
                eq(categories.userId, userId)
            ))
            .limit(1);
        if (category.length === 0) {
            return res.status(404).json({ message: "分类未找到" });
        }
        res.status(200).json(category[0]);
    } catch (error) {
        console.error("获取分类失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 创建新分类
router.post("/", async (req, res) => {
    try {
        const { userId, name, description, color, icon, sortOrder } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "未授权" });
        }
        if (!name) {
            return res.status(400).json({ message: "分类名是必需的" });
        }
        const newCategory = await db.insert(categories).values({
            userId,
            name,
            description: description || null,
            color: color || undefined,
            icon: icon || undefined,
            sortOrder: sortOrder || 0
        }).returning();
        res.status(201).json(newCategory[0]);
    } catch (error) {
        console.error("创建分类失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 更新分类
router.put("/:userId/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const categoryId = parseInt(req.params.id);
        // 检查分类是否存在且属于当前用户
        const existingCategory = await db.select().from(categories)
            .where(and(
                eq(categories.id, categoryId),
                eq(categories.userId, userId)
            ))
            .limit(1);
        if (existingCategory.length === 0) {
            return res.status(404).json({ message: "分类未找到" });
        }
        const { name, description, color, icon, sortOrder } = req.body;
        const updatedCategory = await db.update(categories)
            .set({
                name: name || existingCategory[0].name,
                description: description !== undefined ? description : existingCategory[0].description,
                color: color || existingCategory[0].color,
                icon: icon || existingCategory[0].icon,
                sortOrder: sortOrder !== undefined ? sortOrder : existingCategory[0].sortOrder,
                updatedAt: new Date()
            })
            .where(eq(categories.id, categoryId))
            .returning();
        res.status(200).json(updatedCategory[0]);
    } catch (error) {
        console.error("更新分类失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 删除分类
router.delete("/:userId/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const categoryId = parseInt(req.params.id);
        // 检查分类是否存在且属于当前用户
        const existingCategory = await db.select().from(categories)
            .where(and(
                eq(categories.id, categoryId),
                eq(categories.userId, userId)
            ))
            .limit(1);
        if (existingCategory.length === 0) {
            return res.status(404).json({ message: "分类未找到" });
        }
        await db.delete(categories).where(eq(categories.id, categoryId));
        res.status(200).json({ message: "分类已删除" });
    } catch (error) {
        console.error("删除分类失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

export default router;
