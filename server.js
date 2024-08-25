const express = require('express')
const cors = require('cors')
const path= require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app=express()
const dbPath = path.join(__dirname,'blogsData.db')
let db = null
app.use(cors())
app.use(express.json())

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

app.post('/posts',async(request,response)=>{
    const {title,excerpt,content,author,publish_date,detailed_content} = request.body 
    const blogPostQuery = `INSERT INTO  blog_posts (title,excerpt,content) VALUES (?,?,?)` 
    const createBlogDetailsQuery = `INSERT INTO detailed_blog(blog_id,author,publish_date,detailed_content) VALUES(?,?,?,?) `
    try{
    await db.exec("BEGIN TRANSACTION")
    const blogPostResult = await db.run(blogPostQuery,[title,excerpt,content])
    const blogId = blogPostResult.lastID 
    await db.run(createBlogDetailsQuery,[blogId,author,publish_date,detailed_content])
    await db.exec("COMMIT")
    response.status(201).send({message:"Blog post and details are created successfully"})
 }catch(error){
    await db.exec("ROLLBACK")
    response.status(500).send({ error: "Database error", details: error.message });
 }

   

})  


app.put("/posts/:blogId",async(request,response)=>{
    const {blogId} = request.params 
    const {title,excerpt,content} = request.body 
    try{

 const updateBlogQuery = 
    `UPDATE blog_posts 
    SET  
       title = ?,
       excerpt = ?,
       content = ? 
    WHERE 
       id = ? ` 
    const dbResponse = await db.run(updateBlogQuery,[title,excerpt,content,blogId])
    if (dbResponse.changes!==0){
        response.send({message:"Blog post updated successfully"})
    }
    else{
        response.status(404).send({message:"Blog post not found"})
    }

    }catch(error){
        response.status(500).send({error:'Database error',details:error.message})
    }
    
})

app.delete("/posts/:blogId",async(request,response)=>{
    const {blogId} = request.params 
    try{

        const deleteBlogQuer = `DELETE FROM blog_posts WHERE id = ?` 
        const dbResponse = await db.run(deleteBlogQuer,[blogId])
         
        if (dbResponse.changes!==0){
         response.status(200).send({message:"Blog Item deleted successfully"})
        }
        else{
         response.status(404).send({message:"Blog post cannot found"})
        }

    }catch{
        response.status(500).send({error:"Database error",details:error.message})
    }
   

})

