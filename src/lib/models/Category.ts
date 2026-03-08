import { Schema, model, models } from 'mongoose'

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

export default models.Category || model('Category', CategorySchema)
