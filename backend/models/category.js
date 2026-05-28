import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
        name: { type: String, required: true },
        createdAt: { type: Date, default: () => new Date() }
    },
    {
        collection: 'Categories'
    }
);

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export default Category;
