/* eslint-disable */
import {
  CallOptions,
  ChannelCredentials,
  ChannelOptions,
  Client,
  ClientUnaryCall,
  handleUnaryCall,
  makeGenericClientConstructor,
  Metadata,
  ServiceError,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import _m0 from "protobufjs/minimal";
import { LookupCriteria, ScanRequest, ScanResult } from "../common/Common";
import { CreateResourceInput, Resource, ResourceList } from "../resource/Resource";

export interface Payment {
  resourceId: string;
  amount: number;
}

function createBasePayment(): Payment {
  return { resourceId: "", amount: 0 };
}

export const Payment = {
  encode(message: Payment, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.resourceId !== "") {
      writer.uint32(10).string(message.resourceId);
    }
    if (message.amount !== 0) {
      writer.uint32(17).double(message.amount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Payment {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePayment();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.resourceId = reader.string();
          break;
        case 2:
          message.amount = reader.double();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Payment {
    return {
      resourceId: isSet(object.resourceId) ? String(object.resourceId) : "",
      amount: isSet(object.amount) ? Number(object.amount) : 0,
    };
  },

  toJSON(message: Payment): unknown {
    const obj: any = {};
    message.resourceId !== undefined && (obj.resourceId = message.resourceId);
    message.amount !== undefined && (obj.amount = message.amount);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Payment>, I>>(object: I): Payment {
    const message = createBasePayment();
    message.resourceId = object.resourceId ?? "";
    message.amount = object.amount ?? 0;
    return message;
  },
};

export type ResourceService = typeof ResourceService;
export const ResourceService = {
  scan: {
    path: "/topcoder.domain.resource_service.Resource/Scan",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: ScanRequest) => Buffer.from(ScanRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => ScanRequest.decode(value),
    responseSerialize: (value: ScanResult) => Buffer.from(ScanResult.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ScanResult.decode(value),
  },
  lookup: {
    path: "/topcoder.domain.resource_service.Resource/Lookup",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: LookupCriteria) => Buffer.from(LookupCriteria.encode(value).finish()),
    requestDeserialize: (value: Buffer) => LookupCriteria.decode(value),
    responseSerialize: (value: Resource) => Buffer.from(Resource.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Resource.decode(value),
  },
  create: {
    path: "/topcoder.domain.resource_service.Resource/Create",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateResourceInput) => Buffer.from(CreateResourceInput.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateResourceInput.decode(value),
    responseSerialize: (value: Resource) => Buffer.from(Resource.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Resource.decode(value),
  },
  /** rpc addPayment(Payment) returns { boolean } */
  delete: {
    path: "/topcoder.domain.resource_service.Resource/Delete",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: LookupCriteria) => Buffer.from(LookupCriteria.encode(value).finish()),
    requestDeserialize: (value: Buffer) => LookupCriteria.decode(value),
    responseSerialize: (value: ResourceList) => Buffer.from(ResourceList.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ResourceList.decode(value),
  },
} as const;

export interface ResourceServer extends UntypedServiceImplementation {
  scan: handleUnaryCall<ScanRequest, ScanResult>;
  lookup: handleUnaryCall<LookupCriteria, Resource>;
  create: handleUnaryCall<CreateResourceInput, Resource>;
  /** rpc addPayment(Payment) returns { boolean } */
  delete: handleUnaryCall<LookupCriteria, ResourceList>;
}

export interface ResourceClient extends Client {
  scan(request: ScanRequest, callback: (error: ServiceError | null, response: ScanResult) => void): ClientUnaryCall;
  scan(
    request: ScanRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ScanResult) => void,
  ): ClientUnaryCall;
  scan(
    request: ScanRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ScanResult) => void,
  ): ClientUnaryCall;
  lookup(request: LookupCriteria, callback: (error: ServiceError | null, response: Resource) => void): ClientUnaryCall;
  lookup(
    request: LookupCriteria,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Resource) => void,
  ): ClientUnaryCall;
  lookup(
    request: LookupCriteria,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Resource) => void,
  ): ClientUnaryCall;
  create(
    request: CreateResourceInput,
    callback: (error: ServiceError | null, response: Resource) => void,
  ): ClientUnaryCall;
  create(
    request: CreateResourceInput,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Resource) => void,
  ): ClientUnaryCall;
  create(
    request: CreateResourceInput,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Resource) => void,
  ): ClientUnaryCall;
  /** rpc addPayment(Payment) returns { boolean } */
  delete(
    request: LookupCriteria,
    callback: (error: ServiceError | null, response: ResourceList) => void,
  ): ClientUnaryCall;
  delete(
    request: LookupCriteria,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ResourceList) => void,
  ): ClientUnaryCall;
  delete(
    request: LookupCriteria,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ResourceList) => void,
  ): ClientUnaryCall;
}

export const ResourceClient = makeGenericClientConstructor(
  ResourceService,
  "topcoder.domain.resource_service.Resource",
) as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ChannelOptions>): ResourceClient;
  service: typeof ResourceService;
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
