var express 		= require("express"),
	app 			= express(),
	bodyParser 		= require("body-parser"),
	mongoose 		= require("mongoose"),
	methodOverride 	= require("method-override"),
	expressSanitizer = require("express-sanitizer");

///////////////////////////////
// INSTALL MONGOOSE AND SETUP//
///////////////////////////////
// APP CONFIG

mongoose.set("useUnifiedTopology", true);
mongoose.connect("mongodb://localhost/restful_blog_app",  { useNewUrlParser: true });

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method")); // whenever you get a function called method treat that request as put or delete request
app.use(expressSanitizer()); //must be after bodyParser
////////////////////////////////
// CREATE SCHEMA AND MODEL /////
////////////////////////////////

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
	
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
// 	title: "First blog",
// 	image: "https://astronomy.com/~/media/91C30DC3C221461C813777A84738AA53.jpg",
// 	body: "This is a test blog"
// });

// RESTFUL ROUTES
app.get("/", function(req,res){
	res.redirect("/blogs");
});

// INDEX ROUTES
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log("ERROR!");
		} else {
			res.render("index", {blogs: blogs});
		}
	});	
});

// NEW ROUTES
app.get("/blogs/new", function(req, res){
	res.render("new");
});

// CREATE ROUTES
app.post("/blogs", function(req, res){
	// Before in yelpcamp we created a blog object however this is a simpler way, refer to yelpcamp v2 new.ejs and app.js POST request to understand basics of how the data is passed
	// create blog
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new")
		} else {
			// then redirect to index
			res.redirect("/blogs")
		}
		
	});
})

// SHOW ROUTES
app.get("/blogs/:id", function(req,res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blog");
		} else {
			res.render("show", {blog: foundBlog});
		}
	});
});

// EDIT ROUTES
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog});
		}
	});

});

// UPDATE ROUTES
app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/"+ req.params.id);
		}
	});
});

// DELETE ROUTES
app.delete("/blogs/:id", function(req, res){
	//destroy blogs
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	});
});

app.listen(process.env.PORT || 3000, process.env.IP, function(){
	console.log("server has started on port 3000")
});