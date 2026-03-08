import mongoose, { Schema, model } from 'mongoose'

const CategorySchema = new Schema(
    {
        label: { type: String, required: true },
        value: { type: String, required: true, unique: true, lowercase: true },
        description: { type: String },
        active: { type: Boolean, default: true },
        parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
)

CategorySchema.index({ parent: 1, active: 1 })
CategorySchema.index({ value: 1 })

// Delete cached model to avoid stale schema during Next.js hot reload
delete mongoose.models['Category']

export default model('Category', CategorySchema)
