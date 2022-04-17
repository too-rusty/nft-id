// {
//     name: '',
//     email: '',
//     avatar_url: '',
//     facebook_link: '',
//     twitter_link: '',
//     instagram_link: '',
//     linkedin_link: '',
//     github_link: '',
//     youtube_link: '',
// }


/*
Functions to manage pinata data

1. Push data to pinata and get an IPFS hash, public and private components DONE
2. Update private data in pinata
3. Update public data in pinata and hence the hash .... the update is either done or not done
    if it's done then the hash gets updated and if not then its not updated in the smart contract
4. fetch data from pinata based on the contract address DONE


*/

require('dotenv').config()
const axios = require('axios').default;
const pinataSDK = require('@pinata/sdk');

const PINATA_API_KEY = process.env.PINATA_API_KEY
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY

const pinata = pinataSDK(PINATA_API_KEY, PINATA_SECRET_KEY);


const NFTID_METADATA_STRING = 'NFTID metadata'

const _testAuthentication = () => {
    pinata.testAuthentication().then((result) => {
        //handle successful authentication here
        console.log(result);
    }).catch((err) => {
        //handle error here
        console.log(err);
    });
}

const _hashMetadata = async (ipfsHash, metadata) => {

    // const metadata = {
    //     name: 'new custom name',
    //     keyvalues: {
    //         newKey: 'newValue',
    //         existingKey: 'newValue',
    //         existingKeyToRemove: null
    //     }
    // };
    const tmp = {
        name: NFTID_METADATA_STRING,
        keyvalues: {
            ...metadata
        }
    }
    try {
        const res = await pinata.hashMetadata(ipfsHash, tmp)
        return res
    } catch (error) {
        console.log(`_hashMetadata err: ${error}`)
        throw error
    }

}


const _pinJson = async (jsonBody, options) => {
    // const body = {
    //     message: 'Pinatas are awesome'
    // };
    // const options = {
    //     pinataMetadata: {
    //         name: MyCustomName,
    //         keyvalues: {
    //             customKey: 'customValue',
    //             customKey2: 'customValue2'
    //         }
    //     },
    //     pinataOptions: {
    //         cidVersion: 0
    //     }
    // };

    try {
        const ret = await pinata.pinJSONToIPFS(jsonBody, options)
        return ret
    } catch (err) {
        console.log(`\t\t_pinJson err: ${err}`)
        throw err
    }
}

// Ex: dweb.link, ipfs.io, ninetailed.ninja -> https://docs.ipfs.io/concepts/ipfs-gateway/#gateway-providers
const _getJsonDataFromIpfs = async (ipfsGateway, hash) => {
    const url = `https://${ipfsGateway}/ipfs/${hash}`
    try {
        const res = await axios.get(url)
        return res.data
    } catch (err) {
        console.log(`_getJsonDataFromIpfs err: ${err}\n`)
        throw err
    }
}




// --------------------- PUBLIC FUNCTIONS ------------------------




// Save Json to pinata
// takes the address for which data needs to be pushed, public and private component
// returns ipfs Hash or throws err
const SaveJSON = async (addr, publicData, privateData) => {
    try {

        const options = {
            pinataMetadata: {
                name: NFTID_METADATA_STRING,
                keyvalues: {
                    address: addr,
                    ...privateData
                }
            },
            pinataOptions: {
                cidVersion: 0
            }
        }
        const response = await _pinJson(publicData, options)
        return response.IpfsHash

    } catch (err) {
        console.log(`SaveJSON err: ${err}\n`)
        throw err
    }
}

// update Private json Data
// takes the address and privateData that needs to be updated
// returns true if updated else throws error
const UpdatePrivateDataByAddress = async (addr, newPrivateData) => {
    try {

        const data = await FetchPinataDataByAddress(addr)
        if (data === null) {
            return true
        }
        const tmp = {
            ...data['private'],
            ...newPrivateData
        }

        const res = await _hashMetadata(data['ipfsHash'], tmp)
        return true

    } catch (err) {
        console.log(`UpdatePrivateDataByAddress err: ${err}\n`)
        throw err
    }
}

// update Private json Data
// takes the ipfsHash and privateData that needs to be updated
// returns true if updated else throws error
const UpdatePrivateDataByIpfsHash = async (ipfsHash, privateData) => {
    try {
        
        const data = await FetchPinataDataByAddress(addr)
        if (data === null) {
            return true
        }
        const tmp = {
            ...data['private'],
            ...newPrivateData
        }
        const res = await _hashMetadata(data['ipfsHash'], tmp)
        return true

    } catch (e) {
        console.log(`UpdatePrivateDataByIpfsHash err: ${e}\n`)
        throw e
    }
}

// given an address
// fetch pinata data -> public and private components, null if nothing found
/*
returned structure
{
    public: {
    },
    private: {
    },
    ipfsHash: 'ipfsHash',
    address: 'address'
}

*/
const FetchPinataDataByAddress = async (addr) => {
    
    const metadataFilter = {
        name: NFTID_METADATA_STRING,
        keyvalues: {
            address: {
                value: addr,
                op: 'eq'
            }
        }
    }

    const filters = {
        metadataFilter: metadataFilter,
        status: 'pinned',
        pageLimit: 30,
        pageOffset: 0,
    }

    try {
        const res = await pinata.pinList(filters)
        const arr = res['rows'].filter((data) => {
            return data['metadata']['name'] === NFTID_METADATA_STRING
        })
        if (arr.length > 0) {
            const ipfsHash = arr[0]['ipfs_pin_hash']
            const publicData = await _getJsonDataFromIpfs('ipfs.io', ipfsHash)
            const privateData = await arr[0]['metadata']['keyvalues']
            return {
                ipfsHash: ipfsHash,
                address: privateData['address'],
                public: {
                    ...publicData
                },
                private: {
                    ...privateData
                }
            }
        }
        return null
    } catch (err) {
        console.log(`\t\t_getPins err: ${err}\n`)
        throw err
    }

}

const asyncMain2 = async () => {
    const addr = '0xabcd'
    try {
        const public = {
            name : 'abcd',
            twitter : 'twitter',
            instagram : 'instagram'
        }
        const private = {
            secretName : 'secretname',
            secretTwitter : 'secretTwitter'
        }
        // SAVE data and return ipfs hash
        const res0 = await SaveJSON(addr, public, private)
        console.log(`res0 ${res0}`) // ipfs hash

        // FETCH data
        const res1 = await FetchPinataDataByAddress('0xabcd')
        console.log(`res1 ${JSON.stringify(res1)}`)

        // UPDATE private Data
        const private2 = {
            secretName : 'secretname2',
            secretTwitter : 'secretTwitter'
        }
        await UpdatePrivateDataByAddress(addr, private2)
        const res2 = await FetchPinataDataByAddress('0xabcd')
        console.log(`res2 ${JSON.stringify(res2)}`)

    } catch (err) {
        console.log(`err while saving: ${err}`)
        throw err
    }
}

const main = () => {
    asyncMain2().then((res) => {})
}


main()
