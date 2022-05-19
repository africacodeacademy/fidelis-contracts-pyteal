const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user:{type:String},
    address:{type:String},
    sk:{type:String},
    account_mnemonic :{type:String},
    isFlagged:{type:Boolean, default:false},
    isFrozen:{type:Boolean, default:false},
    backerTokens:{type:Number},
    backerTokenAssetId:{type:Number},
    trustTokens:{type:String},
    trustTokenAssetId:{type:Number}
  },
  {
    read: 'secondaryPreferred',
    timestamps: true,
  }
);




const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
