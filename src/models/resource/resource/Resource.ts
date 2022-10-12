/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export interface Resource {
  id: string;
  challengeId: string;
  created: number;
  createdBy: string;
  legacyId?: number | undefined;
  memberHandle: string;
  memberId: string;
  roleId: string;
  updated?: number | undefined;
  updatedBy?: string | undefined;
}

export interface CreateResourceInput {
  challengeId: string;
  memberHandle: string;
  memberId: string;
  roleId: string;
  paymentAmount?: number | undefined;
}

export interface ResourceList {
  resources: Resource[];
}

function createBaseResource(): Resource {
  return {
    id: "",
    challengeId: "",
    created: 0,
    createdBy: "",
    legacyId: undefined,
    memberHandle: "",
    memberId: "",
    roleId: "",
    updated: undefined,
    updatedBy: undefined,
  };
}

export const Resource = {
  encode(message: Resource, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.challengeId !== "") {
      writer.uint32(18).string(message.challengeId);
    }
    if (message.created !== 0) {
      writer.uint32(24).int64(message.created);
    }
    if (message.createdBy !== "") {
      writer.uint32(34).string(message.createdBy);
    }
    if (message.legacyId !== undefined) {
      writer.uint32(40).int32(message.legacyId);
    }
    if (message.memberHandle !== "") {
      writer.uint32(50).string(message.memberHandle);
    }
    if (message.memberId !== "") {
      writer.uint32(58).string(message.memberId);
    }
    if (message.roleId !== "") {
      writer.uint32(66).string(message.roleId);
    }
    if (message.updated !== undefined) {
      writer.uint32(72).int64(message.updated);
    }
    if (message.updatedBy !== undefined) {
      writer.uint32(82).string(message.updatedBy);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Resource {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResource();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.challengeId = reader.string();
          break;
        case 3:
          message.created = longToNumber(reader.int64() as Long);
          break;
        case 4:
          message.createdBy = reader.string();
          break;
        case 5:
          message.legacyId = reader.int32();
          break;
        case 6:
          message.memberHandle = reader.string();
          break;
        case 7:
          message.memberId = reader.string();
          break;
        case 8:
          message.roleId = reader.string();
          break;
        case 9:
          message.updated = longToNumber(reader.int64() as Long);
          break;
        case 10:
          message.updatedBy = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Resource {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      challengeId: isSet(object.challengeId) ? String(object.challengeId) : "",
      created: isSet(object.created) ? Number(object.created) : 0,
      createdBy: isSet(object.createdBy) ? String(object.createdBy) : "",
      legacyId: isSet(object.legacyId) ? Number(object.legacyId) : undefined,
      memberHandle: isSet(object.memberHandle) ? String(object.memberHandle) : "",
      memberId: isSet(object.memberId) ? String(object.memberId) : "",
      roleId: isSet(object.roleId) ? String(object.roleId) : "",
      updated: isSet(object.updated) ? Number(object.updated) : undefined,
      updatedBy: isSet(object.updatedBy) ? String(object.updatedBy) : undefined,
    };
  },

  toJSON(message: Resource): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.challengeId !== undefined && (obj.challengeId = message.challengeId);
    message.created !== undefined && (obj.created = Math.round(message.created));
    message.createdBy !== undefined && (obj.createdBy = message.createdBy);
    message.legacyId !== undefined && (obj.legacyId = Math.round(message.legacyId));
    message.memberHandle !== undefined && (obj.memberHandle = message.memberHandle);
    message.memberId !== undefined && (obj.memberId = message.memberId);
    message.roleId !== undefined && (obj.roleId = message.roleId);
    message.updated !== undefined && (obj.updated = Math.round(message.updated));
    message.updatedBy !== undefined && (obj.updatedBy = message.updatedBy);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Resource>, I>>(object: I): Resource {
    const message = createBaseResource();
    message.id = object.id ?? "";
    message.challengeId = object.challengeId ?? "";
    message.created = object.created ?? 0;
    message.createdBy = object.createdBy ?? "";
    message.legacyId = object.legacyId ?? undefined;
    message.memberHandle = object.memberHandle ?? "";
    message.memberId = object.memberId ?? "";
    message.roleId = object.roleId ?? "";
    message.updated = object.updated ?? undefined;
    message.updatedBy = object.updatedBy ?? undefined;
    return message;
  },
};

function createBaseCreateResourceInput(): CreateResourceInput {
  return { challengeId: "", memberHandle: "", memberId: "", roleId: "", paymentAmount: undefined };
}

export const CreateResourceInput = {
  encode(message: CreateResourceInput, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.challengeId !== "") {
      writer.uint32(10).string(message.challengeId);
    }
    if (message.memberHandle !== "") {
      writer.uint32(18).string(message.memberHandle);
    }
    if (message.memberId !== "") {
      writer.uint32(26).string(message.memberId);
    }
    if (message.roleId !== "") {
      writer.uint32(34).string(message.roleId);
    }
    if (message.paymentAmount !== undefined) {
      writer.uint32(41).double(message.paymentAmount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateResourceInput {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateResourceInput();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.challengeId = reader.string();
          break;
        case 2:
          message.memberHandle = reader.string();
          break;
        case 3:
          message.memberId = reader.string();
          break;
        case 4:
          message.roleId = reader.string();
          break;
        case 5:
          message.paymentAmount = reader.double();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CreateResourceInput {
    return {
      challengeId: isSet(object.challengeId) ? String(object.challengeId) : "",
      memberHandle: isSet(object.memberHandle) ? String(object.memberHandle) : "",
      memberId: isSet(object.memberId) ? String(object.memberId) : "",
      roleId: isSet(object.roleId) ? String(object.roleId) : "",
      paymentAmount: isSet(object.paymentAmount) ? Number(object.paymentAmount) : undefined,
    };
  },

  toJSON(message: CreateResourceInput): unknown {
    const obj: any = {};
    message.challengeId !== undefined && (obj.challengeId = message.challengeId);
    message.memberHandle !== undefined && (obj.memberHandle = message.memberHandle);
    message.memberId !== undefined && (obj.memberId = message.memberId);
    message.roleId !== undefined && (obj.roleId = message.roleId);
    message.paymentAmount !== undefined && (obj.paymentAmount = message.paymentAmount);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<CreateResourceInput>, I>>(object: I): CreateResourceInput {
    const message = createBaseCreateResourceInput();
    message.challengeId = object.challengeId ?? "";
    message.memberHandle = object.memberHandle ?? "";
    message.memberId = object.memberId ?? "";
    message.roleId = object.roleId ?? "";
    message.paymentAmount = object.paymentAmount ?? undefined;
    return message;
  },
};

function createBaseResourceList(): ResourceList {
  return { resources: [] };
}

export const ResourceList = {
  encode(message: ResourceList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.resources) {
      Resource.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResourceList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResourceList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.resources.push(Resource.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ResourceList {
    return {
      resources: Array.isArray(object?.resources) ? object.resources.map((e: any) => Resource.fromJSON(e)) : [],
    };
  },

  toJSON(message: ResourceList): unknown {
    const obj: any = {};
    if (message.resources) {
      obj.resources = message.resources.map((e) => e ? Resource.toJSON(e) : undefined);
    } else {
      obj.resources = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ResourceList>, I>>(object: I): ResourceList {
    const message = createBaseResourceList();
    message.resources = object.resources?.map((e) => Resource.fromPartial(e)) || [];
    return message;
  },
};

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends { $case: string } ? { [K in keyof Omit<T, "$case">]?: DeepPartial<T[K]> } & { $case: T["$case"] }
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
