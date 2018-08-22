# budgetless

App for tracking money spend and comparing to a budget.

### Development Scripts

```bash
# Run application in development mode
yarn start

# Build to a folder
yarn pre-pack
yarn package

# Create Installer
yarn pre-pack
yarn dist

```

### Database Migrations

```bash
# Create a migration
yarn typeorm migration:generate -n MIGRATION_NAME

# Apply migrations (Shouldn't be required, we run migrations on startup)
yarn typeorm migration:run
```

When you add a migration, add it to the list in `src/migrations/index.ts`.

When you add an entity, add it to `src/entities/index.ts` and `src/services/database.ts` in the `(ormConfig as any).entities = [` block.

### TypeORM Notes

See also http://typeorm.io/#/migrations
