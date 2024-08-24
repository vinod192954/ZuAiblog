const express = require('express')
const path= require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app=express()
const dbPath = path.join(__dirname,'blogsData.db')
let db = null


const initializeDBAndServer =async ()=>{
   try{
    db=await open({
        filename:dbPath,
        driver:sqlite3.Database
    })
    app.listen(3007,()=>{
        console.log("server listening at 3007 port")
    })
   }
   catch(e){
    console.log(`DB error ${e.message}`)
    process.exit(1)
   }
    
}

initializeDBAndServer()

app.get('/posts',async(request,response)=>{
    const getAllPosts = `SELECT * FROM blog_posts`
    const dbResponse = await db.all(getAllPosts)
    response.send(dbResponse)
})
 
app.get('/detailedPosts/:blogId',async(request,response)=>{
    const {blogId} = request.params 
    const detailedBlogPost = `SELECT * FROM detailed_blog WHERE blog_id = ?`
    const detailedPost = await db.get(detailedBlogPost,[blogId]) 
    try {
        if (detailedPost){
            response.send(detailedPost)
        }
        else{
            response.status(404).send({message:'Detailed blog post not found'})
        }
    }catch(error){
        response.status(500).send({error:error.message})
    }
    
    
})





