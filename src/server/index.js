const sql = require("mysql");
const express = require("express");
const con = sql.createConnection({
    host:'localhost',
    user:'root',
    password:'123',
    database:'yugen_db'
})
con.connect(function(err)
{
    if(err)
    {
        console.log(err);
    }
    else{
        console.log("connected");
        const query= "SELECT * FROM films";
        con.query(query,function(err,r)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            console.log(r);
        }
    })
    }
})