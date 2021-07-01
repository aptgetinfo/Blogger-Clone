const express =require('express')
const router= new express.Router()
const {ensureAuth,ensureGuest}=require('../middleware/auth')
const Story=require('../models/story')

router.get('/',ensureGuest,(req,res)=>{
    res.render('login',{
        layout:'login'
    })
})


router.get('/dashbord',ensureAuth,async (req,res)=>{
    try{
        const stories =await Story.find({user:req.user.id}).lean()
        res.render('dashbord',{
            name:req.user.firstName,
            stories:stories
        })
    }catch(err){
        res.render('error/500')
    }
})

module.exports =router