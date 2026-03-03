import { Schema, model, models } from 'mongoose'

const DigitalFileSchema = new Schema(
    {
        name: { type: String, required: true },
        originalName: { type: String },
        url: { type: String, required: true },
        blobKey: { type: String, required: true },
        mime: { type: String },
        size: { type: Number },
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    },
    { timestamps: true }
)

export default models.DigitalFile || model('DigitalFile', DigitalFileSchema)
