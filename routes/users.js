const router = require('express').Router()
const userController = require("../controllers/user")

const userRoutes = (app) => {
    router.get("/logout/:userId", userController.logout)
    router.post("/register", userController.register)
    router.post("/login", userController.login)
    return app.use("/user", router)
}

module.exports = {
    userRoutes
}