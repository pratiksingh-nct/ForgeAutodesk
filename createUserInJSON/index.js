const express = require('express')
const app = express()

const path = __dirname

const http = require('http').createServer(app)

const fs = require('fs')
    
app.use(express.json())
app.use(express.urlencoded({extended:false}));

const PORT = process.env.PORT || 3000

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.get("/getUsers", (req, res) => {
    const users = fs.readFileSync(path + "/users.db.json", "utf8")
    return res.json({
        status: true,
        message: "user data",
        data: JSON.parse(users)
    })
})

app.post("/addUser", (req, res) => {
    const { name, password } = req.body

    if (!name || !password) {
        return res.json({
            status: false,
            message: "Please Provide all data",
            data: null
        })
    }

    let users = fs.readFileSync(path + "/users.db.json", "utf8")

    users = JSON.parse(users)
    // console.log(users)

    let id = Object.keys(users).length + 1

    let key = `user${id}`

    users[key] = {
        id,
        name, password
    }

    fs.writeFileSync(path + "/users.db.json", JSON.stringify(users))

    return res.json({
        status: true,
        message: "user added succesfully",
        data: (users)
    })
})








