const { program } = require("commander");
const { Server } = require("ws");
const handle = require("./DataManager");
program.version("1.0.0");
program
  .option("-p, --port <port>", "ws target port")
  .option("-m, --max-payload <number>", "max allowed payload")
  .option("-t, --timeout <ms>", "auto close a connection after");
program.parse(process.argv);
const opts = program.opts();
const timeout = parseInt(opts.timeout) || 5000;
let current = 0;
console.log("Cutie Map Starting...");
const WS = new Server({
  port: parseInt(opts.port),
  maxPayload: parseInt(opts.maxPayload),
});
console.log(
  "Created WS with port " + opts.port + " and payload " + opts.maxPayload
);
WS.on("connection", (sk) => {
  current++;
  console.log("Established new connection, current: " + current);
  let t = setTimeout(() => {
    sk.close();
  }, timeout);
  sk.on("close", () => {
    current--;
    console.log("Closed a connection, current: " + current);
  });
  sk.on("message", (d) => {
    let o = d.toString();
    if (o.length >= 2048) {
      sk.send("Params are TOO long!");
      return;
    }
    try {
      let arr = JSON.parse(o);
      if (!(arr instanceof Array)) {
        throw "Invalid data type!";
      }
      for (let x of arr) {
        if (typeof x !== "string" && typeof x !== "number") {
          throw "Invalid argument(s)!";
        }
      }
      let res = handle(arr);
      if (typeof res === "object") {
        sk.send(JSON.stringify(res));
      } else {
        sk.send(res);
      }
    } catch (e) {
      try {
        sk.send(String(e));
      } catch {}
    } finally {
      clearTimeout(t);
      sk.close(); // Force close
    }
  });
});
