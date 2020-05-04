const express = require('express');
app.use(express.json());

app.listen(3000, 
    console.log(`Server running in development mode on port 3000`));