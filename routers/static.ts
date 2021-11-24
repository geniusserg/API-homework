import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../service";
import Game from "../model/game";
import fs from 'fs';
export const staticRouter = express.Router();


staticRouter.get('/text/:filename', function(req, res){
    const path = `${__dirname}/../static/${req?.params?.filename}`;
    if (fs.existsSync(path)) {
        res.download(path);
    }
    else{
        res.status(404).send(`File ${req?.params?.filename} in ${__dirname}/static/${req?.params?.filename} is not found`); 
    }
 
  });