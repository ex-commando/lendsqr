import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // Users Table
    await knex.schema.createTable("users", (table) => {
        table.uuid("id").primary().defaultTo(knex.fn.uuid());
        table.string("name").notNullable();
        table.string("email").unique().notNullable();
        table.string("password").notNullable();
        table.timestamps(true, true);
    });

    // Wallets Table
    await knex.schema.createTable("wallets", (table) => {
        table.uuid("id").primary().defaultTo(knex.fn.uuid());
        table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
        table.decimal("balance", 14, 2).defaultTo(0.00); // Support up to trillions with 2 decimal places
        table.string("currency").defaultTo("NGN");
        table.timestamps(true, true);
    });

    // Transactions Table
    await knex.schema.createTable("transactions", (table) => {
        table.uuid("id").primary().defaultTo(knex.fn.uuid());
        table.uuid("wallet_id").references("id").inTable("wallets").onDelete("CASCADE");
        table.enum("type", ["CREDIT", "DEBIT"]).notNullable();
        table.decimal("amount", 14, 2).notNullable();
        table.string("reference").unique().notNullable(); // External or internal reference
        table.enum("status", ["PENDING", "SUCCESS", "FAILED"]).defaultTo("PENDING");
        table.string("description").nullable();
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("transactions");
    await knex.schema.dropTableIfExists("wallets");
    await knex.schema.dropTableIfExists("users");
}
