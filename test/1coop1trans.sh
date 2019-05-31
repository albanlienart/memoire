#!/bin/bash
echo "Bash version ${BASH_VERSION}..."
#---------------------------------------------------
#author : Alban Liénart
#date : 13/05/2019
#---------------------------------------------------

line="client9,Stark,Oliver,Donec.egestas.Duis@neque.co.uk,Ap #723-6021 Lacus. Av.,Socchieve,7473,23/02/2018,2,381,A"

echo "(entrez l'ID puis tappez sur la touche ENTER)"
read coop_ID

id=$(echo $line | cut -f1 -d,)
		name=$(echo $line | cut -f2 -d,)
		firstName=$(echo $line | cut -f3 -d,)
		email=$(echo $line | cut -f4 -d,)
		addressLine=$(echo $line | cut -f5 -d,)
		locality=$(echo $line | cut -f6 -d,)
		postCode=$(echo $line | cut -f7 -d,)
		date=$(echo $line | cut -f8 -d,)
		amount=$(echo $line | cut -f9 -d,)
		value=$(echo $line | cut -f10 -d,)
		type=$(echo $line | cut -f11 -d,)
		PaymentReference=000/0000/00000
		pseudo=$firstName$name
		name="$name"
		locality="$locality"




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


 
