#!/bin/bash
echo "Bash version ${BASH_VERSION}..."
#---------------------------------------------------
#author : Alban Liénart
#date : 13/05/2019
#---------------------------------------------------


#------------------------------------------------------

echo "Bonjour, nous allons enregistrer un nouveau coopérateur sur la blockchain"
echo "Pour ce faire entrez le champ demandé puis tappez sur la touche ENTER)"

echo " "
echo "firstName"
read firstName

echo " "
echo "name"
read name

echo " "
echo "pseudo"
read pseudo

echo " "
echo "id"
read id

echo " "
echo "email"
read email

echo " "
echo "addressLine"
read addressLine

echo " "
echo "locality"
read locality

echo " "
echo "postCode"
read postCode
#------------------------------------------------------

#----- send curl request---
var_coop=`curl -s -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{
     "$class": "org.coopact.Cooperateur",
     "firstName": "'${firstName}'",
     "pseudo": "'${pseudo}'",
     "id": "'${id}'",
     "name": "'"${name}"'",
     "email": "'${email}'",
     "address": {
       "$class": "org.coopact.Address",
       "addressLine": "'"${addressLine}"'",
       "locality": "'"${locality}"'",
       "postCode": "'${postCode}'"
     }
   }' 'http://localhost:3000/api/Cooperateur' | jq -r '.name'`

echo " "
  echo " "
if [[ "$name" != "$var_coop" ]]
then
  #Not a valid ID
  echo "!!!! ERROR !!!!! : Le coopérateur ${id} n'a pas pu être ajouté sur la blockchain"
  #exit 1
else
  echo "Cooperateur ${id} soumis sur la blockchain."
fi
echo " "
echo " "
