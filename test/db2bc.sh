#!/bin/bash
echo "Bash version ${BASH_VERSION}..."
#---------------------------------------------------
#author : Alban Liénart
#date : 13/05/2019
#---------------------------------------------------
# The script convert an excel file (=a database of cooperateurs) to csv and then read each line of the csv file in order to send to the blockchain new cooperateurs and their shares
#---------------------------------------------------
# DATA TO EDIT

#database to convert
input_file_name=DB/full_database.xlsx

#number of headings row
headings=1

# !! Pay attention to the order of the different fields in the database !!

#------------------------------------------------------

echo "Bonjour, quel est l'identifiant de la coopérative que vous essayez d'importer sur la blockchain?"
echo "(entrez l'ID puis tappez sur la touche ENTER)"
read coop_ID

var=`curl -s -X GET --header 'Accept: application/json' 'http://localhost:3000/api/Cooperative/coop001' | jq -r '.name'`

if [[ "$var" == "Error" ]]
then
  #Not a valid ID
  echo "ERROR : L'ID fourni n'est pas valide. L'exécution de ce programme va s'arrêter."
  exit 1
fi
echo "Nous allons donc analyser le registre d'actionnaire de : ${var}"

#------------------------------------------------------

#temporary file to work with
output=out.csv
temp_out=temp_out.csv

#convert xlsx file to csv
ssconvert $input_file_name $output >out 2>&1 >log.txt

echo "convertion done"

#number of lines in the database
size=$(csvtool height $output)

#drop the heading lines
csvtool drop $headings $output > $temp_out

for i in $(seq 1 $(($size-$headings)))
	do
		cp $temp_out $output
		line=`csvtool head 1 $output`
		echo " "
		echo "#####################################"
		echo "Line ${i} : ${line}"
		echo "#####################################"
		echo " "
		csvtool drop 1 $output > $temp_out

		#I have now in 'line' the complete data for one person
		#We will divide it in different variables
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

		#echo " == ${firstName} "
		#echo " == ${pseudo} "
		#echo " == ${id} "
		#echo " == ${name} "
		#echo " == ${email} "
		#echo " == ${addressLine} "
		#echo " == ${locality} "
		#echo " == ${postCode} "



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

	done

rm $output
rm $temp_out
