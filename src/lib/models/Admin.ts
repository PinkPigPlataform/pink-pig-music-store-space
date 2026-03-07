import mongoose, { Schema, model, models } from 'mongoose'

const AdminSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, select: false },
        role: {
            type: String,
            enum: ['admin', 'super_admin', 'support'],
            default: 'admin',
        },
        avatar: { type: String, default: null },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
)

export default models.Admin || model('Admin', AdminSchema)

