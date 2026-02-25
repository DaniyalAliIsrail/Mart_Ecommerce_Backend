
# Run all pending migrations

npx sequelize-cli db:migrate

# Undo the most recent migration

npx sequelize-cli db:migrate:undo

# Undo all migrations

npx sequelize-cli db:migrate:undo:all

# Undo migrations up to a specific migration file

npx sequelize-cli db:migrate:undo:all --to XXXXXXXXXXXXXX-create-users.js

# Run all pending seeders

npx sequelize-cli db:seed:all

# Undo the most recent seeder

npx sequelize-cli db:seed:undo

# Undo all seeders

npx sequelize-cli db:seed:undo:all

# Undo seeders up to a specific seeder file

npx sequelize-cli db:seed:undo:all --to XXXXXXXXXXXXXX-create-users.js

# Create a new migration file

npx sequelize-cli migration:create --name migration-name

# Generate a model and its migration file

npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string

# Show all pending migrations

npx sequelize-cli db:migrate:status

# Create the database

npx sequelize-cli db:create

# Drop the database

npx sequelize-cli db:drop





