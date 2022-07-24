const algosdk = require("algosdk");

const my_acc = algosdk.generateAccount()
console.log("Account created, Save address and mnemonic");

console.log(`Acc address: ${my_acc.addr}`);

let acc_mnemonic = algosdk.secretKeyToMnemonic(my_acc.sk);
console.log(`Account mnemonic: ${acc_mnemonic}`);

//acc
//"IQDPRKBXGWTC3UQ25JJOBQVGKQSV3B55XR4YSZV6TPYE5V3XI3S7ZRECHM"
//"hurdle crash pair soul issue estate solution economy hospital frog cinnamon enemy reveal like remain interest off token fiber century corn discover predict absent drink"