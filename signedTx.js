const { Conflux, Transaction } = require('js-conflux-sdk');
const { keccak256 } = require('js-conflux-sdk/src/util/sign');
const program = require('commander');
const cfx = new Conflux({
  url: 'http://testnet-rpc.conflux-chain.org.cn/v2',
  //'http://main.confluxrpc.org/v2',
  //url: 'mainnet-rpc.conflux-chain.org.cn/ws/v2',
  networkId: 1
});

const privateKey = '0x' + 'b919f9d775811912c73831947bab55dccb0d124ca9ae04a42633a27b9ff05925';
const new_owner = cfx.wallet.addPrivateKey(privateKey);
const addr = new_owner.address;
const tx = {
  from: addr,
  gasPrice: 1,
  gas: 21000,
  to: addr,
  value: 0,
  storageLimit: 0,
  epochHeight: 12703164,
  chainId: 1,
}

async function getRawTxHash() {
    let nonce = Number(await cfx.getNextNonce(new_owner.address));
    tx.nonce = nonce;
    let rawTx = new Transaction(tx);
    let encodedRawTx = rawTx.encode(false);
    let hashMsg = keccak256(encodedRawTx);
    console.log(hashMsg.toString('hex'));
}

async function sendRawTx(ethSignResult) {
  tx.r = ethSignResult.slice(0, 66);
  tx.s = '0x' + ethSignResult.slice(66, 66+64);
  tx.v = 1;
  let nonce = Number(await cfx.getNextNonce(new_owner.address));
  tx.nonce = nonce;
  let rawTx = new Transaction(tx);
  let tx_hash = await cfx.sendRawTransaction(rawTx.serialize());
  console.log('tx_hash:', tx_hash);
}

program
  .option('-u, --unsign', 'get unsigned tx_hash')
  .option('-s, --signature [type]', 'sendSignedTx')
  .parse(process.argv);

if(program.unsign) {
  getRawTxHash();
}

if(program.signature) {
  sendRawTx(program.signature);
}
