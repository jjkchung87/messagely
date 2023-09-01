const express = require('express')
const User = require('../models/user')
const Message = require('../models/message')
const router = new express.Router()
const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require('../config') 
const {ensureLoggedIn, ensureCorrectUser, ensureSenderOrRecipient} = require("../middleware/auth")

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id",ensureSenderOrRecipient, async (req,res,next) => {
    try{
        const message = await Message.get(req.params.id)
        return res.json({message: message})

    } catch(err){
        return next(err);
    }
})



/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/",ensureLoggedIn, async (req, res, next)=> {
    try{
        const from_username = req.user.username;
        const to_username = req.body.to_username;
        const body = req.body.body
        const message = await Message.create({from_username, to_username, body})
        return res.json({message: message})
    } catch(err){
        return next(err);
    }
} )


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read",async (req, res, next)=> {
    try{
        const message = await Message.get(req.params.id)
        const recipientUsername = message.to_user.username;
        if(req.user.username === recipientUsername){
            await markRead(req.params.id)
            return res.json({message:`Message ${req.params.id} marked as read`})
        } else{
            throw new ExpressError("Not authorized to mark as read", 401)
        }
    } catch (err) {
        return next(err);
    }
})

module.exports = router;