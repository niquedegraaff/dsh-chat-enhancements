// Thin re-export entry: keeps the package main/lib shape (`lib/index.js`) while
// the host plugin implementation lives in src/host/.
export { name, inject, Config, apply } from "./host/index.js";
