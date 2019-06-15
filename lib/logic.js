// SPDX-License-Identifier: Apache-2.0
//Author : Alban Liénart

'use strict';
/**
 * Defining the namespace for the business network
 */
const NS = 'org.coopact';

/**
 * Transfer share from one owner to another
 * @param {org.coopact.SellShare} tx - The transferShare transaction
 * @transaction
 */
async function sellShare(tx) {

    // Get asset registry for Share
    const shareRegistry = await getAssetRegistry(NS + '.Share');

    // Get participant registry for Cooperateur
    const cooperateurRegistry = await getParticipantRegistry(NS + '.Cooperateur');

    // Get participant registry for CooperateurMoral
    const cooperateurMoralRegistry = await getParticipantRegistry(NS + '.CooperateurMoral');

    // Get participant registry for Cooperative
    const cooperativeRegistry = await getParticipantRegistry(NS + '.Cooperative');

    //if false => we have a CooperateurMoral instead of a Cooperateur
    var flag=true;

    // Get cooperateur ID
    const cooperateurId = tx.cooperateur.getIdentifier();

    // Get coopérative ID
    const cooperativeId = tx.cooperative.getIdentifier();

    // Make sure that cooperateur exists
    const cooperateur = await cooperateurRegistry.get(cooperateurId);
    if (!cooperateur) {
        flag=false;
        cooperateur = await cooperateurMoralRegistry.get(cooperateurId);
        if (!cooperateur) {
            throw new Error(`Le Cooperateur avec l'identifiant ${cooperateurId} n'existe pas`);
        }
    }

    // Make sure that cooperative exists
    const cooperative = await cooperativeRegistry.get(cooperativeId);
    if (!cooperative) {
        throw new Error(`La Cooperative avec l'identifiant ${cooperative} n'existe pas`);
    }

    // we will create as many new shares as number given in 'amount'
    for (var i = 0; i < tx.amount; i++) {

        const newShare = getFactory().newResource(NS, 'Share', Math.random().toString(36).substring(3));
        newShare.value = tx.value;
        newShare.status = 'PURCHASED';
        newShare.PaymentReference = tx.PaymentReference;
        newShare.type = tx.type;
        newShare.owner = tx.cooperateur;
        newShare.company = tx.cooperative;
        //if date==none it means that there was no given emittime. We'll therefore assign the actuel time as emittime
        if (tx.date==='none') {
          newShare.emitTime = new Date();
        }
        //an emit time is given
        else {
          var partsArray = tx.date.split('/');
          newShare.emitTime = new Date(partsArray[2], partsArray[1]-1, partsArray[0], 0, 0);
        }

        //add the new share the the share registry
        await shareRegistry.add(newShare);
        //update the particpant registries. We'll make the difference between cooperateurMoral and cooperateur
        if (flag) {
            await cooperateurRegistry.update(tx.cooperateur);
        } else {
          await cooperateurMoralRegistry.update(tx.cooperateur);
        }
        await cooperativeRegistry.update(tx.cooperative);

        // Create a Share Sale Event
        let shareSaleEvent = getFactory().newEvent(NS, 'ShareSale');
        shareSaleEvent.ShareId = newShare.ShareId;
        shareSaleEvent.seller = tx.cooperative.CompanyNumber;
        shareSaleEvent.buyer = tx.cooperateur.pseudo;

        // Emit the Event
        emit(shareSaleEvent);
  }
}

/**
 * Transfer share from one owner to another
 * @param {org.coopact.ReturnShare} tx - The transferShare transaction
 * @transaction
 */
