import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, default: '' },
        category: {
            _id: { type: String, required: true },
            name: { type: String, required: true }
        },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        sizes: { type: [String], default: [] },
        colors: { type: [String], default: [] },
        stock: { type: Number, default: 0 },
        images: { type: [String], default: [] },
        createdAt: { type: Date, default: () => new Date() }
    },
    {
        collection: 'Products'
    }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
