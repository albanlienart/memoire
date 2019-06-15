# memoire
Ce répertoire contient une implémentation d'un réseau [Hyperledger Composer](https://www.hyperledger.org/projects/composer) crée dans le cadre d'un mémoire [CPME](https://uclouvain.be/fr/etudier/cpme) à l'[Université Catholique de Louvain](https://uclouvain.be/fr/index.html).


Le projet ci-présent a été inspirée par le projet [Tuna-Network](https://github.com/hyperledger/education/tree/master/LFS171x/composer-material/tuna-network)

Le but de ce réseau est de créer un réseau sécurisé qui fait office de registre d'actionnaires pour les coopératives. Différentes coopératives peuvent s'enregistrer sur le réseau et générer de parts pour des coopérateurs. Ces derniers peuvent aussi revendre leurs parts aux coopératives et peuvent détenir des parts dans plusieurs coopératives. Tout ça a ete crée avec comme objectif principal d'assurer une sécurité et confidentialité maximal.

Passons en revue l’utilité de chaque fichier :

* logic.js : contient toute la logique de transaction
* org.coopact.cto : contient la définition des biens et des individus  
* permission.acl : contient toutes les permissions accordées aux différents participants 
* queries.qry : contient différentes requêtes qui peuvent être adressées à la base de données            
* package.json : représente la "carte d'identité" du réseau. Contient toutes les spécifications de ce dernier
* full_database.xlsx : une base de données artificielle contenant 400 coopérateurs
* database.xslx : une base de données artificielle contenant 10 coopérateurs  
* db2bc.sh : Script utilisé pour transformer les bases de données sous format Excel vers la blockchain             
* newCoop.sh : crée une nouvelle coopérative sur la blockchain            
* test.js : démarre un test indépendant              
* newCooperateur.sh : crée un nouveau coopérateur 
* newTrans.sh : crée une nouvelle transaction sur la blockchain
* admin@coopact-network.card : carte d'accès au réseau en tant qu'administrateur 
* coopact-network@0.1.2.bna : fichier compilé qui contient tous le chaincode de la blockchain



## License
This code pattern is licensed under the Apache Software License, Version 2. Separate third-party code objects invoked within this code pattern are licensed by their respective providers pursuant to their own separate licenses. Contributions are subject to the [Developer Certificate of Origin, Version 1.1 (DCO)](https://developercertificate.org/) and the [Apache Software License, Version 2](https://www.apache.org/licenses/LICENSE-2.0.txt).

[Apache Software License (ASL) FAQ](https://www.apache.org/foundation/license-faq.html#WhatDoesItMEAN)



Auteur: Alban Liénart
© 2019
