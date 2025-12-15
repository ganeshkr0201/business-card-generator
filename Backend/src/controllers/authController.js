import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendEmail } from '../config/sendEmail.js'


export const register = async (req, res) => {
    try {
        const { name, email, password } = req.user;

        const existingUser = await User.findOne({ email });
        if(existingUser) return res.status(400).json({ message: "User already exists"});

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            isVerified: false
        })

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const verificationLink = `${process.env.CLIENT_URL}/verify/${token}`;

        res.status(201).json({ message: "User created. Verification email sent." });

    }
    catch(error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
  await user.save();

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail(email, "Reset Password", `Click here to reset: ${resetLink}`);

  res.json({ message: "Password reset email sent" });
};


export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({ _id: decoded.id, resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({ message: "Password reset successfully" });
};


export const verifyEmail = async (req, res) => {
  const { token } = req.params;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) return res.status(400).json({ message: "Invalid token" });

  user.isVerified = true;
  await user.save();

  res.redirect(`${process.env.CLIENT_URL}/verified-success`);
};



export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    // 2. Check email verification
    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your email first" });

    // 3. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // 5. Send response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};