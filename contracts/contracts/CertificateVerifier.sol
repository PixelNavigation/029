// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CertificateVerifier
 * @dev Stores and verifies SHA-256 hashes of standardized certificate data.
 * This contract is deployed once by the Issuing Authority (University).
 */
contract CertificateVerifier {
    // Mapping to store registered certificate hashes. 
    // Key: bytes32 (SHA-256 hash). Value: bool (true if registered).
    mapping(bytes32 => bool) private registeredHashes;

    // The address authorized to register new certificate hashes.
    address public immutable certificateIssuer;

    // Event emitted upon successful registration, useful for tracking in off-chain dApps.
    event CertificateRegistered(bytes32 indexed hash, address indexed registrant, uint256 timestamp);

    /**
     * @dev Sets the deploying address as the only authorized issuer.
     */
    constructor() {
        certificateIssuer = msg.sender;
    }

    /**
     * @dev Restricts a function call to only the designated certificate issuer.
     */
    modifier onlyIssuer() {
        require(msg.sender == certificateIssuer, "CV: Caller is not the designated issuer.");
        _;
    }

    /**
     * @notice Registers a new, unique certificate hash on the blockchain.
     * @dev This is the Gas-consuming, state-changing function.
     * @param _certificateHash The SHA-256 hash (prefixed with 0x).
     */
    function registerHash(bytes32 _certificateHash) public onlyIssuer {
        // Ensure the hash is not already registered (prevent duplicate transactions)
        require(!registeredHashes[_certificateHash], "CV: Hash already registered.");
        
        registeredHashes[_certificateHash] = true;
        
        emit CertificateRegistered(_certificateHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Checks if a certificate hash exists and is valid.
     * @dev This is a Gas-free, read-only function (view).
     * @param _certificateHash The SHA-256 hash to check.
     * @return A boolean indicating if the hash is valid (registered: true).
     */
    function verifyHash(bytes32 _certificateHash) public view returns (bool) {
        return registeredHashes[_certificateHash];
    }
}