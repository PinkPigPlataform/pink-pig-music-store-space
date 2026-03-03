import { Schema, model, models } from 'mongoose'

const UploadFileSchema = new Schema(
    {
        name: { type: String, required: true },
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        mime: { type: String },
        size: { type: Number },
        width: { type: Number },
        height: { type: Number },
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    },
    { timestamps: true }
)

export default models.UploadFile || model('UploadFile', UploadFileSchema)
