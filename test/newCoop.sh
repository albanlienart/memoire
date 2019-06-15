#!/bin/bash
echo "Bash version ${BASH_VERSION}..."
#---------------------------------------------------
#author : Alban Liénart
#date : 13/05/2019
#---------------------------------------------------


#------------------------------------------------------

echo "Bonjour, nous allons enregistrer une nouvelle coopérative sur la blockchain"
echo "Pour ce faire entrez le champ demandé puis tappez sur la touche ENTER)"

echo " "
echo "CompanyNumber"
read CompanyNumber

echo " "
echo "id"
read id

echo " "
echo "name"
read name

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
curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{
   "$class": "org.coopact.Cooperative",
   "CompanyNumber": "'${CompanyNumber}'",
   "id": "'"${id}"'",
   "name": "'"${name}"'",
   "email": "'"${email}"'",
   "address": {
     "$class": "org.coopact.Address",
     "addressLine": "'"${addressLine}"'",
     "locality": "'"${locality}"'",
     "postCode": "'"${postCode}"'"
   }
 }' 'http://localhost:3000/api/Cooperative'

echo " "
echo "La coopérative a bien été ajouté sur la blockchain"
