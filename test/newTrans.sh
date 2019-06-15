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
echo "type"
read type

echo " "
echo "amount"
read amount

echo " "
echo "value"
read value

echo " "
echo "date (eg: 01/01/2000)"
read date

echo " "
echo "cooperateur id"
read id

echo " "
echo "cooperative ID"
read coop_ID

#------------------------------------------------------

#----- send curl request---
var_share=`curl -s -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{
   "$class": "org.coopact.SellShare",
   "type": "'${type}'",
   "amount": '${amount}',
   "value": '${value}',
   "PaymentReference": "000/0000/00000",
	 "date": "'${date}'",
   "cooperateur": "resource:org.coopact.Cooperateur#'${id}'",
   "cooperative": "resource:org.coopact.Cooperative#'${coop_ID}'"
 }' 'http://localhost:3000/api/SellShare' | jq -r '.type'`

	echo " "
  echo " "
  if [[ "$type" != "$var_share" ]]
  then
    #Not a valid ID
    echo "!!!! ERROR !!!! : Les actions du Cooperateur ${id} n'ont pas pu être inscrit sur la blockchain."
    #exit 1
  else
    echo "Les actions du Cooperateur ${id} ont été inscrit sur la blockchain."
  fi
	echo " "
	echo " "
