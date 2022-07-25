const algosdk = require("algosdk");

const my_acc = algosdk.generateAccount()
console.log("Account created, Save address and mnemonic");

console.log(`Acc address: ${my_acc.addr}`);

let acc_mnemonic = algosdk.secretKeyToMnemonic(my_acc.sk);
console.log(`Account mnemonic: ${acc_mnemonic}`);

//acc
//"IQDPRKBXGWTC3UQ25JJOBQVGKQSV3B55XR4YSZV6TPYE5V3XI3S7ZRECHM" //agent
//"hurdle crash pair soul issue estate solution economy hospital frog cinnamon enemy reveal like remain interest off token fiber century corn discover predict absent drink"


// acc
//"V6PZQZ3DPRALNRK6EPPNFRK2NF5DI3VNZBX4C5VEQDCYORSJTK2PYHWQVQ"
//"lift insane audit subject liar celery wreck mixed crater peace chief forum injury student beyond seven virtual remove outside strong asset shallow supply absent shock"

// acc

//"6MYSPXEKKMAW4SMTCNXPF3QDTWQBY2Z4YTFXUUYWSLR2EOJHV66XNXLY5E"

//"arrest hedgehog toilet expose beef powder vast just cost pink coffee round evolve decade shell glare hunt cousin stay pioneer execute close drive able denial"

//acc receiver
//"4LA4LGD2IY4KJPLPK4W4L5VJZCSIAHWVGVFHQ7MQHVY7PPVHFAU3UM3YYY"

// "list merit round cruel observe essence embark vendor hybrid satisfy oblige menu lava exile crane pact wing film salute half whisper recipe era abstract region"