
const grpc = require('@grpc/grpc-js');
const { connect, hash, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { TextDecoder } = require('node:util');
const cors = require('cors');
const express = require('express');
const app = express();
const port = 4000;

app.use(cors({
    origin: 'http://localhost:4000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'basic');
const mspId = envOrDefault('MSP_ID', 'Org1MSP');

const cryptoPath = envOrDefault(
    'CRYPTO_PATH',
    path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'test-network',
        'organizations',
        'peerOrganizations',
        'org1.example.com'
    )
);

const keyDirectoryPath = envOrDefault(
    'KEY_DIRECTORY_PATH',
    path.resolve(
        cryptoPath,
        'users',
        'User1@org1.example.com',
        'msp',
        'keystore'
    )
);

const certDirectoryPath = envOrDefault(
    'CERT_DIRECTORY_PATH',
    path.resolve(
        cryptoPath,
        'users',
        'User1@org1.example.com',
        'msp',
        'signcerts'
    )
);

const tlsCertPath = envOrDefault(
    'TLS_CERT_PATH',
    path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt')
);

const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'localhost:7051');
const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com');

const utf8Decoder = new TextDecoder();
let gateway;
let contract;

async function initializeFabric() {
    const client = await newGrpcConnection();
    gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        hash: hash.sha256,
        evaluateOptions: () => ({ deadline: Date.now() + 10000 }), 
        endorseOptions: () => ({ deadline: Date.now() + 20000 }), 
        submitOptions: () => ({ deadline: Date.now() + 10000 }), 
        commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
    });

    const network = gateway.getNetwork(channelName);
    contract = network.getContract(chaincodeName);
}


app.post('/ledger/init', async (req, res) => {
    try {
        await contract.submitTransaction('InitLedger');
        res.json({ message: 'Ledger has initialized successfully' });
    } catch (error) {
        console.error('Error initializing ledger:', error);
        res.status(500).json({ error: 'Failed to the initialize ledger you can refer kishoredhondhu@gmail.com', details: error.message });
    }
});

app.get('/assets', async (req, res) => {
    try {
        const resultBytes = await contract.evaluateTransaction('GetAllAssets');
        const result = JSON.parse(utf8Decoder.decode(resultBytes));
        res.json(result);
    } catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).json({ error: 'Failed to retrieve assets  you can refer kishoredhondhu@gmail.com', details: error.message });
    }
});

app.post('/asset', async (req, res) => {
    const { id, dealerId, msisdn, mpin, balance, status, transAmount, transType, remarks } = req.body;
    if (!id || !dealerId || !msisdn || !mpin || balance === undefined || !status) {
        return res.status(400).json({ error: 'Pls Fill the required fields' });
    }

    try {
        await contract.submitTransaction(
            'CreateAsset',
            id,
            dealerId,
            msisdn,
            mpin,
            balance,
            status,
            transAmount.toString(),
            transType,
            remarks
        );
        res.json({ message: `Asset ${id} created successfully` });
    } catch (error) {
        console.error('Error creating asset:', error);
        res.status(500).json({ error: 'Failed to create asset you can refer kishoredhondhu@gmail.com', details: error.message });
    }
});

app.put('/asset', async (req, res) => {
    const { id, dealerId, msisdn, mpin, balance, status, transAmount, transType, remarks } = req.body;
    if (!id || !dealerId || !msisdn || !mpin || balance === undefined || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await contract.submitTransaction(
            'UpdateAsset',
            id,
            dealerId,
            msisdn,
            mpin,
            balance.toString(),
            status,
            transAmount.toString(),
            transType,
            remarks
        );
        res.json({ message: `Asset ${id} updated successfully` });
    } catch (error) {
        console.error('Error updating asset:', error);
        res.status(500).json({ error: 'Failed to update asset you can refer kishoredhondhu@gmail.com', details: error.message });
    }
});

app.post('/asset/transfer', async (req, res) => {
    const { id, newOwner } = req.body;
    try {
        const oldOwner = await contract.submitTransaction('TransferAsset', id, newOwner);
  res.json({ message: `Successfully transferred the asset ${id} from ${oldOwner} to ${newOwner}` });
    } catch (error) {
     console.error('Error transferring asset:', error);
        res.status(500).json({ error: 'Failed to transfer asset you can refer kishoredhondhu@gmail.com' });
    }
});

app.get('/asset/:id', async (req, res) => {
    const { id } = req.params;
    try {
   const resultBytes = await contract.evaluateTransaction('ReadAsset', id);
  const result = JSON.parse(utf8Decoder.decode(resultBytes));
        res.json(result);
    } catch (error) {
  console.error('Error reading asset:', error);
        res.status(500).json({ error: 'Failed to read asset you can refer kishoredhondhu@gmail.com', details: error.message });
    }
});

