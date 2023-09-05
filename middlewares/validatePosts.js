const isValidPost = (req, res, next) => {
    const errors = [];

    const allowedImages = ['.jpg', ',png']

    const { category, title, cover, readTime, author, content } = req.body;

    if (typeof category !='string') {
        errors.push('Post category must be a string')
    }

    if (typeof title !='string') {
        errors.push('Post title must be a string')
    }

    if (typeof author !='string') {
        errors.push('Post author must be a string')
    }

    if (typeof content !='string' && content.length < 10) {
        errors.push('Post content must be at least 11 characters and must be a string')
    }

    if (typeof cover !='string' && allowedImages.some(ext => img.endsWith(ext))) {
        errors.push('Image must be png or jpg and must be a url string')
    }

    if (typeof readTime !='number') {
        errors.push('readTime must be a number')
    }

    if (errors.length > 0) {
        res.status(400).json({errors})
    } else {
        next()
    }
}

module.exports = isValidPost