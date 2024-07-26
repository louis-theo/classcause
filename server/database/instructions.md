To set up the database on your local computer:

### Creating tables

1. go to .env file in the /server/database and set up your environment variables
   eg

<code>DB_LOCAL_DBNAME="app_eng_db"
DB_LOCAL_USER=
DB_LOCAL_PASSWORD=
DB_LOCAL_PORT=
</code>

2. Make sure that your MySQL server is running and you have created the schema with the ppropriate name in MySQL Workbench

3. Then make sure you are in the /server/database directory and run this command to create all the tables:

<code> knex migrate:latest </code>

4. to reset the database tables (delete them) use the command:

<code> knex migrate:rollback </code>

### Seeding

1. To create a seed file, run this command:

<code>knex seed:make <name> </code>

! Make sure that you name the file with the number in front to represent the order of seeding to avoid conflicts with FK

2. to run it use

<code>knex seed:run</code>
