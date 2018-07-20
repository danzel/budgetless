# budgetless

App for tracking money spend and comparing to a budget.

### Development Scripts

```bash
# run application in development mode
yarn start

# compile source code and create webpack output
[TODO] yarn compile

# `yarn compile` & create build with electron-builder
[TODO] yarn dist

# `yarn compile` & create unpacked build with electron-builder
[TODO] yarn dist:dir
```

### Database Migrations

```bash
# Create a migration
yarn typeorm migration:generate -n MIGRATION_NAME

# Apply migrations (Shouldn't be required, we run migrations on startup)
yarn typeorm migration:run

```

### TypeORM Notes

See also http://typeorm.io/#/migrations
