import { Schema, model, models } from 'mongoose'

const ProductSchema = new Schema(
    {
        name: { type: String, required: true },
        locale: { type: String, enum: ['pt', 'en'], default: 'pt' },
        slug: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'BRL' },
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        images: [{ type: String }],
        digitalFile: { type: Schema.Types.ObjectId, ref: 'DigitalFile' },
        isDigital: { type: Boolean, default: true },
        active: { type: Boolean, default: true },
        featured: { type: Boolean, default: false },
        stripeProductId: { type: String },
        stripePriceId: { type: String },
        metaTitle: { type: String },
        metaDescription: { type: String },
        demoUrl: { type: String },
        videoUrl: { type: String },
    },
    { timestamps: true }
)

ProductSchema.index({ active: 1, featured: 1 })
ProductSchema.index({ category: 1, active: 1 })
ProductSchema.index({ slug: 1, locale: 1 }, { unique: true })

// Force re-registration in Next.js HMR to avoid stale schema
if (process.env.NODE_ENV === 'development' && (global as any).mongoose?.models?.Product) {
    delete (global as any).mongoose.models.Product
}
if (models.Product) {
    delete models.Product
}

export default model('Product', ProductSchema)
