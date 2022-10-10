/* eslint-disable */
import _m0 from "protobufjs/minimal";

export interface ResourceRole {
  id: string;
  fullAccess: boolean;
  fullReadAccess: boolean;
  fullWriteAccess: boolean;
  isActive: boolean;
  legacyId: number;
  name: string;
  nameLower: string;
  selfObtainable: boolean;
}

export interface CreateResourceRoleInput {
  fullAccess: boolean;
  fullReadAccess: boolean;
  fullWriteAccess: boolean;
  isActive: boolean;
  name: string;
  selfObtainable: boolean;
}

export interface ResourceRoleList {
  resourceRoles: ResourceRole[];
}

function createBaseResourceRole(): ResourceRole {
  return {
    id: "",
    fullAccess: false,
    fullReadAccess: false,
    fullWriteAccess: false,
    isActive: false,
    legacyId: 0,
    name: "",
    nameLower: "",
    selfObtainable: false,
  };
}

export const ResourceRole = {
  encode(message: ResourceRole, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.fullAccess === true) {
      writer.uint32(16).bool(message.fullAccess);
    }
    if (message.fullReadAccess === true) {
      writer.uint32(24).bool(message.fullReadAccess);
    }
    if (message.fullWriteAccess === true) {
      writer.uint32(32).bool(message.fullWriteAccess);
    }
    if (message.isActive === true) {
      writer.uint32(40).bool(message.isActive);
    }
    if (message.legacyId !== 0) {
      writer.uint32(48).int32(message.legacyId);
    }
    if (message.name !== "") {
      writer.uint32(58).string(message.name);
    }
    if (message.nameLower !== "") {
      writer.uint32(66).string(message.nameLower);
    }
    if (message.selfObtainable === true) {
      writer.uint32(72).bool(message.selfObtainable);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResourceRole {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResourceRole();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.fullAccess = reader.bool();
          break;
        case 3:
          message.fullReadAccess = reader.bool();
          break;
        case 4:
          message.fullWriteAccess = reader.bool();
          break;
        case 5:
          message.isActive = reader.bool();
          break;
        case 6:
          message.legacyId = reader.int32();
          break;
        case 7:
          message.name = reader.string();
          break;
        case 8:
          message.nameLower = reader.string();
          break;
        case 9:
          message.selfObtainable = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ResourceRole {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      fullAccess: isSet(object.fullAccess) ? Boolean(object.fullAccess) : false,
      fullReadAccess: isSet(object.fullReadAccess) ? Boolean(object.fullReadAccess) : false,
      fullWriteAccess: isSet(object.fullWriteAccess) ? Boolean(object.fullWriteAccess) : false,
      isActive: isSet(object.isActive) ? Boolean(object.isActive) : false,
      legacyId: isSet(object.legacyId) ? Number(object.legacyId) : 0,
      name: isSet(object.name) ? String(object.name) : "",
      nameLower: isSet(object.nameLower) ? String(object.nameLower) : "",
      selfObtainable: isSet(object.selfObtainable) ? Boolean(object.selfObtainable) : false,
    };
  },

  toJSON(message: ResourceRole): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.fullAccess !== undefined && (obj.fullAccess = message.fullAccess);
    message.fullReadAccess !== undefined && (obj.fullReadAccess = message.fullReadAccess);
    message.fullWriteAccess !== undefined && (obj.fullWriteAccess = message.fullWriteAccess);
    message.isActive !== undefined && (obj.isActive = message.isActive);
    message.legacyId !== undefined && (obj.legacyId = Math.round(message.legacyId));
    message.name !== undefined && (obj.name = message.name);
    message.nameLower !== undefined && (obj.nameLower = message.nameLower);
    message.selfObtainable !== undefined && (obj.selfObtainable = message.selfObtainable);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ResourceRole>, I>>(object: I): ResourceRole {
    const message = createBaseResourceRole();
    message.id = object.id ?? "";
    message.fullAccess = object.fullAccess ?? false;
    message.fullReadAccess = object.fullReadAccess ?? false;
    message.fullWriteAccess = object.fullWriteAccess ?? false;
    message.isActive = object.isActive ?? false;
    message.legacyId = object.legacyId ?? 0;
    message.name = object.name ?? "";
    message.nameLower = object.nameLower ?? "";
    message.selfObtainable = object.selfObtainable ?? false;
    return message;
  },
};

function createBaseCreateResourceRoleInput(): CreateResourceRoleInput {
  return {
    fullAccess: false,
    fullReadAccess: false,
    fullWriteAccess: false,
    isActive: false,
    name: "",
    selfObtainable: false,
  };
}

export const CreateResourceRoleInput = {
  encode(message: CreateResourceRoleInput, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.fullAccess === true) {
      writer.uint32(16).bool(message.fullAccess);
    }
    if (message.fullReadAccess === true) {
      writer.uint32(24).bool(message.fullReadAccess);
    }
    if (message.fullWriteAccess === true) {
      writer.uint32(32).bool(message.fullWriteAccess);
    }
    if (message.isActive === true) {
      writer.uint32(40).bool(message.isActive);
    }
    if (message.name !== "") {
      writer.uint32(50).string(message.name);
    }
    if (message.selfObtainable === true) {
      writer.uint32(56).bool(message.selfObtainable);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateResourceRoleInput {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateResourceRoleInput();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.fullAccess = reader.bool();
          break;
        case 3:
          message.fullReadAccess = reader.bool();
          break;
        case 4:
          message.fullWriteAccess = reader.bool();
          break;
        case 5:
          message.isActive = reader.bool();
          break;
        case 6:
          message.name = reader.string();
          break;
        case 7:
          message.selfObtainable = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CreateResourceRoleInput {
    return {
      fullAccess: isSet(object.fullAccess) ? Boolean(object.fullAccess) : false,
      fullReadAccess: isSet(object.fullReadAccess) ? Boolean(object.fullReadAccess) : false,
      fullWriteAccess: isSet(object.fullWriteAccess) ? Boolean(object.fullWriteAccess) : false,
      isActive: isSet(object.isActive) ? Boolean(object.isActive) : false,
      name: isSet(object.name) ? String(object.name) : "",
      selfObtainable: isSet(object.selfObtainable) ? Boolean(object.selfObtainable) : false,
    };
  },

  toJSON(message: CreateResourceRoleInput): unknown {
    const obj: any = {};
    message.fullAccess !== undefined && (obj.fullAccess = message.fullAccess);
    message.fullReadAccess !== undefined && (obj.fullReadAccess = message.fullReadAccess);
    message.fullWriteAccess !== undefined && (obj.fullWriteAccess = message.fullWriteAccess);
    message.isActive !== undefined && (obj.isActive = message.isActive);
    message.name !== undefined && (obj.name = message.name);
    message.selfObtainable !== undefined && (obj.selfObtainable = message.selfObtainable);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<CreateResourceRoleInput>, I>>(object: I): CreateResourceRoleInput {
    const message = createBaseCreateResourceRoleInput();
    message.fullAccess = object.fullAccess ?? false;
    message.fullReadAccess = object.fullReadAccess ?? false;
    message.fullWriteAccess = object.fullWriteAccess ?? false;
    message.isActive = object.isActive ?? false;
    message.name = object.name ?? "";
    message.selfObtainable = object.selfObtainable ?? false;
    return message;
  },
};

function createBaseResourceRoleList(): ResourceRoleList {
  return { resourceRoles: [] };
}

export const ResourceRoleList = {
  encode(message: ResourceRoleList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.resourceRoles) {
      ResourceRole.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResourceRoleList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResourceRoleList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.resourceRoles.push(ResourceRole.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ResourceRoleList {
    return {
      resourceRoles: Array.isArray(object?.resourceRoles)
        ? object.resourceRoles.map((e: any) => ResourceRole.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ResourceRoleList): unknown {
    const obj: any = {};
    if (message.resourceRoles) {
      obj.resourceRoles = message.resourceRoles.map((e) => e ? ResourceRole.toJSON(e) : undefined);
    } else {
      obj.resourceRoles = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ResourceRoleList>, I>>(object: I): ResourceRoleList {
    const message = createBaseResourceRoleList();
    message.resourceRoles = object.resourceRoles?.map((e) => ResourceRole.fromPartial(e)) || [];
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
