// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract NftID is ERC721URIStorage, Ownable {

    using Counters for Counters.Counter;
    using ECDSA for bytes32;

    bool public contractState;
    address public signer;
    Counters.Counter public id;
    uint256 public nonce;

    string DEFAULT_GATEWAY;

    mapping(address => uint256) idOfOwner;

    constructor() Ownable() ERC721("NftID", "NFTID") {
        DEFAULT_GATEWAY = "ipfs.io";
    }

    modifier active() {
        require(contractState, "NftID: Contract must be active");
        _;
    }

    function setDefaultGateway(string memory str) external onlyOwner { DEFAULT_GATEWAY = str; }

    function toggleState() external onlyOwner { contractState = !contractState; }

    function setSigner(address _signer) external onlyOwner {
        require(_signer != address(0), 'NftID: signer address cant be null');
        signer = _signer;
    }

    function mintNftID(string calldata ipfsHash, uint8 v, bytes32 r, bytes32 s) external active {

        bytes32 hash = keccak256(abi.encode(ipfsHash, nonce, address(this)));
        bytes32 hashMessage = hash.toEthSignedMessageHash();

        address _signer = ecrecover(hashMessage, v, r, s);
        require(signer == _signer, "NftID: Invalid signature");
        // NFTs are minted from frontend only

        id.increment();
        uint256 currId = id.current();
        idOfOwner[_msgSender()] = currId; // update to latest one
        _safeMint(_msgSender(), currId);
        _setTokenURI(currId, ipfsHash);
    }


    function tokenURIOfOwner(address owner) external view returns(string memory, bool) {
        if (idOfOwner[owner] == 0) { return ("", false); }
        return (tokenURI(idOfOwner[owner]), true);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return concat(concat("https://", DEFAULT_GATEWAY), "/ipfs/");
    }

    function concat(string memory a, string memory b) internal pure returns (string memory) {
        return string(abi.encodePacked(a, b));
    }

    function getIdOfOwner(address owner) public view returns(uint256) {
        return idOfOwner[owner];
    }

    // function tokenURI(uint256 tokenId);


}