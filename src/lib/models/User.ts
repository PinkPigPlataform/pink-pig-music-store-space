import { Schema, model, models } from 'mongoose'

const UserSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, select: false },
        _verified: { type: Boolean, default: false },
        verificationToken: { type: String, select: false },
        googleId: { type: String, sparse: true },
        resetPasswordToken: { type: String, select: false },
        resetPasswordExpires: { type: Date },
    },
    { timestamps: true }
)

export default models.User || model('User', UserSchema)
