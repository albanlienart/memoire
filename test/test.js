/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common');
const path = require('path');

const expect = require('chai').expect;

const namespace = 'org.coopact';

describe('Sell Share', () => {
    // In-memory card store for testing so cards are not persisted to the file system
    const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore({type: 'composer-wallet-inmemory'});
    let adminConnection;
    let businessNetworkConnection;

    before(async () => {
        // Embedded connection used for local testing
        const connectionProfile = {
            name: 'embedded',
            'x-type': 'embedded'
        };
        // Generate certificates for use with the embedded connection
        const credentials = CertificateUtil.generate({commonName: 'admin'});

        // PeerAdmin identity used with the admin connection to deploy business networks
        const deployerMetadata = {
            version: 1,
            userName: 'PeerAdmin',
            roles: ['PeerAdmin', 'ChannelAdmin']
        };
        const deployerCard = new IdCard(deployerMetadata, connectionProfile);
        deployerCard.setCredentials(credentials);

        const deployerCardName = 'PeerAdmin';
        adminConnection = new AdminConnection({cardStore: cardStore});

        await adminConnection.importCard(deployerCardName, deployerCard);
        await adminConnection.connect(deployerCardName);
    });

    beforeEach(async () => {
        businessNetworkConnection = new BusinessNetworkConnection({cardStore: cardStore});

        const adminUserName = 'admin';
        let adminCardName;
        let businessNetworkDefinition = await BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'));

        // Install the Composer runtime for the new business network
        await adminConnection.install(businessNetworkDefinition);

        // Start the business network and configure an network admin identity
        const startOptions = {
            networkAdmins: [
                {
                    userName: adminUserName,
                    enrollmentSecret: 'adminpw'
                }
            ]
        };
        const adminCards = await adminConnection.start(businessNetworkDefinition.getName(), businessNetworkDefinition.getVersion(), startOptions);

        // Import the network admin identity for us to use
        adminCardName = `${adminUserName}@${businessNetworkDefinition.getName()}`;
        await adminConnection.importCard(adminCardName, adminCards.get(adminUserName));

        // Connect to the business network using the network admin identity
        await businessNetworkConnection.connect(adminCardName);
    });

    describe('#sellShare', () => {

        it('should be able to sell the share', async () => {

            const factory = businessNetworkConnection.getBusinessNetwork().getFactory();

            // create the Cooperative
            const cooperative = factory.newResource(namespace, 'Cooperative', 'coop01');
            cooperative.name = 'Farm';
            cooperative.email = 'hello@farm.com';
            cooperative.CompanyNumber = '0000001';
            cooperative.address = factory.newConcept(namespace, 'Address');
            cooperative.address.addressLine = 'Avenue des Lauriers 17';
            cooperative.address.locality = 'Brussels';
            cooperative.address.postCode = '1150';

            // create the cooperateur
            const cooperateur = factory.newResource(namespace, 'Cooperateur', 'cooperateur01');
            cooperateur.name = 'Focant';
            cooperateur.firstName = 'Valentine';
            cooperateur.email = 'valentine.focant@student.uclouvain.be';
            cooperateur.pseudo = 'valfoc';
            cooperateur.address = factory.newConcept(namespace, 'Address');
            cooperateur.address.addressLine = 'Avenue Louise';
            cooperateur.address.locality = 'Brussels';
            cooperateur.address.postCode = '1000';

            // create the Share owned by the cooperative
            //const share = factory.newResource(namespace, 'Share', 'farm001');
            //share.value = 500;
            //share.status = 'EMIT';
            //share.emitTime = new Date('2018-08-15T11:03:52+00:00');
            //share.lastTransferTime = new Date('2018-08-15T11:03:52+00:00');
            //share.ClassType = 'A';
            //share.PaymentReference = '265/7170/2365';
            //share.owner = factory.newRelationship(namespace, 'Cooperative', cooperative.getIdentifier());
            //share.company = factory.newRelationship(namespace, 'Cooperative', cooperative.getIdentifier());

            // sell share
            const sellShare = factory.newTransaction(namespace, 'SellShare');
            sellShare.type = 'A';
            sellShare.amount = 50;
            sellShare.value = 500;
            sellShare.cooperateur = factory.newRelationship(namespace, 'Cooperateur', cooperateur.getIdentifier());
            sellShare.cooperative = factory.newRelationship(namespace, 'Cooperative', cooperative.getIdentifier());



            // Add the cooperative
            const cooperativeRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Cooperative');
            await cooperativeRegistry.add(cooperative);

            // Add the cooperateur
            const cooperateurRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Cooperateur');
            await cooperateurRegistry.add(cooperateur);

            // Add the share
            //const shareRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Share');
            //await shareRegistry.add(share);

            // submit the sellShare transaction
            await businessNetworkConnection.submitTransaction(sellShare);

            const shareRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Share');

            const allShares = await shareRegistry.getAll();

            var i =0;

            for (const asset of allShares) {

                  // get the share and check its status and owner
                  expect(asset.status).to.be.equal('PURCHASED');
                  expect(asset.type).to.be.equal('A');
                  expect(asset.owner.getIdentifier()).to.be.equal(cooperateur.getIdentifier());
                  i=i+1;

            }

            expect(i).to.be.equal(50);

            // get the share and check its status and owner
            //const newShare = await shareRegistry.get(share.getIdentifier());
            //expect(newShare.status).to.be.equal('PURCHASED');
            //expect(newShare.owner.getIdentifier()).to.be.equal(cooperateur.getIdentifier());
        });
    });
});
