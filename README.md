# budgetless

App for tracking money spend and comparing to a budget.

### Development Scripts

```bash
# run application in development mode
yarn dev

# compile source code and create webpack output
yarn compile

# `yarn compile` & create build with electron-builder
yarn dist

# `yarn compile` & create unpacked build with electron-builder
yarn dist:dir
```

### Database Migrations

```bash
# Create a migration
yarn typeorm migration:generate -n MIGRATION_NAME

# Apply migrations (Shouldn't be required, we run migrations on startup)
yarn typeorm migration:run

```

### TypeORM Notes

Whenever you create a migration, you need to add it to `migrations/allMigrations.ts`.

Whenever you add an entity, you need to add it to `src/services/database.ts` in the `entities = [....]` array.

See also http://typeorm.io/#/migrations
