import { DataSource } from "typeorm";
import { config } from "dotenv";
import { join } from "path";

config({ path: join(process.cwd(), ".env") });

export default new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306", 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: ["src/**/*.entity{.ts,.js}"],
  migrations: ["src/migrations/*{.ts,.js}"],

  synchronize: false,
  logging: true,
  timezone: "+03:30",
});
