# blockchain_service.py
# Handles all read and write interactions with the deployed CertificateVerifier contract.

import os
import json
from pathlib import Path
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# --- CONFIGURATION (MUST BE VERIFIED) ---

# The address of your deployed contract on Sepolia
# UPDATE THIS IF YOU REDEPLOY THE CONTRACT
CONTRACT_ADDRESS = "0x762790707213673e44D920e7f4E00F167D03956a" 

# Load necessary secrets from environment
SEPOLIA_RPC_URL = os.environ.get("SEPOLIA_RPC_URL")
ISSUER_PRIVATE_KEY = os.environ.get("ISSUER_PRIVATE_KEY")

# --- ARTIFACT LOADING ---

# The path should point to the .json file containing the ABI
ABI_DIR = Path(__file__).parent.parent / "contracts" / "artifacts" / "contracts" / "CertificateVerifier.sol"
ABI_FILE_PATH = ABI_DIR / "CertificateVerifier.json"

try:
    with open(ABI_FILE_PATH, 'r') as f:
        CONTRACT_ARTIFACT = json.load(f)
        CONTRACT_ABI = CONTRACT_ARTIFACT['abi']
        print("[BLOCKCHAIN] Contract ABI loaded successfully.")
except FileNotFoundError:
    print(f"FATAL: ABI file not found at {ABI_FILE_PATH}. Ensure the contract is compiled.")
    CONTRACT_ABI = []
    # If the file is missing, we let the EnvironmentError handle the failure

# --- ACCOUNT SETUP ---

# Check critical variables
if not ISSUER_PRIVATE_KEY or not SEPOLIA_RPC_URL:
    raise EnvironmentError("Blockchain keys (RPC URL or PRIVATE KEY) are missing in .env.")

# Derive the Issuer Account object from the Private Key for transaction signing
ISSUER_ACCOUNT = Account.from_key(ISSUER_PRIVATE_KEY)

# --- WEB3 INITIALIZATION ---

def get_web3_issuer_instance():
    """Initializes the Web3 client for the Issuer (WRITE/TRANSACT operations)."""
    if not CONTRACT_ABI:
        return None, None
        
    try:
        w3 = Web3(Web3.HTTPProvider(SEPOLIA_RPC_URL))

        contract_instance = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)
        return w3, contract_instance

    except Exception as e:
        print(f"[BLOCKCHAIN] Issuer Web3 initialization error: {e}")
        return None, None


def get_web3_verifier_instance():
    """Initializes the Web3 client for Verifiers (READ/VIEW operations)."""
    if not CONTRACT_ABI:
        return None
        
    try:
        w3 = Web3(Web3.HTTPProvider(SEPOLIA_RPC_URL))
        # No signing middleware needed for read operations
        contract_instance = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)
        return contract_instance

    except Exception as e:
        print(f"[BLOCKCHAIN] Verifier Web3 initialization error: {e}")
        return None

# --- PUBLIC FUNCTIONS (The Core Service) ---

def register_hashes_on_blockchain(hashes: list) -> list:
    """
    Function to register a list of hashes (bytes32) on the smart contract.
    Requires the Issuer's Private Key to sign transactions.
    """
    w3, contract = get_web3_issuer_instance()
    if not w3 or not contract:
        return [{"hash": h, "status": "ERROR", "tx_hash": "Connection Failed"} for h in hashes]

    # Get the current nonce and gas price once for the batch
    try:
        nonce = w3.eth.get_transaction_count(ISSUER_ACCOUNT.address)
        gas_price = w3.eth.gas_price
    except Exception as e:
        print(f"[BLOCKCHAIN] Failed to fetch nonce/gasPrice: {e}")
        return [{"hash": h, "status": "ERROR", "tx_hash": "Gas/Nonce Fetch Failed"} for h in hashes]


    results = []
    for i, hash_str in enumerate(hashes):
        # Skip if hash is empty or not 0x prefixed
        if not hash_str or not hash_str.startswith("0x"):
            results.append({"hash": hash_str, "status": "SKIPPED", "tx_hash": "Invalid Format"})
            continue
            
        try:
            # 1. Convert 0x-prefixed string hash to bytes32 expected by Solidity
            certificate_hash_bytes32 = w3.to_bytes(hexstr=hash_str)
            
            # 2. Build the transaction
            unsigned_tx = contract.functions.registerHash(certificate_hash_bytes32).build_transaction({
                'from': ISSUER_ACCOUNT.address,
                'gas': 300000,
                'gasPrice': gas_price,
                'nonce': nonce + i,  # Increment nonce for each transaction in the batch
            })

            # 3. Sign and send the raw transaction (Web3 v6 uses raw_transaction)
            signed_tx = w3.eth.account.sign_transaction(unsigned_tx, private_key=ISSUER_PRIVATE_KEY)
            raw_tx = getattr(signed_tx, "raw_transaction", None) or signed_tx.rawTransaction
            tx_hash = w3.eth.send_raw_transaction(raw_tx)

            # 4. Wait for the transaction to be mined
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

            results.append({
                "hash": hash_str,
                "status": "SUCCESS" if receipt.status == 1 else "FAILED",
                "tx_hash": tx_hash.hex(),
                "block_number": receipt.blockNumber
            })
            print(f"[BLOCKCHAIN] Registered hash {hash_str[:10]}... TX: {tx_hash.hex()}")

        except Exception as e:
            print(f"[BLOCKCHAIN] Failed to register hash {hash_str}: {e}")
            results.append({"hash": hash_str, "status": "FAILED", "tx_hash": str(e)})

    return results


def verify_hash_on_blockchain(certificate_hash: str) -> bool:
    """
    Function to check if a hash is registered on the blockchain (Read-only).
    Requires the hash to be provided as a 0x-prefixed string.
    """
    contract = get_web3_verifier_instance()
    if not contract:
        print("[BLOCKCHAIN] Verification connection failed.")
        return False

    # Perform basic hash format check (32 bytes + 0x)
    if not certificate_hash or not certificate_hash.startswith("0x") or len(certificate_hash) != 66:
        print(f"[BLOCKCHAIN] Invalid hash format received: {certificate_hash}")
        return False

    try:
        # Convert the 0x-prefixed hash string to bytes32 format for web3.py
        certificate_hash_bytes32 = Web3.to_bytes(hexstr=certificate_hash)
        
        # Call the view function (read-only, gas-free)
        is_registered = contract.functions.verifyHash(certificate_hash_bytes32).call()
        
        return is_registered

    except Exception as e:
        print(f"[BLOCKCHAIN] Error calling verifyHash: {e}")
        return False