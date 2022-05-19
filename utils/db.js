const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

mongoose.connection.on("error", (err) => {
    console.error(err);
    console.log(
        "%s MongoDB connection error. Please make sure MongoDB is running.",
    );
    process.exit();
});