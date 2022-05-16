const NftID = artifacts.require('NftID')
const NFTID_ADDR = '0x0743b5faC37f8f73B49E6C1934C116aF95D93d66'



module.exports = async (done) => {
    try {

        const [account] = await web3.eth.getAccounts()
        console.log('account: ',account)
        const nft_id_contract = await NftID.at(NFTID_ADDR)

        const id = await nft_id_contract.tokenURIOfOwner(account)
        console.log("id of owner: ", id)

    } catch (e) {
    
        console.log("message", e)
    }

    done()
}