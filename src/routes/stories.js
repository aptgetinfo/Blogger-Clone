const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')
const Story = require('../models/story')

router.get('/add', ensureAuth, (req, res) => {
    res.render('./stories/add')
})

router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id
        await Story.create(req.body)
        res.redirect('/dashbord')
    } catch (err) {
        console.log(err)
        res.render('error/500')
    }
})


router.get('/', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({ status: 'public' })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()
        res.render('./stories/index', {
            stories
        })
    } catch (err) {
        console.log(err)
        res.render('error/500')
    }

})


router.get('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).populate('user').lean()

        if (!story) {
            return res.render('error/404')
        }

        if (story.user._id != req.user.id && story.status == 'private') {
            res.render('error/404')
        } else {
            res.render('stories/show', {
                story,
            })
        }
    } catch (err) {
        console.error(err)
        res.render('error/404')
    }
})



router.get('/edit/:id', ensureAuth, async (req, res) => {
    const story = await Story.findOne({
        _id: req.params.id
    }).lean()
    if (!story) {
        return res.render('error/404')
    }
    if (story.user != req.user.id) {
        res.redirect('/stories')
    } else {
        res.render('stories/edit', {
            story
        })
    }
})

router.put('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).lean()

        if (!story) {
            return res.render('error/404')
        }

        if (story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
                new: true,
                runValidators: true,
            })

            res.redirect('/dashbord')
        }
    } catch (err) {
        console.log(err)
        return res.render('error/500')
    }
})


router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        await Story.remove({ _id: req.params.id })
        res.redirect('/dashbord')
    } catch (err) {
        console.log(err)
        return res.render('error/500')
    }
})

router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
      const stories = await Story.find({
        user: req.params.userId,
        status: 'public',
      })
        .populate('user')
        .lean()
  
      res.render('stories/index', {
        stories,
      })
    } catch (err) {
      console.error(err)
      res.render('error/500')
    }
  })

module.exports = router