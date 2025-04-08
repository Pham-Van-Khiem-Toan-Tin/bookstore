const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const { connectDB } = require("./config/db");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var order = require("./routes/order");
const bookRoutes = require("./routes/bookRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRouters = require("./routes/cartRouters");
const saleRouters = require("./routes/saleRouters");
const reviewRouters = require("./routes/reviewRouters");
const bookModel = require("./models/bookModel");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMENI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/order", order);
dotenv.config();

connectDB();

app.use(cors());

// log request
app.use(morgan("dev"));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use("/order", order);
app.use("/api/books", bookRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/cart", cartRouters);
app.use("/api/sale", saleRouters);
app.use("/api/review", reviewRouters);
app.get("/api/config/paypal", (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID)
);
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
const dirname = path.resolve();
app.use("/uploads", express.static(path.join(dirname, "/uploads")));

app.use(notFound);
app.use(errorHandler);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  // Lắng nghe sự kiện 'askQuestion' từ client
  socket.on("askQuestion", async (data) => {
    const { question } = data;

    // Lấy dữ liệu sách từ DB (giới hạn hoặc lọc theo yêu cầu)
    const books = await bookModel.find({}); // Ví dụ lấy 5 sách
    const booksData = JSON.stringify(books, null, 2);

    // Tạo prompt cho Gemini
    const prompt = `
          Người dùng hỏi: "${question}"
          Dựa trên danh sách sách sau để trả lời:
          ${booksData}
          Bạn là một trợ lý tư vấn sách cho website bán sách.
          Nếu không hiểu hãy hỏi: Bạn có thể hỏi lại được không?
          Trả lời tự nhiên và chính xác và ngắn gọn dựa trên dữ liệu này.
      `;

    // Gọi Gemini
    const result = await model.generateContent(prompt);

    // Gửi phản hồi về client qua Socket.IO
    socket.emit("chatResponse", {
      message: result.response.candidates[0].content.parts[0].text,
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, console.log("Server running on port 5000"));
