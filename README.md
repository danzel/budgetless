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

# Apply migrations
yarn typeorm migration:run

```

See also http://typeorm.io/#/migrations
