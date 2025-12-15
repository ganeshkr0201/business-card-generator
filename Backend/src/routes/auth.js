import express from "express";
import { register, login, forgotPassword, resetPassword, verifyEmail } from "../controllers/authController.js";
import passport from "passport";
import jwt from 'jsonwebtoken'

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify/:token", verifyEmail);

router.get("/google", 
    passport.authenticate("google", { scope: ["profile", "email"]})
);
router.get("/google/callback", 
    passport.authenticate("google", { session: false }), 
    (req, res) => {
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET);
        res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`)
    }
);


router.get("/github", 
    passport.authenticate("github", { scope: ["user:email"] })
);
router.get("/github/callback",
    passport.authenticate("github", { session: false }),
    (req, res) => {
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET);
        res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
    }
);





export default router;
