import bcrypt from "bcryptjs";

// Initial user store with pre-hashed passwords
export const INITIAL_USERS = [
  {
    id: "usr_admin_01",
    name: "Store Administrator",
    email: "admin@shop.co",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr_user_01",
    name: "Alex Morgan",
    email: "user@shop.co",
    passwordHash: bcrypt.hashSync("user123", 10),
    role: "user",
    createdAt: new Date().toISOString(),
  },
];

// In-memory users array for dynamic registration during runtime
export const usersStore = [...INITIAL_USERS];

export const findUserByEmail = (email) => {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return usersStore.find((u) => u.email.toLowerCase() === normalized) || null;
};

export const findUserById = (id) => {
  return usersStore.find((u) => u.id === id) || null;
};

export const createUser = ({ name, email, password, role = "user" }) => {
  const existing = findUserByEmail(email);
  if (existing) {
    throw new Error("A user with this email address already exists.");
  }

  const newUser = {
    id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    role: role === "admin" ? "admin" : "user",
    createdAt: new Date().toISOString(),
  };

  usersStore.push(newUser);
  return newUser;
};
