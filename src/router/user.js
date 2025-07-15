import { Router } from "express";
import { db } from "../config/db.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

// 注册用户
router.post("/register", async (req, res) => {
    try {
        const { username, email, passwordHash } = req.body;
        console.log(username, email, passwordHash);
        const newUser = await db.insert(users).values({
            username,
            email,
            passwordHash
        }).returning();
        res.status(201).json(newUser[0]);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// 登录
router.post("/login", async (req, res) => {
    try {
        const { email, passwordHash } = req.body;
        const user = await db.select().from(users).where(eq(users.email, email));
        
        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (user[0].passwordHash !== passwordHash) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        res.status(200).json(user[0]);
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// 获取所有用户
router.get("/", async (req, res) => {
    try {
        const userList = await db.select().from(users);
        res.status(200).json(userList);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// 获取单个用户
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await db.select().from(users).where(eq(users.userId, id));
        
        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.status(200).json(user[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

export default router;  