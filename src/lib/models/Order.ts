import { Schema, model, models } from 'mongoose'

const OrderSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        total: { type: Number, required: true },
        currency: { type: String, default: 'BRL' },
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        stripeSessionId: { type: String, index: true },
        stripePaymentIntentId: { type: String },
        receiptEmailSent: { type: Boolean, default: false },
    },
    { timestamps: true }
)

export default models.Order || model('Order', OrderSchema)
