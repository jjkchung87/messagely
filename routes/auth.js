const express = require('express')
const User = require('../models/user')
const Message = require('../models/message')
const router = new express.Router()
const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require('../config') 
const ExpressError = require('../expressError')



/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async (req, res, next) => {
    try{
        const {username, password} = req.body
        if(await User.authenticate(username, password)){
            await User.updateLoginTimestamp(username)
            const payload = {username: username}
            const token = jwt.sign(payload, SECRET_KEY)
            return res.json({message:"logged in", token})
        } else {
            throw new ExpressError("Incorrect username/password", 400)
        }
    } catch (err) {
        return next(err);
    }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async (req, res, next) => {
    try{
        const {username, password, first_name, last_name, phone} = req.body
        const user = User.register({username, password, first_name, last_name, phone})
        const payload = {username: username}
        const token = jwt.sign(payload, SECRET_KEY)
        return res.json({message:"registered", token})
    } catch(err) {
        return next(err)
    }
}
)

module.exports = router