app.get('/asset/:id/history', async (req, res) => {
    const { id } = req.params;
    try {
    const resultBytes = await contract.evaluateTransaction('GetAssetTransactionHistory', id);
      const result = JSON.parse(utf8Decoder.decode(resultBytes));
        res.json(result);
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        res.status(500).json({ error: 'Failed to retrieve transaction history you can refer kishoredhondhu@gmail.com', details: error.message });
    }
});

async function newGrpcConnection() {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

async function newIdentity() {
    const certPath = await getFirstDirFileName(certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

async function newSigner() {
    const keyPath = await getFirstDirFileName(keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

async function getFirstDirFileName(dirPath) {
    const files = await fs.readdir(dirPath);
    const file = files[0];
    if (!file) {
      throw new Error(`No files in directory: ${dirPath}`);
    }
    return path.join(dirPath, file);
}

function envOrDefault(key, defaultValue) {
    return process.env[key] || defaultValue;
}

app.listen(port, async () => {
    console.log(`Server running at http://localhost:${port}`);
    await initializeFabric();
});
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>API Server</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 700px;
                    margin: auto;
                    padding: 20px;
                    color: #333;
                    background-color: #f9f9f9;
                    line-height: 1.6;
                }
                h1 {
                    color: #2c3e50;
                }
                .intro {
                    background: #e1f5fe;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }
                .endpoint {
                    margin-bottom: 20px;
                    padding: 10px;
                    background: #f0f4f8;
                    border-radius: 5px;
                }
                .endpoint h3 {
                    margin: 0;
                    color: #2980b9;
                    display: flex;
                    align-items: center;
                }
                .endpoint p {
                    margin: 5px 0;
                    color: #555;
                }
                .copy-button {
                    margin-left: 10px;
                    font-size: 0.9em;
                    cursor: pointer;
                    color: #2980b9;
                    background: none;
                    border: none;
                    padding: 2px 5px;
                }
                .example {
                    background: #eaf2f8;
                    padding: 10px;
                    border-left: 3px solid #2980b9;
                    border-radius: 5px;
                    font-family: monospace;
                    color: #333;
                }
                footer {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 0.9em;
                    color: #777;
                }
                footer a {
                    color: #2980b9;
                    text-decoration: none;
                }
            </style>
            <script>
                function copyToClipboard(text) {
                    navigator.clipboard.writeText(text).then(() => {
                        alert('Copied to clipboard!');
                    });
                }
            </script>
        </head>
        <body>
            <h1>Welcome to the API Server</h1>
            <div class="intro">
                <p><strong>Note:</strong> Use Postman or another API client to interact with the endpoints below.</p>
                <p><strong>Last Updated:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <h2>Available Endpoints</h2>
            <div class="endpoint">
                <h3>📝 POST /ledger/init</h3>
                <p>Initializes the ledger with sample data.</p>
                <button class="copy-button" onclick="copyToClipboard('/ledger/init')">Copy URL</button>
            </div>
            <div class="endpoint">
                <h3>🔗 GET /assets</h3>
                <p>Retrieves a list of all assets in the ledger.</p>
                <button class="copy-button" onclick="copyToClipboard('/assets')">Copy URL</button>
            </div>
            <div class="endpoint">
                <h3>📝 POST /asset</h3>
                <p>Creates a new asset. Required fields: id, dealerId, msisdn, mpin, balance, and status.</p>
                <div class="example">Example JSON Payload:<br>
                    <pre>{
    "id": "asset1",
    "dealerId": "dealer1",
    "msisdn": "1234567890",
    "mpin": "1234",
    "balance": 500,
    "status": "active",
    "transAmount": 0,
    "transType": "",
    "remarks": ""
}</pre></div>
                <button class="copy-button" onclick="copyToClipboard('/asset')">Copy URL</button>
            </div>
            <div class="endpoint">
                <h3>🔄 PUT /asset</h3>
                <p>Updates an existing asset with new information.</p>
                <button class="copy-button" onclick="copyToClipboard('/asset')">Copy URL</button>
            </div>
            <div class="endpoint">
                <h3>➡️ POST /asset/transfer</h3>
                <p>Transfers an asset to a new owner. Required fields: id and newOwner.</p>
                <button class="copy-button" onclick="copyToClipboard('/asset/transfer')">Copy URL</button>
            </div>
            <div class="endpoint">
                <h3>🔍 GET /asset/:id</h3>
                <p>Retrieves details for a specific asset by ID.</p>
                <button class="copy-button" onclick="copyToClipboard('/asset/:id')">Copy URL</button>
            </div>
            <div class="endpoint">
                <h3>📜 GET /asset/:id/history</h3>
                <p>Fetches the transaction history for an asset.</p>
                <button class="copy-button" onclick="copyToClipboard('/asset/:id/history')">Copy URL</button>
            </div>
            <footer>
                <p>Need help? Contact: <a href="mailto:kishoredhondhu@gmail.com">kishoredhondhu@gmail.com</a></p>
            </footer>
        </body>
        </html>
    `);
});

