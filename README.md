Blockchain Asset Management System
==================================

Overview
--------

This project implements a blockchain-based system for a financial institution to manage and track assets with security, transparency, and immutability. Assets, represented as accounts with unique attributes, can be created, updated, and queried. Each asset has attributes like DEALERID, MSISDN, MPIN, BALANCE, STATUS, TRANSAMOUNT, TRANSTYPE, and REMARKS. The system supports transaction history retrieval, ensuring an efficient and secure asset management solution.

Features
--------

*   *Asset Creation*: Initialize new assets with specific attributes.
    
*   *Update Asset*: Modify attributes of existing assets.
    
*   *Read Asset*: Query details of a particular asset.
    
*   *Transfer Asset*: Change ownership of assets.
    
*   *Asset History*: Track the transaction history for each asset.
    
*   *Ledger Initialization*: Initialize the ledger with default assets.
    

Project Structure
-----------------

*   *assetTransfer.js*: Defines the core asset management operations on the Hyperledger Fabric network.
    
*   *app.js*: RESTful API server implemented using Express.js for asset management operations, interacting with the blockchain network.
    

Smart Contract: assetTransfer.js
--------------------------------

The AssetTransfer smart contract defines asset operations:

*   *InitLedger*: Initializes the ledger with sample assets.
    
*   *CreateAsset*: Adds a new asset to the ledger.
    
*   *ReadAsset*: Reads and returns the details of an asset.
    
*   *UpdateAsset*: Updates attributes of an existing asset.
    
*   *DeleteAsset*: Deletes an asset from the ledger.
    
*   *TransferAsset*: Transfers ownership of an asset.
    
*   *GetAllAssets*: Retrieves all assets from the ledger.
    
*   *GetAssetTransactionHistory*: Gets the transaction history of a specific asset.
    

## RESTful API Server: app.js

Provides API endpoints to interact with the asset management blockchain application. Key endpoints include:

- *POST* /ledger/init: Initialize the ledger with default assets.
- *GET* /assets: Retrieve all assets in the ledger.
- *POST* /asset: Create a new asset.
- *PUT* /asset: Update an existing asset.
- *POST* /asset/transfer: Transfer an asset's ownership.
- *GET* /asset/:id: Read details of a specific asset.
- *GET* /asset/:id/history: Retrieve the transaction history of a specific asset.

![API Server Diagram](path/to/your-image.png)

    

### Example API Usage

1.  *Initialize Ledger*: POST /ledger/init
    
2. *Create Asset*:
    bash
    curl -X POST http://localhost:4000/asset \
    -H "Content-Type: application/json" \
    -d '{ 
        "id": "asset3", 
        "dealerId": "dealer3", 
        "msisdn": "1122334455", 
        "mpin": "1234", 
        "balance": 500, 
        "status": "active", 
        "transAmount": 0, 
        "transType": "", 
        "remarks": ""
    }'
    

![Create Asset API Diagram](path/to/your-image.png)

3.  *Get All Assets*: GET /assets
![Get Asset API Diagram](path/to/your-image.png)
    
4.  *Transfer Asset*: POST /asset/transfer
    

Environment Variables
---------------------

Set the following environment variables to configure paths and connection details:

*   CHANNEL\_NAME: Hyperledger Fabric channel name (default: mychannel)
    
*   CHAINCODE\_NAME: Chaincode name (default: basic)
    
*   MSP\_ID: Membership Service Provider ID (default: Org1MSP)
    

Prerequisites
-------------

*   *Hyperledger Fabric* network setup
    
*   *Node.js* and *npm* for the application server
    

Getting Started
---------------

1.  Clone the repository and navigate to the project directory.
    
2.  
    bash
    codenpm install
    
    
3.  Configure environment variables for the Hyperledger Fabric network.
    
4.  
    bash 
    codenode app.js
    
5.  Use the provided endpoints to interact with the asset management system.
    

License
-------

This project is licensed under the Apache-2.0 License.

Contact
-------

For further assistance, contact: kishoredhondhu@gmail.com
