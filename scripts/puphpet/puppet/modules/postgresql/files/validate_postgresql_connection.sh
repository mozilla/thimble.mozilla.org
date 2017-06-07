#!/bin/sh

# usage is: validate_db_connection 2 50 psql

SLEEP=$1
TRIES=$2
PSQL=$3

STATE=1

c=1

while [ $c -le $TRIES ]
do
  echo $c
  if [ $c -gt 1 ]
  then
    echo 'sleeping'
    sleep $SLEEP
  fi

  /bin/echo "SELECT 1" | $PSQL
  STATE=$?

  if [ $STATE -eq 0 ]
  then
    exit 0
  fi
$c++
done

echo 'Unable to connect to postgresql'

exit 1
