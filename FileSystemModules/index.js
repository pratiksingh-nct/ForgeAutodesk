const express = require('express')
const app = express()
const http = require('http').createServer(app)

const fs = require('fs')

const PORT = process.env.PORT || 3000

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})




app.get('/create', (req, res) => {
    fs.writeFile('hello.txt', 'Content Inside the File', (err)=>{
        if(err) throw err
        else
        console.log('File created')
    })
})


app.get('/readfile',(req,res)=>{
    fs.readFile('hello2.txt', 'utf-8', (err, data)=>{
        if(err) throw err
        console.log(data)
    })
})


app.get('/update', (req, res) => {
    fs.appendFile('hello.txt', '\n updated content', (err)=>{
        if(err) throw err
        else
        console.log('File updated')
    })  
})