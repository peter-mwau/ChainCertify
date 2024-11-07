// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ChainCertifyNFT is ERC721, Ownable {
    uint256 public immutable MAX_SUPPLY;
    uint256 public totalSupply;
    
    string public baseURI;

    struct CertificateNFT {
        string names;
        string institution;
        bytes32 certID;
        string courseName;
        string issueDate;
    }

    mapping(uint256 => CertificateNFT) public certificateDetails;

    event CertificateMinted(uint256 tokenId, address recipient);
    event CertificateRevoked(uint256 tokenId);

    constructor(uint256 _MAX_SUPPLY, string memory _baseURL) ERC721("Institution Name", "ITKN") Ownable(msg.sender) {
        MAX_SUPPLY = _MAX_SUPPLY;
        baseURI = _baseURL;
    }

    // Mint NFT with certificate details
    function mintNFT(
        address to,
        uint256 tokenId,
        string memory _names,
        string memory _institution,
        string memory _courseName,
        string memory _issueDate
    ) external returns (bool) {
        require(totalSupply < MAX_SUPPLY, "Max supply reached");
        require(certificateDetails[tokenId].certID == bytes32(0), "Token ID already exists");

        // Generate a unique certID for the certificate
        bytes32 certID = keccak256(abi.encodePacked(_names, _institution, _courseName, _issueDate, tokenId));

        // Store certificate details
        certificateDetails[tokenId] = CertificateNFT({
            names: _names,
            institution: _institution,
            certID: certID,
            courseName: _courseName,
            issueDate: _issueDate
        });

        // Mint the NFT
        _safeMint(to, tokenId);
        totalSupply++;

        emit CertificateMinted(tokenId, to);
        return true;
    }

    // Override _baseURI function to provide base URI
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    // Function to retrieve certificate details by tokenId
    function getCertificateDetails(uint256 tokenId) external view returns (CertificateNFT memory) {
        require(certificateDetails[tokenId].certID != bytes32(0), "Certificate does not exist");
        return certificateDetails[tokenId];
    }

    // Function to revoke (burn) the certificate (NFT) by the owner
    function revokeCertificate(uint256 tokenId) external onlyOwner {
        require(certificateDetails[tokenId].certID != bytes32(0), "Certificate does not exist");

        // Remove the certificate details from the mapping
        delete certificateDetails[tokenId];

        // Burn the NFT (revoking it)
        _burn(tokenId);
        totalSupply--;

        emit CertificateRevoked(tokenId);
    }
}