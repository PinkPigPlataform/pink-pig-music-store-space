import mongoose, { Schema, model } from 'mongoose'

const CategorySchema = new Schema(
    {
        label: { type: String, required: true },
        locale: { type: String, enum: ['pt', 'en'], default: 'pt' },
        value: { type: String, required: true, lowercase: true },
        description: { type: String, default: '' },
        active: { type: Boolean, default: true },
        parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
)

CategorySchema.index({ value: 1, locale: 1 }, { unique: true })

// Force re-registration in Next.js HMR to avoid stale schema
if (mongoose.models['Category']) {
    delete mongoose.models['Category']
}
export default model('Category', CategorySchema)
