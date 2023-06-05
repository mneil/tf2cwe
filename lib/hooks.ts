import { AsyncSeriesBailHook, AsyncSeriesWaterfallHook } from "tapable";
import { ast } from "./in";
import { types } from "./out/cwe";

export const out = {
  cwe: {
    /**
     * Called after a resource has been created but before it is emitted to the final output. Return any
     * value to remove the resource from the final output
     */
    excludeResource: new AsyncSeriesBailHook<[types.Event, ast.Resource, string], undefined | any>([
      "event",
      "resource",
      "action",
    ]),
    modifyResource: new AsyncSeriesWaterfallHook<[types.Event, ast.Resource, string]>(["event", "resource", "action"]),
    finalize: new AsyncSeriesWaterfallHook<[types.Event[]]>(["events"]),
  },
};
