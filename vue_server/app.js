//复制服务器端模块
//引入第三方模块
//  mysql/express/
const mysql = require("mysql");
const express = require("express");
//引入跨域模块
const cors = require("cors");
//配置允许列表->4.1

//创建连接池
const pool = mysql.createPool({
  host:"127.0.0.1",
  user:"root",
  password:"",
  database:"car"
});
//创建express对象
var server = express(); 
//配置允许列表3000 允许
server.use(cors({
   origin:["http://127.0.0.1:8000",
   "http://localhost:8000"],
   credentials:true 
}))
//绑定监听端口 3000
server.listen(3000);
//指定静态目录，保存图片资源
  //项目中所有图片都需要保存在服务器端
server.use(express.static("public"));

//处理用户登录请求
  //login GET
server.get("/login",(req,res)=>{
  //获取参数
  var name = req.query.name;
  var pwd = req.query.pwd;
  //创sql
  var sql = "SELECT id FROM car_login";
  sql+=" WHERE name = ? AND pwd=md5(?)";
  //执行sql
  pool.query(sql,[name,pwd],(err,result)=>{
     if(err)throw err;
     //获取返回结果
     //判断结果返回 登录成功或者失败
     if(result.length==0){
       res.send({code:-1,msg:"用户名或密码有误"});
     }else{
       res.send({code:1,msg:"登录成功"})
     }
  });
});     

//注册
server.get("/reg",(req,res)=>{
  //获取参数
  var name = req.query.name;
  var pwd = req.query.pwd;
  var email = req.query.email
  var phone = req.query.phone;
  var sex = req.query.sex;
  //创sql
  var sql = "INSERT INTO car_login VALUES(null,?,md5(?),?,?,?);";
  //创建sql2查询用户名是否相同
  var sql2 ="SELECT id FROM car_login WHERE name = ?";
  //执行sql
  pool.query(sql2,[name],(err,result)=>{
     if(err)throw err;
     console.log(result);
     if(result.length==0){
        pool.query(sql,[name,pwd,email,phone,sex],(err,result)=>{
          if(err)throw err;
          //获取返回结果
          //判断结果返回 登录成功或者失败
          if(result.affectedRows==0){
            res.send({code:-1,msg:"注册失败"});
          }else{
            res.send({code:1,msg:"注册成功"})
          }
      })
     }else{
       res.send({code:-2,msg:"已有相同用户名存在"})
     }
  });
}); 

//获取list数据
server.get("/list",(req,res)=>{
  //获取参数
  var lid = req.query.lid;
  var obj={};
  //创sql
  var sql = "SELECT title,time,gl,pl,bsx,price FROM car_list WHERE lid = ?";
  var sql2 ="SELECT img_url FROM car_imglist WHERE lid = ?";
  //执行sql
  pool.query(sql,[lid],(err,result)=>{
     if(err)throw err;
     //获取返回结果
     if(result.length==0){
       res.send({code:-1,msg:"无此商品"});
     }else{
      obj.product=result;
      pool.query(sql2,[lid],(err,result)=>{
        if(err)throw err;
        obj.img_url=result;
        res.send({code:1,data:obj});
      });
       
     }
  });

});

