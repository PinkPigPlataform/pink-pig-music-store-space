import { Schema, model, models } from 'mongoose'

const ProductSchema = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String },
        price: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'BRL' },
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        images: [{ type: Schema.Types.ObjectId, ref: 'UploadFile' }],
        digitalFile: { type: Schema.Types.ObjectId, ref: 'DigitalFile' },
        isDigital: { type: Boolean, default: true },
        active: { type: Boolean, default: true },
        featured: { type: Boolean, default: false },
        stripeProductId: { type: String },
        stripePriceId: { type: String },
        metaTitle: { type: String },
        metaDescription: { type: String },
    },
    { timestamps: true }
)

ProductSchema.index({ active: 1, featured: 1 })
ProductSchema.index({ category: 1, active: 1 })

export default models.Product || model('Product', ProductSchema)
