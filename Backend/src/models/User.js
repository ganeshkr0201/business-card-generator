import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    githubId: { type: String },
    isVerified: { type: Boolean, default: false },
    resetToken: String,
    resetTokenExpiry: Date,
}, { timestamps: true });


export default mongoose.model("User", userSchema);