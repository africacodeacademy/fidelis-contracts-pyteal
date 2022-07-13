const transactionUtilities = require("./transaction");
const algosdk = require("algosdk");
const Wallet = require("../models/Wallet");
const mongoose = require("mongoose"),
  ObjectId = mongoose.Types.ObjectId;

/**
 * TO DO:
 *
 * freeze wallet
 *
 */

/**
 * createWallet
 *
 * @param {String} uniqueIdentifier
 * @returns
 */
exports.createWallet = async (uniqueIdentifier) => {
  try {
    const kdm_client = new algosdk.Kmd(
      process.env.KDM_TOKEN,
      process.env.KDM_SERVER,
      process.env.KDM_PORT
    );

    let wallet_password = uniqueIdentifier; // find better way of creating wallet passwords

    let walletId = (
      await kdm_client.createWallet(
        uniqueIdentifier,
        wallet_password,
        "",
        "sqlite"
      )
    ).wallet.id;
    // console.log("new wallet >> ", newWallet)

    let wallethandle = (
      await kdm_client.initWalletHandle(walletId, wallet_password)
    ).wallet_handle_token;
    console.log("Got wallet handle:", wallethandle);

    let account = await kdm_client.generateKey(wallethandle);

    let accountKey = (
      await kdm_client.exportKey(wallethandle, wallet_password, account.address)
    ).private_key;
    let mnemonic = await algosdk.secretKeyToMnemonic(accountKey);
    // console.log("accountKey:", accountKey);
    // console.log("Created new account:", account);
    // console.log("Created new account:", account.address);

    const token_reserve_address = process.env.TOKEN_RESERVE_ADDRESS;
    const token_reserve_sk = new Uint8Array(
      process.env.TOKEN_RESERVE_SK.split(",")
    );
    const trust_token_asset_id = parseInt(
      process.env.TRUST_TOKEN_RESERVE_ASSETID
    );
    const backer_token_asset_id = parseInt(
      process.env.BACKER_TOKEN_RESERVE_ASSETID
    );

    let first_seed = await transactionUtilities.seedAccWithAlgos(
      account.address
    );
    //TODO: seed backer tokens
    let backerTokenInfo = await transactionUtilities.transferTokens(
      account.address,
      token_reserve_address,
      token_reserve_sk,
      accountKey,
      25,
      trust_token_asset_id,
      "Fidelis trus token seed txn"
    );
    //TODO: seed trust tokens
    let trustTokenInfo = await transactionUtilities.transferTokens(
      account.address,
      token_reserve_address,
      token_reserve_sk,
      accountKey,
      25,
      backer_token_asset_id,
      "Fidelis backer token seed txn"
    );
    // save wallet info to db
    // let account_info = await algod_client.accountInformation(account.address).do();
    // console.log(account_info)

    var walletInfo = await this.getWalletInfo(account.address);

    const wallet = await new Wallet({
      user: uniqueIdentifier,
      address: account.address,
      sk: new Uint8Array(accountKey).toString(),
      account_mnemonic: mnemonic,
    }).save();

    walletInfo["account_mnemonic"] = mnemonic;
    walletInfo["sk"] = new Uint8Array(accountKey).toString();

    return walletInfo;
  } catch (err) {
    console.log("err", err);
    return Promise.reject(err);
  }
};

/**
 * getWalletInfo
 *
 * @param {String} address Wallet Id
 * @returns
 */
exports.getWalletInfo = async (address) => {
  try {
    const algod_server = process.env.ALGODSERVER;
    const algod_port = process.env.ALGODPORT;
    const algod_token = process.env.ALGOD_TOKEN;

    let algod_client = new algosdk.Algodv2(
      algod_token,
      algod_server,
      algod_port,
      { "x-api-key": algod_token }
    );

    let account_info = await algod_client.accountInformation(address).do();
    let account_assets = account_info.assets.map((asset) => {
      if (asset["asset-id"] == process.env.TRUST_TOKEN_RESERVE_ASSETID) {
        return { ...asset, "asset-name": "Fidelis Trust", unitName: "FTT" };
      } else if (
        asset["asset-id"] == process.env.BACKER_TOKEN_RESERVE_ASSETID
      ) {
        return { ...asset, "asset-name": "Fidelis Backer", unitName: "FBT" };
      } else {
        return asset;
      }
    });
    account_info["assets"] = account_assets;
    delete account_info["amount-without-pending-rewards"];
    delete account_info["apps-total-schema"];
    delete account_info["pending-rewards"];
    delete account_info["reward-base"];
    delete account_info["rewards"];

    return account_info;
  } catch (err) {
    console.log("err", err);
    return Promise.reject(err);
  }
};

/**
 * getAllWallets
 *
 * need to sync block chain wallets with local data
 * @returns
 */
exports.getAllWallets = async () => {
  try {
    //Connect to algo clients
    const algod_server = process.env.ALGODSERVER;
    const indexer_port = process.env.INDEXERPORT;
    const algod_token = process.env.ALGOD_TOKEN;

    let indexer = new algosdk.Indexer(algod_token, algod_server, indexer_port);
    let accounts = await indexer.searchAccounts().do();

    accounts = accounts.map((account) => {
      let assets = account.assets.map((asset) => {
        if (asset["asset-id"] == process.env.TRUST_TOKEN_RESERVE_ASSETID) {
          return { ...asset, "asset-name": "Fidelis Trust", unitName: "FTT" };
        } else if (
          asset["asset-id"] == process.env.BACKER_TOKEN_RESERVE_ASSETID
        ) {
          return { ...asset, "asset-name": "Fidelis Backer", unitName: "FBT" };
        } else {
          return asset;
        }
      });

      account.assets = assets;
      return account;
    });
    return accounts;
  } catch (err) {
    console.log("err", err);
    return Promise.reject(err);
  }
};

exports.freezeWalletAssets = async () => {
  try {
    //Connect to algo client
    const algod_server = process.env.ALGODSERVER;
    const indexer_port = process.env.INDEXERPORT;
    const algod_token = process.env.ALGOD_TOKEN;

    // let indexer = new algosdk.Indexer(algod_token, algod_server, indexer_port)
    // let accounts = await indexer
  } catch (err) {
    console.log("err", err);
    return Promise.reject(err);
  }
};
