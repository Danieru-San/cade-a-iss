const express = require('express');
const router = express.Router();
const axios = require('axios');
const ISS_POSITION = "http://api.open-notify.org/iss-now.json";
const ISS_CREW = "http://api.open-notify.org/astros.json";
const ISS_PASSES = `http://api.open-notify.org/iss-pass.json?`;

// Get current ISS position
router.get('/position', async (req, res) => {
    try {
        const position = await axios.get(ISS_POSITION);
        if (position.data.message === "success") {
            return res.status(200).json({
                latitude: position.data.iss_position.latitude,
                longitude: position.data.iss_position.longitude,
                timestamp: position.data.timestamp
            });
        }

        else {
            throw new Error("Couldn't get ISS position.");
        }
    } 
    
    catch (error) {
        return res.status(500).json({ 
            success: false,
            message: "Failed to get ISS position.",
        });  
    }
});

// Get ISS crew
router.get('/crew', async (req, res) => {
    try {
        const crew = await axios.get(ISS_CREW);
        if (crew.data.message === "success") {
            return res.status(200).json(crew.data);
        }

        else {
            throw new Error("Couldn't get crew information.");
        }
    } 
    
    catch (error) {
        return res.status(500).json({ 
            success: false,
            message: "Failed to get crew information.",
        });  
    }
});

// Get times ISS will pass overhead
router.get('/passes/:lat/:lon', async (req, res) => {
    try {
        const latitude = req.params.lat;
        const longitude = req.params.lon;
        const passes = await axios.get(ISS_PASSES + `lat=${latitude}&lon=${longitude}`);
        console.log(passes);
        if (passes.data.message === "success") {
            return res.status(200).json(passes.data);
        }

        else {
            throw new Error("Couldn't get passes information.");
        }
    } 
    
    catch (error) {
        return res.status(500).json({ 
            success: false,
            message: "Failed to get passes information.",
        });  
    }
});


module.exports = router;