const express = require("express");
const router = express.Router();
const User = require("../models/User");

// LOGIN Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Return user info (role-based)
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            hospitalId: user.hospitalId
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
