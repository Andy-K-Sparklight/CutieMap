/*
Income data: string[]
[0]: type, 0 for query (default) and 1 for operate
[1]: action, 0 for create (default) and 1 for remove, query mode ignored
[2]: network name, query or operate
[3]: host ip and port, query mode ignored
[4]: password, when removing require auth, query mode ignored
[5]: world name, query mode ignored
[6]: description, describe your game, query mode ignored

Response - Operate:
"" - if successful
any - error message

Response - Query:
A {} of <hostip>: []:
[0]: world name
[1]: description
*/

let ROOT = {};
let PWD = {};
const DOMAIN_REGEX =
  /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
module.exports = (args) => {
  if (args.shift() === 1) {
    return operate(args);
  } else {
    return query(args);
  }
};

function operate(restArgs) {
  if (restArgs.shift() === 1) {
    return rm(restArgs);
  } else {
    return add(restArgs);
  }
}
function query(restArgs) {
  console.log("query: " + restArgs);
  restArgs.shift();
  let network = restArgs.shift() || "";
  if (
    (typeof network !== "number" && typeof network !== "string") ||
    network.length === 0 ||
    network.length >= 256
  ) {
    throw "Invalid argument(s)!";
  }
  return ROOT[network];
}

function rm(restArgs) {
  let network = restArgs.shift() || "";
  let hostip = restArgs.shift() || "";
  let password = restArgs.shift() || "none";
  for (let val of [network, hostip, password]) {
    if (
      (typeof val !== "number" && typeof val !== "string") ||
      val.length === 0 ||
      val.length >= 256
    ) {
      console.log("rm: " + restArgs);
      // Actually a hashcode
      throw "Invalid argument(s)!";
    }
  }
  let n = ROOT[network];
  if (!n) {
    throw "No such network!";
  }
  let h = n[hostip];
  if (!h) {
    throw "Not registered!";
  }
  if (PWD[network][hostip] !== password) {
    throw "Invalid password!";
  }
  n[hostip] = undefined;
  PWD[network][hostip] = undefined;
  console.log(`Removed ${hostip} in network ${network}.`);
  return "";
}

function add(restArgs) {
  console.log("add: " + restArgs);
  let network = restArgs.shift() || "";
  let hostip = restArgs.shift() || "";
  let password = restArgs.shift() || "none";
  let worldname = restArgs.shift() || "World";
  let desc = restArgs.shift() || "A Friend's Game";
  for (let val of [network, hostip, password, worldname, desc]) {
    if (
      (typeof val !== "number" && typeof val !== "string") ||
      val.length === 0 ||
      val.length >= 256
    ) {
      // Actually a hashcode

      throw "Invalid argument(s)!";
    }
  }
  if (!validateHost(hostip)) {
    throw "Invalid argument(s)!";
  }
  ROOT[network] = ROOT[network] || {};
  PWD[network] = PWD[network] || {};
  if (ROOT[network][hostip]) {
    throw "Same host already exists!";
  }
  ROOT[network][hostip] = [worldname, desc];
  PWD[network][hostip] = password;
  console.log(`Added ${worldname} in network ${network} from ${hostip}`);
  return "";
}

function validateHost(host) {
  let h = host.split(":");
  if (h.length !== 2) {
    return false;
  }
  let h2 = parseInt(h[1]);
  if (h2.toString() !== h[1]) {
    return false;
  }
  if (h2 < 0 || h2 > 65535) {
    return false;
  }
  return DOMAIN_REGEX.test(h[0]);
}
