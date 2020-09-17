const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");


const JWTSecret = "djkshahjksdajksdhasjkdhasjkdhasjkdhasjkd";

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


function auth(req, res, next){
    const authToken = req.headers['authorization'];

    if(authToken != undefined){

        const bearer = authToken.split(' ');
        var token = bearer[1];

        jwt.verify(token,JWTSecret,(err, data) => {
            if(err){
                res.status(401);
                res.json({err:"Token inválido!"});
            }else{

                req.token = token;
                req.loggedUser = {id: data.id,email: data.email};
                req.empresa = "Claudinei Nobrega";                
                next();
            }
        });
    }else{
        res.status(401);
        res.json({err:"Token inválido!"});
    } 
}

var DB = {
    users: [
        {
            id: 1,
            name: "Claudinei Nobrega",
            email: "claudinei.nobrega@apetitai.com.br",
            password: "nodejs<3"
        },
        {
            id: 2,
            name: "Iracema Nobrega",
            email: "iracema@gmail.com",
            password: "java123"
        }
    ]
}

app.get("/usuarios",auth,(req, res) => {
    res.statusCode = 200;
    res.json({empresa: req.empresa,user: req.loggedUser,usuarios: DB.users});
});

app.get("/usuario/:id",auth,(req, res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        
        var id = parseInt(req.params.id);

        var usuario = DB.users.find(g => g.id == id);

        if(usuario != undefined){
            res.statusCode = 200;
            res.json(usuario);
        }else{
            res.sendStatus(404);
        }
    }
});

app.post("/usuario",auth,(req, res) => { 
    var {name, email, password} = req.body;
    DB.users.push({
        id: 3,
        name,
        email,
        passwd
    });
    res.sendStatus(200);
})

app.delete("/usuario/:id",auth,(req, res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id);
        var index = DB.users.findIndex(g => g.id == id);

        if(index == -1){
            res.sendStatus(404);
        }else{
            DB.users.splice(index,1);
            res.sendStatus(200);
        }
    }
});

app.put("/usuario/:id",(req, res) => {

    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        
        var id = parseInt(req.params.id);

        var usuario = DB.users.find(g => g.id == id);

        if(usuario != undefined){

            var {name, email, password} = req.body;

            
            if(name != undefined){
                usuario.name = name;
            }

            if(email != undefined){
                usuario.email = email;
            }

            if(passsword != undefined){
                usuario.passsword = passsword;
            }
            
            res.sendStatus(200);

        }else{
            res.sendStatus(404);
        }
    }

});


app.post("/auth",(req, res) => {

    var {email, password} = req.body;

    if(email != undefined){

        var user = DB.users.find(u => u.email == email);
        if(user != undefined){
            if(user.password == password){
                jwt.sign({id: user.id, email: user.email},JWTSecret,{expiresIn:'48h'},(err, token) => {
                    if(err){
                        res.status(400);
                        res.json({err:"Falha interna"});
                    }else{
                        res.status(200);
                        res.json({token: token});
                    }
                })
            }else{
                res.status(401);
                res.json({err: "Credenciais inválidas!"});
            }
        }else{
            res.status(404);
            res.json({err: "O E-mail enviado não existe na base de dados!"});
        }

    }else{
        res.status(400);
        res.send({err: "O E-mail enviado é inválido"});
    }
});

app.listen(45679,() => {
    console.log("API RODANDO!");
});