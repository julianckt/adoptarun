/// <reference types="astro/client" />
type D1Database = import('@cloudflare/workers-types').D1Database;

type Env = {
  DB: D1Database;
};

declare namespace App {
  interface Locals {
    runtime?: {
      env: Env;
      cfContext?: import('@cloudflare/workers-types').ExecutionContext;
    };
  }
}
