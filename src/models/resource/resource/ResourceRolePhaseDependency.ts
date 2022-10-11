/* eslint-disable */
import _m0 from "protobufjs/minimal";

export interface ResourceRolePhaseDependency {
  id: string;
  phaseId: string;
  phaseState: boolean;
  resourceRoleId: string;
}

export interface CreateResourceRolePhaseDependencyInput {
  phaseId: string;
  phaseState: boolean;
  resourceRoleId: string;
}

export interface ResourceRolePhaseDependencyList {
  resourceRolePhaseDependencies: ResourceRolePhaseDependency[];
}

function createBaseResourceRolePhaseDependency(): ResourceRolePhaseDependency {
  return { id: "", phaseId: "", phaseState: false, resourceRoleId: "" };
}

export const ResourceRolePhaseDependency = {
  encode(message: ResourceRolePhaseDependency, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.phaseId !== "") {
      writer.uint32(18).string(message.phaseId);
    }
    if (message.phaseState === true) {
      writer.uint32(24).bool(message.phaseState);
    }
    if (message.resourceRoleId !== "") {
      writer.uint32(34).string(message.resourceRoleId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResourceRolePhaseDependency {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResourceRolePhaseDependency();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.phaseId = reader.string();
          break;
        case 3:
          message.phaseState = reader.bool();
          break;
        case 4:
          message.resourceRoleId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ResourceRolePhaseDependency {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      phaseId: isSet(object.phaseId) ? String(object.phaseId) : "",
      phaseState: isSet(object.phaseState) ? Boolean(object.phaseState) : false,
      resourceRoleId: isSet(object.resourceRoleId) ? String(object.resourceRoleId) : "",
    };
  },

  toJSON(message: ResourceRolePhaseDependency): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.phaseId !== undefined && (obj.phaseId = message.phaseId);
    message.phaseState !== undefined && (obj.phaseState = message.phaseState);
    message.resourceRoleId !== undefined && (obj.resourceRoleId = message.resourceRoleId);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ResourceRolePhaseDependency>, I>>(object: I): ResourceRolePhaseDependency {
    const message = createBaseResourceRolePhaseDependency();
    message.id = object.id ?? "";
    message.phaseId = object.phaseId ?? "";
    message.phaseState = object.phaseState ?? false;
    message.resourceRoleId = object.resourceRoleId ?? "";
    return message;
  },
};

function createBaseCreateResourceRolePhaseDependencyInput(): CreateResourceRolePhaseDependencyInput {
  return { phaseId: "", phaseState: false, resourceRoleId: "" };
}

export const CreateResourceRolePhaseDependencyInput = {
  encode(message: CreateResourceRolePhaseDependencyInput, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.phaseId !== "") {
      writer.uint32(10).string(message.phaseId);
    }
    if (message.phaseState === true) {
      writer.uint32(16).bool(message.phaseState);
    }
    if (message.resourceRoleId !== "") {
      writer.uint32(26).string(message.resourceRoleId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateResourceRolePhaseDependencyInput {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateResourceRolePhaseDependencyInput();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.phaseId = reader.string();
          break;
        case 2:
          message.phaseState = reader.bool();
          break;
        case 3:
          message.resourceRoleId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CreateResourceRolePhaseDependencyInput {
    return {
      phaseId: isSet(object.phaseId) ? String(object.phaseId) : "",
      phaseState: isSet(object.phaseState) ? Boolean(object.phaseState) : false,
      resourceRoleId: isSet(object.resourceRoleId) ? String(object.resourceRoleId) : "",
    };
  },

  toJSON(message: CreateResourceRolePhaseDependencyInput): unknown {
    const obj: any = {};
    message.phaseId !== undefined && (obj.phaseId = message.phaseId);
    message.phaseState !== undefined && (obj.phaseState = message.phaseState);
    message.resourceRoleId !== undefined && (obj.resourceRoleId = message.resourceRoleId);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<CreateResourceRolePhaseDependencyInput>, I>>(
    object: I,
  ): CreateResourceRolePhaseDependencyInput {
    const message = createBaseCreateResourceRolePhaseDependencyInput();
    message.phaseId = object.phaseId ?? "";
    message.phaseState = object.phaseState ?? false;
    message.resourceRoleId = object.resourceRoleId ?? "";
    return message;
  },
};

function createBaseResourceRolePhaseDependencyList(): ResourceRolePhaseDependencyList {
  return { resourceRolePhaseDependencies: [] };
}

export const ResourceRolePhaseDependencyList = {
  encode(message: ResourceRolePhaseDependencyList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.resourceRolePhaseDependencies) {
      ResourceRolePhaseDependency.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResourceRolePhaseDependencyList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResourceRolePhaseDependencyList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.resourceRolePhaseDependencies.push(ResourceRolePhaseDependency.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ResourceRolePhaseDependencyList {
    return {
      resourceRolePhaseDependencies: Array.isArray(object?.resourceRolePhaseDependencies)
        ? object.resourceRolePhaseDependencies.map((e: any) => ResourceRolePhaseDependency.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ResourceRolePhaseDependencyList): unknown {
    const obj: any = {};
    if (message.resourceRolePhaseDependencies) {
      obj.resourceRolePhaseDependencies = message.resourceRolePhaseDependencies.map((e) =>
        e ? ResourceRolePhaseDependency.toJSON(e) : undefined
      );
    } else {
      obj.resourceRolePhaseDependencies = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ResourceRolePhaseDependencyList>, I>>(
    object: I,
  ): ResourceRolePhaseDependencyList {
    const message = createBaseResourceRolePhaseDependencyList();
    message.resourceRolePhaseDependencies =
      object.resourceRolePhaseDependencies?.map((e) => ResourceRolePhaseDependency.fromPartial(e)) || [];
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends { $case: string } ? { [K in keyof Omit<T, "$case">]?: DeepPartial<T[K]> } & { $case: T["$case"] }
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
