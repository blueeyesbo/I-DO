import { Router } from "express";
import { db } from "../config/db.js";
import { subcategories } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

const router = Router();

// 获取用户某分类下的所有子分类
router.get("/:userId/:categoryId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const categoryId = parseInt(req.params.categoryId);
        const userSubcategories = await db.select().from(subcategories)
            .where(and(eq(subcategories.userId, userId), eq(subcategories.categoryId, categoryId)));
        res.status(200).json(userSubcategories);
    } catch (error) {
        console.error("获取子分类失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 获取单个子分类
router.get("/:userId/:categoryId/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const categoryId = parseInt(req.params.categoryId);
        const subcategoryId = parseInt(req.params.id);
        const subcategory = await db.select().from(subcategories)
            .where(and(
                eq(subcategories.id, subcategoryId),
                eq(subcategories.userId, userId),
                eq(subcategories.categoryId, categoryId)
            ))
            .limit(1);
        if (subcategory.length === 0) {
            return res.status(404).json({ message: "子分类未找到" });
        }
        res.status(200).json(subcategory[0]);
    } catch (error) {
        console.error("获取子分类失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 创建新子分类
router.post("/", async (req, res) => {
    try {
        const { userId, categoryId, name, description, color, icon, sortOrder } = req.body;
        if (!userId || !categoryId) {
            return res.status(401).json({ message: "未授权或缺少分类" });
        }
        if (!name) {
            return res.status(400).json({ message: "子分类名是必需的" });
        }
        const newSubcategory = await db.insert(subcategories).values({
            userId,
            categoryId,
            name,
            description: description || null,
            color: color || undefined,
            icon: icon || undefined,
            sortOrder: sortOrder || 0
        }).returning();
        res.status(201).json(newSubcategory[0]);
    } catch (error) {
        console.error("创建子分类失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 更新子分类
router.put("/:userId/:categoryId/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const categoryId = parseInt(req.params.categoryId);
        const subcategoryId = parseInt(req.params.id);
        // 检查子分类是否存在且属于当前用户和分类
        const existingSubcategory = await db.select().from(subcategories)
            .where(and(
                eq(subcategories.id, subcategoryId),
                eq(subcategories.userId, userId),
                eq(subcategories.categoryId, categoryId)
            ))
            .limit(1);
        if (existingSubcategory.length === 0) {
            return res.status(404).json({ message: "子分类未找到" });
        }
        const { name, description, color, icon, sortOrder } = req.body;
        const updatedSubcategory = await db.update(subcategories)
            .set({
                name: name || existingSubcategory[0].name,
                description: description !== undefined ? description : existingSubcategory[0].description,
                color: color || existingSubcategory[0].color,
                icon: icon || existingSubcategory[0].icon,
                sortOrder: sortOrder !== undefined ? sortOrder : existingSubcategory[0].sortOrder,
                updatedAt: new Date()
            })
            .where(eq(subcategories.id, subcategoryId))
            .returning();
        res.status(200).json(updatedSubcategory[0]);
    } catch (error) {
        console.error("更新子分类失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

// 删除子分类
router.delete("/:userId/:categoryId/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const categoryId = parseInt(req.params.categoryId);
        const subcategoryId = parseInt(req.params.id);
        // 检查子分类是否存在且属于当前用户和分类
        const existingSubcategory = await db.select().from(subcategories)
            .where(and(
                eq(subcategories.id, subcategoryId),
                eq(subcategories.userId, userId),
                eq(subcategories.categoryId, categoryId)
            ))
            .limit(1);
        if (existingSubcategory.length === 0) {
            return res.status(404).json({ message: "子分类未找到" });
        }
        await db.delete(subcategories).where(eq(subcategories.id, subcategoryId));
        res.status(200).json({ message: "子分类已删除" });
    } catch (error) {
        console.error("删除子分类失败:", error);
        res.status(500).json({ message: "服务器错误" });
    }
});

export default router;
