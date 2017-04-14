const express = require('express'); //import express
const router = express.Router(); //The following example creates a router as a module, loads a middleware function in it, defines some routes, and mounts the router module on a path in the main app.
const bodyParser = require('body-parser');//parse not store
const jsonParser = bodyParser.json();//Parses the text as JSON and exposes the resulting object on req.body
const {blogPost} = require('./models'); //IMPORT the modeljs module

router.get('/', (req, res) => {
  blogPost
  .find()
  .exec()
  .then(blogpost => {
    res.json({
      blogpost: blogpost.map(
        (blogpost) => blogpost.apiRepr())
    });
  })
   .catch(
     err => {
       cosole.error(err);
       res.status(500).json({message: 'Internal server error'});
     });
});

router.get('/:id', (req, res) => {
  blogPost
  .findById(req.params.id)
  .exec()
  .then(blogpost => res.json(blogpost.apiRepr()))
  .catch(err => {
    console.error(err);
      res.status(500).json({message: 'Internal server error'})
  });
});


router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author', 'publishDate'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  blogPost
  .create({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    publishDate: req.body.publishDate
  })
  .then(
    blogpost => res.status(201).json(blogpost.apiRepr()))
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
});

router.put('/:id', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author', 'publishDate','id'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.id !== req.body.id) {
    const message = (
      `Request path id (${req.params.id}) and request body id `
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).send(message);
  }

  const toUpdate = {};
  const updateableFields = ['title', 'content', 'author'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  blogPost
  .findByIdAndUpdate(req.params.id, {$set:toUpdate}, {new:true})
  .exec()
  .then(updatedBlogpost => res.status(201).json(updatedBlogpost.apiRepr()))
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });

});

router.delete('/:id', (req, res) => {
  blogPost
  .findByIdAndRemove(req.params.id)
  .exec()
  .then(blogpost => res.status(204).end())
  .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.use('*', function(req, res){
  res.status(404).json({message: 'Not Found'});
});

module.exports = router;