async function returnShare(tx) {

    // Get asset registry for Share
    const shareRegistry = await getAssetRegistry(NS + '.Share');

    // Get participant registry for Cooperateur
    const cooperateurRegistry = await getParticipantRegistry(NS + '.Cooperateur');

    // Get participant registry for CooperateurMoral
    const cooperateurMoralRegistry = await getParticipantRegistry(NS + '.CooperateurMoral');

    // Get participant registry for Cooperative
    const cooperativeRegistry = await getParticipantRegistry(NS + '.Cooperative');

    //if false => we have a CooperateurMoral instead of a Cooperateur
    var flag =true;

    // Get cooperateur ID
    const cooperateurId = tx.cooperateur.getIdentifier();

    // Get coopérative ID
    const cooperativeId = tx.cooperative.getIdentifier();

    // Make sure that cooperateur exists
    const cooperateur = await cooperateurRegistry.get(cooperateurId);
    if (!cooperateur) {
        // is not a cooperateur, might be a CooperateurMoral
        flag = false;
        cooperateur = await cooperateurMoralRegistry.get(cooperateurId);
        if (!cooperateur) {
          throw new Error(`Le Cooperateur avec l'identifiant ${cooperateurId} n'existe pas`);
        }
    }

    // Make sure that cooperative exists
    const cooperative = await cooperativeRegistry.get(cooperativeId);
    if (!cooperative) {
        throw new Error(`La Cooperative avec l'identifiant ${cooperative} n'existe pas`);
    }

    //create a list with all the shares in the shareRegistry
    const allShares = await shareRegistry.getAll();

    var i =0;
    //list that will contain all the shares that will be sold back to the cooperative and therefore that have to be deleted
    var sharesToDelete = [];
    //go throught the list of all the shares and check if the actual share match the criterai to be deleted
    for (var asset1 of allShares) {
        console.log(`debug1`)
        console.log(asset1)
        if (asset1.type === tx.type && asset1.owner.getIdentifier() === tx.cooperateur.getIdentifier() && asset1.value === tx.value) {
          sharesToDelete.push(asset1);
            i=i+1;
        }
    }
   // if this condition is satisfied, it means that not enough shares match the criteria to be deleted
    if (i<tx.amount) {
        throw new Error(`La coopérative ${tx.cooperative.name} souhaite vendre ${tx.amount} alors que'elle en disposent que ${i} ==> ${asset1.type} === ${tx.type} && ${asset1.owner} === ${tx.cooperateur} && ${asset1.status} === 'PURCHASED' && ${asset1.value} === ${tx.value}`);
    }

    //delete 'amount' shares from the list of candidates to be deleted (=sharesToDelete)
    for (var i = 0; i < tx.amount; i++) {

        const toDel = sharesToDelete[i];

        // Make sure that share exists
        const oldShare = await shareRegistry.get(toDel.getIdentifier());
        if (!oldShare) {
            throw new Error(`La part avec l'identifiant ${toDel.getIdentifier()} n'existe pas. info :${toDel}`);
        }

        // Update share with new owner
        oldShare.owner = tx.cooperative;
        oldShare.status = 'EMIT';


        //remove the share from the shareRegistry
        await shareRegistry.remove(oldShare);
        //update the registries. A difference is made between a cooperateurMoral and a cooperateur
        if (flag) {
          await cooperateurRegistry.update(tx.cooperateur);
        } else {
          await cooperateurMoralRegistry.update(tx.cooperateur);
        }
        await cooperateurRegistry.update(tx.cooperateur);
        await cooperativeRegistry.update(tx.cooperative);

        // Create a Share Sale Event
        let shareSaleEvent = getFactory().newEvent(NS, 'ShareSale');
        shareSaleEvent.ShareId = oldShare.ShareId;
        shareSaleEvent.buyer = tx.cooperative.CompanyNumber;
        shareSaleEvent.seller = tx.cooperateur.pseudo;

        // Emit the Event
        emit(shareSaleEvent);
  }
}


/**
 * Delete all shares and all cooperateurs
 * This functions has been created for developpement purpose
 * @param {org.coopact.CleanAll} tx - The transferShare transaction
 * @transaction
 */
async function cleanAll(tx) {

    // Get asset registry for Share
    const shareRegistry = await getAssetRegistry(NS + '.Share');

    // Get participant registry for Individuals
    const cooperateurRegistry = await getParticipantRegistry(NS + '.Cooperateur');

    //create a list with all the shares in the shareRegistry
    const allShares = await shareRegistry.getAll();

    //create a list with all the cooperateurs in the cooperateurRegistry
    const allCoop = await cooperateurRegistry.getAll();


    //make list of all the shares to delete
    var sharesToDelete = [];
    for (var asset1 of allShares) {
          sharesToDelete.push(asset1);
    }
    //make list of all the cooperateurs to delete
    var coopToDelete = [];
    for (var asset2 of allCoop) {
          coopToDelete.push(asset2);
    }

    //delete all shares
    for (var i = 0; i < sharesToDelete.length; i++) {

        const toDel = sharesToDelete[i];

        // Make sure that share exists
        const oldShare = await shareRegistry.get(toDel.getIdentifier());
        if (!oldShare) {
            throw new Error(`La part avec l'identifiant ${toDel.getIdentifier()} n'existe pas. info :${toDel}`);
        }
        await shareRegistry.remove(oldShare);
  }

  //delete all cooperateurs
  for (var j = 0; j < coopToDelete.length; j++) {

      const toDel2 = coopToDelete[j];

      // Make sure that share exists
      const oldCoop = await cooperateurRegistry.get(toDel2.getIdentifier());
      if (!oldCoop) {
          throw new Error(`Le cooperateur avec l'identifiant ${toDel2.getIdentifier()} n'existe pas. info :${toDel2}`);
      }
      await cooperateurRegistry.remove(oldCoop);
}
}
