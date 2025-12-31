import pkg from "pg";
const { Client } = pkg;

const createDatabase = async () => {
  const client = new Client({
    host: "localhost",
    user: "postgres",
    password: "hana123",
    database: "postgres" // connect to default DB first
  });

  await client.connect();

  // Check if database exists
  const res = await client.query(
    "SELECT 1 FROM pg_database WHERE datname='dberp'"
  );

  if (res.rowCount === 0) {
    await client.query("CREATE DATABASE dberp");
    console.log("Database dberp created!");
  } else {
    console.log("Database already exists");
  }

  await client.end();
};

createDatabase();