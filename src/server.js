const app = require("./app");
const dotenv = require("dotenv");
const { connectToDatabase } = require("./config/database");

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
  connectToDatabase();
});
