const mongoose = require('mongoose')
const Store = mongoose.model('Store')


exports.homePage = (req, res) => {
  res.render('index')
}

exports.addStore = (req, res) => {
  res.render('editStore', {
    title: 'Add Store'
  })
}

exports.createStore = async (req, res) => {
  // let store = new Store(req.body)
  // await store.save()
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
