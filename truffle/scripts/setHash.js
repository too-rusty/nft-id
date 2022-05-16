


const NftID = artifacts.require('NftID')
const NFTID_ADDR = '0x0743b5faC37f8f73B49E6C1934C116aF95D93d66'
const IPFS_HASH = 'QmXQpw7qq9gdZD9WsP2cj9ko2xiKx3myEfyNpV7hLUES7Z'
const SIGNER_PRIVATE = 'fe31a10ab3ce16793e318f93eaea129f9858a7ff14e9558aff41d4d191233618'
const SIGNER_PUBLIC = web3.utils.toChecksumAddress('0x2befe052cb9fe550495170c2d16a04c6e6561b7b')


module.exports = async (done) => {

    try {

        const [account] = await web3.eth.getAccounts()
        console.log('account: ',account)
        const nft_id_contract = await NftID.at(NFTID_ADDR)

        //activate contract
        // await nft_id_contract.toggleState()

        //set signer public
        // await nft_id_contract.setSigner(SIGNER_PUBLIC)
        
        const nonce = await nft_id_contract.nonce.call()
        console.log('nonce', nonce)

        const encoded = web3.eth.abi.encodeParameters(
            ["string", "uint256", "address"],
            [IPFS_HASH, nonce, NFTID_ADDR]
        )
        
        const hash = web3.utils.keccak256(encoded)
        const signedHash = await web3.eth.accounts.sign(hash, SIGNER_PRIVATE)

        await nft_id_contract.mintNftID(
            IPFS_HASH, signedHash["v"], signedHash["r"], signedHash["s"]
        )


    } catch (e) {
    
        console.log("message", e)
    }

    done()
}