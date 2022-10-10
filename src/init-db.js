/**
 * Initialize database tables. All data will be cleared.
 */

require("./app-bootstrap");
const logger = require("./common/logger");
const helper = require("./common/helper");

logger.info("Initialize database.");

const initDB = async () => {
  const roles = await helper.scan("ResourceRole");
  for (const role of roles) {
    await role.delete();
  }
  const resources = await helper.scan("Resource");
  for (const resource of resources) {
    await resource.delete();
  }
  const dependencies = await helper.scan("ResourceRolePhaseDependency");
  for (const d of dependencies) {
    await d.delete();
  }
};

initDB()
  .then(() => {
    logger.info("Done!");
    process.exit();
  })
  .catch((e) => {
    logger.logFullError(e);
    process.exit(1);
  });
