import mongoose from 'mongoose';
const UrlSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true, index: true },
    longUrl: { type: String, required: true }
}, { timestamps: true });
export default mongoose.model('Url', UrlSchema);