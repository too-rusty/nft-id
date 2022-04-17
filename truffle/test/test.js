const { ether, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { inTransaction } = require("@openzeppelin/test-helpers/src/expectEvent");

const { expect } = require("chai");

const NftID = artifacts.require("NftID")

const SIGNER_PRIVATE = 'fe31a10ab3ce16793e318f93eaea129f9858a7ff14e9558aff41d4d191233618'
const SIGNER_PUBLIC = web3.utils.toChecksumAddress('0x2befe052cb9fe550495170c2d16a04c6e6561b7b')


contract("Something", async (accounts) => {
    
    const [admin, user] = accounts;

    describe("when contract is deployed", async () => {
        before(async () => {
            this.nftID = await NftID.new()
            await this.nftID.toggleState()
            await this.nftID.setSigner(SIGNER_PUBLIC)
        })

        it("should have correct params", async () => {
            const signer = web3.utils.toChecksumAddress(await this.nftID.signer())
            expect(signer).to.be.equal(SIGNER_PUBLIC)
        })

        it("should mint NftID", async () => {
            const ipfsHash = "IPFS_HASH"
            const nonce = await this.nftID.nonce()
            const encoded = web3.eth.abi.encodeParameters(
                ["string", "uint256", "address"],
                [ipfsHash, nonce, this.nftID.address]
            )
            
            const hash = web3.utils.keccak256(encoded)
            const signedHash = await web3.eth.accounts.sign(hash, SIGNER_PRIVATE)

            await this.nftID.mintNftID(
                ipfsHash, signedHash["v"], signedHash["r"], signedHash["s"], { from: user }
            )

            const obj = await this.nftID.tokenURIOfOwner(user)
            
            expect(obj['0']).to.be.equal('https://ipfs.io/ipfs/IPFS_HASH')

        })
        
        it("should update NftID to latest minted", async () => {
            const ipfsHash = "IPFS_HASH_UPDATED"
            const nonce = await this.nftID.nonce()
            const encoded = web3.eth.abi.encodeParameters(
                ["string", "uint256", "address"],
                [ipfsHash, nonce, this.nftID.address]
            )
            
            const hash = web3.utils.keccak256(encoded)
            const signedHash = await web3.eth.accounts.sign(hash, SIGNER_PRIVATE)

            await this.nftID.mintNftID(
                ipfsHash, signedHash["v"], signedHash["r"], signedHash["s"], { from: user }
            )

            const obj = await this.nftID.tokenURIOfOwner(user)
            
            expect(obj['0']).to.be.equal('https://ipfs.io/ipfs/IPFS_HASH_UPDATED')
            expect(await this.nftID.getIdOfOwner(user)).to.be.bignumber.equal("2")

        })

    })

})