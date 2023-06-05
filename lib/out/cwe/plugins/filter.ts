/**
 * Look at resources emitted and filter them out if necessary
 */
import * as hooks from "../../../hooks";

// return non-undefined value to exclude
hooks.out.cwe.excludeResource.tapPromise("InternalCweExcludeResourceFilter", async (event, resource, action) => {
  // console.log(action, node, resource);
  return undefined;
});

// potentially modify the event and return it
hooks.out.cwe.modifyResource.tapPromise("InternalCweModifyResourceFilter", async (event, resource, action) => {
  return event;
});
