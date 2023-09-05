const mongoose = require('mongoose');

const PostModelSchema = new mongoose.Schema({
    category: {
        type: String,
        required: false,
    },
    title: {
        type: String,
        required: false,
    },
    cover: {
        type: String,
        required: false,
    },
    readTime: {
        value: {
            type: Number,
            required: false,
        },
        unit: {
            type: String,
            required: false,
        },
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Author',
    },
    content: {
        type: String,
        required: false, 
    },
},
 {
    timestamps: false, 
    strict: false,
});


module.exports = mongoose.model('Post', PostModelSchema, 'posts');