const { Defender } = require("@openzeppelin/defender-sdk");

function getProcessEnv(key, print = false) {
  const ret = process.env[key];
  if (!ret) {
    throw new Error(key + " must be exported in env");
  }
  return print ? "X".repeat(ret.length) : ret;
}

const main = async () => {
  key = getProcessEnv("DEFENDER_API_KEY");
  keySecret = getProcessEnv("DEFENDER_API_SECRET");
  const client = new Defender({ apiKey: key, apiSecret: keySecret });

  const monitorsDeleted = await Promise.all(
    await client.monitor
      .list()
      .then((l) => l.items.map((m) => client.monitor.delete(m.monitorId)))
  );
  console.log("Deleted monitors:", monitorsDeleted);
  const actionsDeleted = await Promise.all(
    await client.action
      .list()
      .then((l) => l.items.map((a) => client.action.delete(a.actionId)))
  );
  console.log("Deleted actions:", actionsDeleted);
  const contractsDeletion = await Promise.all(
    await client.proposal
      .listContracts()
      .then((l) =>
        l.map((c) =>
          client.proposal.deleteContract(`${c.network}-${c.address}`)
        )
      )
  );
  console.log("Deleted contracts:", contractsDeletion);
  const forksDeletion = await Promise.all(
    await client.network
      .listForkedNetworks()
      .then((l) =>
        l.map((f) => client.network.deleteForkedNetwork(f.forkedNetworkId))
      )
  );
  console.log("Deleted forks:", forksDeletion);

  const notifiesDeleted = await Promise.all(
    await client.notificationChannel
      .list()
      .then((l) =>
        l.map((n) =>
          client.notificationChannel.delete(n.notificationId, n.type)
        )
      )
  );
  console.log("Deleted notification channels:", notifiesDeleted);

  const deploysDeleted = await Promise.all(
    await client.deploy
      .listConfig()
      .then((l) =>
        l.map((c) => client.deploy.removeConfig(c.deploymentConfigId))
      )
  );
  console.log("Deleted deploy configs:", deploysDeleted);
  console.log("total deleted");
  console.table([
    {
      deploys: deploysDeleted.length,
      notifies: notifiesDeleted.length,
      forks: forksDeletion.length,
      contracts: contractsDeletion.length,
      actions: actionsDeleted.length,
      monitors: monitorsDeleted.length,
    },
  ]);
};

main();
