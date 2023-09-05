const express = require('express')
const mongoose = require('mongoose')
const PostsModel = require('../models/postModel');

const logger = require('../middlewares/logger');
const isValidPost = require('../middlewares/validatePosts');
const { postBodyParams, validatePostBody } = require('../middlewares/postValidation');
const authorModel = require('../models/authorModel');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const crypto = require('crypto');
const verifyToken = require('../middlewares/verifyToken');

const post = express.Router(); //configurazione routing

cloudinary.config({ 
    cloud_name: 'dtwf16umd', 
    api_key: '191411338711878', 
    api_secret: 'jE6_s_KqtrAYzUKw4wI79NafTkM', 
  });

  const cloudStorage = new CloudinaryStorage({
    cloudinary: cloudinary, 
    params: {
        folder: 'testEpiBlog',
        format: async (req, file) => 'png',
        public_id: (req, file) => file.name,
    },
  })

//inizio della configurazione MULTER
const internalStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    }, 
    //modalità in cui deve venire recuperato il nome del file
    filename: (req, file, cb) => {
        const uniqueSuffix = `${new Date().toISOString()}-${crypto.randomUUID()}`;
        const fileExt = file.originalname.split('.').pop();
        cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExt}`)
    }
}); //qui termina la configurazione di MULTER

const uploads = multer({ storage: internalStorage });
const cloudUpload = multer ({ storage: cloudStorage});

post.post('/posts/cloudUpload', cloudUpload.single('cover'), async (req, res) => {
    try {
        res.status(200).json({ cover: req.file.path });
    } catch (error) {
        console.error("File upload failed:", error);
        res.status(500).json({ error: "File upload failed"});
    }
    
});

//questo è l'endpoint per fare l'upload del file
post.post('/posts/internalUpload', uploads.single('cover'), async (req, res) => {
    const url = req.protocol + '://' + req.get('host')
    try {
        const imgUrl = req.file.filename ;
        res.status(200).json({ cover: `${url}/uploads/${imgUrl}` });
    } catch (error) {
        console.error('File upload failed');
        res.status(500).send({
            statusCode: 500,
            message: "Upload not completed correctly",
        });
    }
})

post.get('posts/title', async (req, res) => {
    const { postTitle } = req.query;

    try {
        const postByTitle = await PostsModel.find({
            title: {
                $regex: '.*' + postTitle + '.*',
                $options: 'i',
            }
        })
        if (!postTitle || postTitle.length <= 0) {
            return res.status(400).send({
                statusCode: 404,
                message: `Post with title '${postTitle}' doesn't exist!`,
            });
        }
        res.status(200).send({
            statusCode: 200,
            postByTitle,
        })
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server Error",
            error,
        })

    }
})

 
// get http://localhost:5050/posts
post.get('/posts', verifyToken, async (req, res) => {
    const { page = 1, pageSize = 6 } = req.query //questa riga è l'implementazione della 'pagination'
    try {
        const posts = await PostsModel.find()
            .limit(pageSize) //limitiamo i numero di documenti a quello che passiamo nella query
            .skip((page - 1) * pageSize) //saltiamo dall'ultima pagina aperta al primo risultato della successiva
            .populate('author', "name surname email dob avatar");

        const totalPosts = await PostsModel.count();

        res.status(200).send({
            statusCode: 200,
            totalPosts: totalPosts,
            currentPage: +page,
            pageSize: +pageSize,
            posts: posts,
        })
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: "internal server Error",
            error,
        })
    }
}); 


post.get('/posts/title', async (req, res) => {
    const { postTitle } = req.query;

    try {
        const postByTitle = await PostsModel.find({
            title: {
                $regex: '.*' + postTitle + '.*',
                $options: 'i',
            }
        })

        if (!postByTitle || postByTitle.length <= 0) {
            return res.status(404).send({
                statusCode: 404,
                message: `Post with title: ${postByTitle} not found`
            })
        }
        res.status(200).send({
            statusCode: 200,
            postByTitle,
        });
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: "internal server Error",
            error,
        })
    }
})

post.get('/posts/:postId', async (req, res) => {

    const { postId } = req.params;

    try {
        const postById = await PostsModel.findById(postId);
        res.status(200).send({
            statusCode: 200,
            postById,
        });

    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: "internal server Error",
            error,
        });
    }
});

post.post('/posts/create', postBodyParams, validatePostBody, async (req, res) => {
    const user = await authorModel.findOne({ _id: req.body.author });
    if (!user) {
    return res.status(404).send({
        statusCode: 404,
        message: "user not found!",
    });
}

const newPost = new PostsModel({
    category: req.body.category,
    title: req.body.title,
    cover: req.body.cover,
    readTime: req.body.readTime,
    author: user._id,
    content: req.body.content,
});

try {
    const post = await newPost.save();
    await authorModel.updateOne({ _id: user._id }, { $push: { posts: post } });
    res.status(201).send({
        statusCode: 201,
        message: "Post saved successfully",
        payload: post,
    })
} catch (error) {
    res.status(500).send({
        statusCode: 500,
        message: "Internal server error",
        error,
    });
}
});

post.patch('/posts/:id', async (req, res) => {
    const { id } = req.params

    const postExist = await PostsModel.findById(id)

    if (!postExist) {
        return res.status(404).send({
            statusCode: 404,
            message: `Post with id ${id} not found`
        })
    }
    try {
        const postId = id;
        const dataToUpdate = req.body;
        const options = { new: true };

        const result = await PostsModel.findByIdAndUpdate(postId, dataToUpdate, options)

        res.status(200).send({
            statusCode: 200,
            message: `Post with id ${id} modified successfully`,
            result
        })
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            error,
        });
    }
});


post.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;

    const postExist = await postModel.findById(id)

    if (!postExist) {
        return res.status(404).send({
            statusCode: 404,
            message: `Post with id ${id} not found`
        })
    }

    try {
        const postTodelete = await postModel.findByIdAndDelete(id)
        res.status(200).send({
            statusCode: 200,
            message: `Post with id ${id} deleted successfully`,
        });
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            error,
        });
    }
})

module.exports = post; 