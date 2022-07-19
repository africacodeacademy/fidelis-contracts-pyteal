const express = require("express");
const compression = require("compression");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const lusca = require("lusca");
const logger = require("morgan");

const app = express();

dotenv.config({
  path: ".env",
});

app.use(
  cors({
    origin: "*",
  })
);

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  bodyParser.json({
    limit: "10mb",
  })
);

app.use(
  bodyParser.urlencoded({
    extended: false,
    limit: "10mb",
  })
);

app.use(logger("dev"));

app.use(session({ secret: process.env.SESSION_SECRET ?? 'testsecret' })); //implementation in session deprecated

app.use(xss());

//sanitize requests against special chars, some precaution against NoSQL Injection Attacks
app.use(mongoSanitize());

app.set("host", "0.0.0.0" || "127.0.0.1");
app.set("port", process.env.PORT || 8081);

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: {
      // maxAge: 1209600000,
      secure: true,
    }, // two weeks in milliseconds
  })
);

app.use(compression());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(cookieParser(process.env.SESSION_SECRET));
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.disable("x-powered-by");

const MongoDBConnect = require("./utils/db.js");

const walletController = require("./controllers/walletController");
const assetController = require("./controllers/assetController");
const loansController = require("./controllers/loanController");
const testRoutes = require("./tests/testRoutes");

app.post(`/mint/trusttokens`, assetController.mintTrustTokensAsset);
app.post(`/mint/backertokens`, assetController.mintBackerTokensAsset);
app.post(`/wallet`, walletController.registerUserWallet);
app.get(`/wallet`, walletController.getWalletDetails);
app.get(`/wallet/transactions`, walletController.fetchAccountTransactions);
app.post(`/wallet/send`, walletController.transaferPoints);
app.get(`/wallets`, walletController.getWallets);

app.post(`/loans/create`, loansController.createLoan);
app.post(`/loans/payment`, loansController.payment);
app.use(`/testRoutes`, testRoutes);

// app.post(`/loans/close`, loansController.createLoan);
// app.post(`/loans/default`, loansController.createLoan);

// app.get(`/init`, async (req, res, next) => {
//   const algosdk = require("algosdk");

//   // let algodclient = new algosdk.Algodv2(
//   //   process.env.KDM_TOKEN,
//   //   process.env.ALGODSERVER,
//   //   ALGODPORT.port
//   // );

//   console.log(
//     "========================TOKEN_RESERVE_ADDRESS====================="
//   );
//   let account = algosdk.generateAccount();
//   console.log("Account Address: ", account.addr);

//   let mn = algosdk.secretKeyToMnemonic(account.sk);
//   console.log("Account Mnemonic: ", mn);

//   var sk = algosdk.mnemonicToSecretKey(mn);
//   console.log("Account sk: ", sk);

//   console.log("========================ADMIN_ADDRESS=====================");
//   let account2 = algosdk.generateAccount();
//   console.log("Account Address: ", account2.addr);

//   let mn2 = algosdk.secretKeyToMnemonic(account2.sk);
//   console.log("Account Mnemonic: ", mn2);

//   var sk2 = algosdk.mnemonicToSecretKey(mn2);
//   console.log("Account sk: ", sk2);
// });

// app.get(`/test2`,  async (req, res, next) =>{
//     const algosdk = require('algosdk');

//     const kdm_client = new algosdk.Kmd(process.env.KDM_TOKEN, process.env.KDM_SERVER, process.env.KDM_PORT)

//     let wallets = await kdm_client.listWallets()

//     // const kdm_client = new algosdk.Kmd(process.env.KDM_TOKEN, process.env.KDM_SERVER, process.env.KDM_PORT)

//     // let wallet_password = "" // find better way of creating wallet passwords
//     // // let wallhandle= await kdm_client.listWallets()
//     // let wallethandle = (await kdm_client.initWalletHandle("da0abddc87f42070013bb8164700e3e6", wallet_password)).wallet_handle_token;
//     // console.log("Got wallet handle:", wallethandle);
//     // let accountKey = (await kdm_client.exportKey(wallethandle, wallet_password, "QPAGXU4K5P7KAKGJY45QC5TJRLY2R2SM35ZI54Y2EZHOBMYLSLVH7WIPNE")).private_key;
//     // console.log("Got wallet handle:", accountKey);
//     // let mnemonic = (await algosdk.secretKeyToMnemonic(accountKey));
//     // let sk = new Uint8Array(
//     //     accountKey

//     //   );
//     // console.log(sk.toString())
//     // return res.send(sk.toString())
//     res.send(wallets)
// })

// app.get(`/test`,  async (req, res, next) =>{
//     const {
//         walletId,
//         addr
//     } = req.query

//     const algosdk = require('algosdk');

//     const kdm_client = new algosdk.Kmd(process.env.KDM_TOKEN, process.env.KDM_SERVER, process.env.KDM_PORT)

//     let wallet_password = "" // find better way of creating wallet passwords
//     // let wallets = await kdm_client.listWallets();
//     let wallethandle = (await kdm_client.initWalletHandle("c6ab8e7db13972a365b8135c706267a7", wallet_password)).wallet_handle_token;
//     console.log("Got wallet handle:", wallethandle);
//     let accountKey = (await kdm_client.exportKey(wallethandle, wallet_password, addr)).private_key;
//     console.log("Got wallet handle:", accountKey);
//     let mnemonic = (await algosdk.secretKeyToMnemonic(accountKey));
//     let sk = new Uint8Array(
//         accountKey

//       );
//     console.log(sk.toString())
//     return res.send({mnemonic:mnemonic, sk:sk.toString()})
//     // res.send(wallethandle)
// })

app.listen(app.get("port"), () => {
  console.log(
    "App is running at http://localhost:%d in %s mode",
    app.get("port"),
    app.get("env")
  );
  if (process.env.NODE_ENV === "development")
    console.log("  Press CTRL-C to stop\n");
});
