#!/bin/bash
set -e

PG_LOCATION="/usr/lib/postgresql/9.4/bin"
DB_USERNAME="thimble"
DB_PASSWORD="thimble"

# --- Install OS level dependencies ---
apt-get update -y
curl -sL https://deb.nodesource.com/setup_4.x | sh
apt-get install -y nodejs
# --- Postgres ---
echo "deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt-get install wget ca-certificates
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
apt-get update -y
apt-get upgrade -y
apt-get install -y postgresql-9.4
# ---
# --- login.webmaker.org bcrypt dependencies ---
apt-get install -y python-software-properties
add-apt-repository ppa:ubuntu-toolchain-r/test
apt-get update -y
apt-get install -y gcc-4.8 g++-4.8
update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.8 60 --slave /usr/bin/g++ g++ /usr/bin/g++-4.8
# ---
apt-get install -y git # For id.webmaker.org
npm install -g http-server --loglevel=error # For hosting published projects
npm install -g node-gyp --loglevel=error # For bcrypt
# ---


cd /vagrant
ROOT="$(pwd)"

# Create a database if it does not exist
createdb() {
  local db_name=$1

  set +e # turn off exiting on error for the following statement since we handle the errors on our own
  su postgres -c "psql -lqt | cut -d \| -f 1 | grep -qcw $db_name"
  local exit_status=$?
  set -e
  if [ "$exit_status" -ne 0 ]
  then
    su postgres -c "$PG_LOCATION/createdb $db_name"
  fi
}

# Create a superuser if they do not exist
createuser() {
  set +e # turn off exiting on error for the following statement since we handle the errors on our own
  su postgres -c "psql -tAc 'SELECT 1 FROM pg_roles WHERE rolname=\$\$$DB_USERNAME\$\$;' | grep -q 1"
  local exit_status=$?
  set -e
  if [ "$exit_status" -ne 0 ]
  then
    su postgres -c "psql -c 'CREATE USER $DB_USERNAME WITH SUPERUSER PASSWORD \$\$$DB_PASSWORD\$\$;'"
  fi
}


# --- Database Initialization ---
echo "Setting up the database"
# Create a user that can access the publish and id.webmaker.org databases
createuser
# Create the publish database if it doesn't already exist
createdb "publish"
# Create the id.webmaker.org database if it doesn't already exist
createdb "webmaker_oauth_test"
# ---

cd services


# --- login.webmaker.org setup ---
echo "Setting up login.webmaker.org"
cd login.webmaker.org
cp env.sample .env
sudo npm install --loglevel=error # sudo needed for bcrypt permissions
cd ..
# ---


# --- id.webmaker.org setup and database setup ---
echo "Setting up id.webmaker.org"
cd id.webmaker.org
cp sample.env .env
npm install --unsafe-perm --loglevel=error
su postgres -c "node scripts/create-tables.js"
su postgres -c "psql -d webmaker_oauth_test -f ../../scripts/sql/oauth-setup.sql"
cd ..
# ---


# --- publish.webmaker.org setup and database setup ---
echo "Setting up publish.webmaker.org"
cd publish.webmaker.org
npm run env
npm install --loglevel=error
eval "DATABASE_URL=postgres://$DB_USERNAME:$DB_PASSWORD@localhost:5432/publish npm run migrate"
cd ..
mkdir -p /tmp/mox/test # Serve published projects from here
# ---


# --- Start all dependencies and Thimble in parallel subshells ---
# All output from the 3 services are redirected to server.log files in their respective folders
echo "Starting services"
(cd "$ROOT/services/login.webmaker.org" && npm start > "$ROOT/services/login.webmaker.org/server.log" 2>&1) &
(cd "$ROOT/services/id.webmaker.org" && eval "POSTGRE_CONNECTION_STRING=postgres://$DB_USERNAME:$DB_PASSWORD@localhost:5432/webmaker_oauth_test HOST=0.0.0.0 npm run server" > "$ROOT/services/id.webmaker.org/server.log" 2>&1) &
(cd "$ROOT/services/publish.webmaker.org" && eval "DATABASE_URL=postgres://$DB_USERNAME:$DB_PASSWORD@localhost:5432/publish npm start" > "$ROOT/services/publish.webmaker.org/server.log" 2>&1) &
(cd "$ROOT" && npm install --loglevel=error && npm start)
wait
# ---
