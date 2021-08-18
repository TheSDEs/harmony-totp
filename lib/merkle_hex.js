//var W3 = require('web3');
const web3utils = require("web3-utils");
function h(a) { return web3utils.soliditySha3({v: a, t: "bytes", encoding: 'hex' }); }

function reduceMT (layer) {
    if (1 == layer.length) return layer[0];

    //console.log(`Tree Dump  ${layer.length}`, layer);
    var reducedLayer = [];
    for (var i = 0; i <= (layer.length / 2) - 1; i++) {
        reducedLayer[i] = h(concatB32(layer[2 * i], layer[2 * i + 1], 32));
    }
    //console.log("layer", reducedLayer)
    return reduceMT(reducedLayer);
}

function reduceMTByOneStep(layer) {
    var reducedLayer = [];
    for (var i = 0; i <= (layer.length / 2) - 1; i++) {
        reducedLayer[i] = h(concatB32(layer[2 * i], layer[2 * i + 1], 32));
    }
    return reducedLayer;
}

function concat(a, b) {
    if (typeof(a) != 'string' || typeof(b) != 'string' || a.substr(0, 2) != '0x' || b.substr(0, 2) != '0x') {
        console.log("a, b = ", a, b)
        throw new Error("ConcatB32 supports only hex string arguments");
    }
    a = hexToBytes(a);
    b = hexToBytes(b);
    var res = []

    for (var i = 0; i < a.length; i++) {
        res.push(a[i])
    }
    for (var i = 0; i < b.length; i++) {
        res.push(b[i])
    }
   return bytesToHex(res);
}

function concatB32(a, b, len) {
    if (typeof(a) != 'string' || typeof(b) != 'string' || a.substr(0, 2) != '0x' || b.substr(0, 2) != '0x') {
        console.log("a, b = ", a, b)
        throw new Error("ConcatB32 supports only hex string arguments");
    }
    
    a = hexToBytes(a);
    b = hexToBytes(b);
    var res = []
    if (a.length != b.length || a.length != len || b.length != len )
        throw new Error("ConcatB32 supports only equally-long ("+ len+") arguments.");

    for (var i = 0; i < a.length; i++) {
        res.push(a[i])
    }
    for (var i = 0; i < b.length; i++) {
        res.push(b[i])
    }
   return bytesToHex(res);
}

// Convert a byte array to a hex string
function bytesToHex(bytes) {
    var hex = [];
    for (i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }
    // console.log("0x" + hex.join(""));
    return "0x" + hex.join("");
}

// Convert a hex string to a byte array
function hexToBytes(hex) {
    var bytes = [];
    for (c = 2; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function cloneArray(arr) {
    ret = []
    for (let i = 0; i < arr.length; i++) {
        ret.push(arr[i])
    }
    return ret
}

MT_LEFT_SIDE = "00";
MT_RIGHT_SIDE = "01";
MT_STUB_SIDE = "FF";

function getProof(leaves, idx, idx_data) {
    var height = Math.log2(leaves.length);
    //console.log("height=", height);
    var ret = [idx_data];
    var retSides = "0x";
    var hashesOfCurLayer = leaves;
    var idxInCurLayer = idx;

    // proceed from bottom to top
    for (let layer = 0; layer < height ; layer++){
        var siblingIdx = (0 == idxInCurLayer % 2) ?  idxInCurLayer + 1 : idxInCurLayer - 1;
        ret.push(hashesOfCurLayer[siblingIdx]);
        retSides += (0 == idxInCurLayer % 2) ?  MT_LEFT_SIDE : MT_RIGHT_SIDE;
        hashesOfCurLayer = reduceMTByOneStep(hashesOfCurLayer);
        idxInCurLayer = Math.floor(idxInCurLayer / 2);
    }
    ret.push(retSides)
    return ret;
}


function reduceAuthPath(proof) {
    var sides = proof[proof.length-1].slice(2);
    var authPath = proof.slice(0, proof.length-1);
    //console.log(authPath)
    for (var i = 1; i < authPath.length; i++) {
        //console.log("side=", sides.slice((i - 1)*2, i*2))
        if(MT_LEFT_SIDE == sides.slice((i - 1)*2, i*2)){
            authPath[0] = h(concatB32(authPath[0], authPath[i], 32));
        } else{
            authPath[0] = h(concatB32(authPath[i], authPath[0], 32));
        }
        //console.log(i, authPath);
    }
    //emit DebugEvent(authPath[0]);
    return authPath[0];
}


module.exports = {
    reduceMT,
    getProof,
    concat,
    concatB32,
    h,
    reduceAuthPath
}

// var res = reduceMT(["0x00000000000000000000000000000000","0x00000000000000000000000000000000"])
// console.log(res);
// console.log(concatB32("0x00000000000000000000000000000000","0x00000000000000000000000000000000"))