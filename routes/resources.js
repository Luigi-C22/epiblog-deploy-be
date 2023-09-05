const express = require('express');
const mongoose = require('mongoose');
const resourcesModel = require('../models/resourcesModel');

const router = express.Router();

//Trova tutte le risorse 
/* router.get('/resources', async (req, res) => {
    try {
        const resource = await resourcesModel.find({
            isActive: true
        });
        const count = await resourcesModel.countDocuments();
        res.status(200).send({
            statusCode: 200,
            resource,
            count,
            message: 'GET is gone right'
        })

    } catch (error) {

        res.status(500).send({
            stausCode: 500,
            message: 'Internal server error in the GET call',
            error,
        });
    }
    
}) 
 */
//Trova tutte le risorse con le query specificate
router.get('/resources', async (req, res) => {
    
    try {
        
        const { isActive, age, eyeColor, company } = req.query;
        let query = {};

        //Trova tutte le risorse con il dato isActive corrispondente a true
        if (isActive) {
            query.isActive = isActive === 'true';
        }
        //Trova tutte le risorse con il dato age maggiore di 26
        if (age) {
            query.age = { $gt: parseInt(26) };
        }
        //Trova tutte le risorse con il dato age maggiore di 26 e minore o uguale a 30
        if (age) {
            query.age = { $gt: parseInt(26), $lte: parseInt(30) };
        }
        //Trova tutte le risorse con il dato eyes che sia brown o blue
        if (eyeColor) {
            query.eyeColor = {$in:["brown", "blue"]} ;
        }
        //Trova tutte le risorse che non presentano il dato eyes uguale a green
        if (eyeColor) {
            query.eyeColor = { $ne:"green" };
        }
        //Trova tutte le risorse che non presentano il dato eyes uguale a green e neanche blue
        if (eyeColor) {
            query.eyeColor = {$ne:["green", "blue"]  };
        }
        //Trova tutte le risorse con il dato company uguale a "FITCORE" e ritorna solo l'email
        if (company) {
            query.company = {$in: "FITCORE" };
        }

        const resource = await resourcesModel.find(query);
        const count = await resourcesModel.countDocuments(query);

        res.status(200).send({
            statusCode: 200,
            resource,
            count,
            message: 'GET is gone right'
        })

    } catch (error) {

        res.status(500).send({
            statusCode: 500,
            message: 'Internal server error in the GET call',
            error,
        });
    }
    
}) 


module.exports = router