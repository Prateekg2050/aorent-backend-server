import bcrypt from "bcryptjs";

const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: bcrypt.hashSync("123456", 10),
    address: "aa",
    phoneNumber: "123456",
    isAdmin: true,
  },
  {
    name: "User 1",
    email: "user1@example.com",
    address: "aa",
    phoneNumber: "123456",
    password: bcrypt.hashSync("123456", 10),
  },
  {
    name: "User 2",
    email: "user2@example.com",
    address: "aa",
    phoneNumber: "123456",
    password: bcrypt.hashSync("123456", 10),
  },
];

export default users;
