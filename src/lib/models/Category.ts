import { Schema, model, models } from 'mongoose'

const CategorySchema = new Schema(
    {
        label: { type: String, required: true },
        value: { type: String, required: true, unique: true, lowercase: true },
        description: { type: String },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
)

export default models.Category || model('Category', CategorySchema)
