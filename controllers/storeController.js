const mongoose = require('mongoose')
const Store = mongoose.model('Store')
const multer = require('multer') //is a midleware used to upload files
const jimp = require('jimp') //allow resize images
const uuid = require('uuid')



const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, files, next) {
    const isPhoto = files.mimetype.startsWith('image/')
    if (isPhoto) {
      next(null, true)
    } else {
      next({
        message: 'That file type isn\'t allowed'
      }, false)
    }
  }
}

exports.homePage = (req, res) => {
  res.render('index')
}

exports.addStore = (req, res) => {
  res.render('editStore', {
    title: 'Add Store'
  })
}

exports.upload = multer(multerOptions).single('photo')

exports.resize = async (req, res, next) => {
  //check in there is no new file to resize
  if (!req.file) {
    next()
    return
  }
  const extension = req.file.mimetype.split('/')[1]
  req.body.photo = `${uuid.v4()}.${extension}`
  //now we resize
  const photo = await jimp.read(req.file.buffer)
  await photo.resize(800, jimp.AUTO)
  await photo.write(`./public/uploads/${req.body.photo}`)
  next()
}

exports.createStore = async (req, res) => {
  // let store = new Store(req.body)
  // await store.save()
  req.body.author = req.user._id
  let store = await (new Store(req.body)).save()

  req.flash('success', `Successfully Created ${store.name}. Care to leave a Review`)
  res.redirect(`/store/${store.slug}`)

}
exports.getStores = async (req, res) => {
  const stores = await Store.find()
  res.render('stores', {
    title: 'Stores',
    stores: stores
  })
}

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw Error('You must own a store in order to edit it!!!!')
  }
}

exports.editStore = async (req, res) => {
  const store = await Store.findOne({
    _id: req.params.id
  })

  confirmOwner(store, req.user)

  res.render('editStore', {
    title: `Edit ${store.name}`,
    store: store
  })
}


exports.updateStore = async (req, res) => {

  req.body.location.type = 'Point'
  //this recieve 3 params
  const store = await Store.findOneAndUpdate({
    _id: req.params.id
  }, req.body, {
    new: true, //return the new store instead of the old one
    runValidators: true
  }).exec()
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/store /${store.slug}">View Store -></a> `)
  res.redirect(`/stores/${store._id}/edit`)
}

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({
    slug: req.params.slug
  }).populate('author')
  if (!store) return next()
  res.render('store', {
    store,
    title: store.name
  })

}

exports.getStoresByTag = async (req, res) => {

  const tag = req.params.tag
  const tagQuery = tag || {
    $exists: true
  }
  const tagsPromise = Store.getTagsList()
  const storesPromise = Store.find({
    tags: tagQuery
  })
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise])

  res.render('tags', {
    tags,
    title: 'Tags',
    tags,
    stores
  })
}

exports.searchStores = async (req, res) => {
  const stores = await Store.find({
    "$text": {
      "$search": req.query.q
    }
  }, {
    "score": {
      "$meta": "textScore"
    }
  }).sort({
    score: {
      $meta: "textScore"
    }
  })
  res.json(stores)

}
