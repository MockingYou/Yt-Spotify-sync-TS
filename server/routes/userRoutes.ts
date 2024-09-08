import { Router } from "express";
import bcrypt from "bcrypt"
import User from "../models/User"

const router = Router();

router.patch("/user/change_password", async (req, res) => {
	try {
        const { id, password, newPassword } = req.body;
        const user = await User.findOne({
            _id: id,
        });
		if(!user) {
			throw new Error ("User not found")
		}
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                message: "Password is not the same",
                type: "ERROR",
            });
        }
        const newPasswordMatch = await bcrypt.compare(
            newPassword,
            user.password
        );
        if (newPasswordMatch) {
            return res.status(401).json({
                message: "Password cannot be the same",
                type: "ERROR",
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate(
            { _id: id },
            { password: hashedPassword },
            {
                new: true,
            }
        );
        res.status(200).json({
            message: "Password updated successfully",
            type: "SUCCESS",
            username: user.username,
            email: user.email,
            id: user._id,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Password update failed",
            type: "ERROR",
        });
    }
});

router.patch("/user/update_username", async (req, res) => {
    try {
        const { id, username } = req.body;

        const user = await User.findOneAndUpdate(
            {
                _id: id,
            },
            { username },
            { new: true }
        );
        console.log(user);
		if(!user) {
			throw new Error ("User not found")
		}
        res.status(200).json({
            message: `Username: ${username} updated successfully`,
            type: "SUCCESS",
            username: user.username,
            email: user.email,
            id: user._id,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "User update failed", type: "ERROR" });
    }
});

router.patch("/user/update_email", async (req, res) => {
    try {
        const { id, email } = req.body;

        const user = await User.findOneAndUpdate(
            {
                _id: id,
            },
            { email },
            { new: true }
        );
        console.log(user);
        if(!user) {
			throw new Error ("User not found")
		}
        res.status(200).json({
            message: `Email: ${email} updated successfully`,
            type: "SUCCESS",
            username: user.username,
            email: user.email,
            id: user._id,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "User update failed", type: "ERROR" });
    }
});
export default router;
